// lending_engine.mo - Cross-group lending system with R Token collateral
import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import RBTree "mo:base/RBTree";
import Iter "mo:base/Iter";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";

import Types "./types";
import Utils "./utils";

module LendingEngine {

    // ==================== TYPE ALIASES ====================
    public type LoanId = Types.LoanId;
    public type Loan = Types.Loan;
    public type LoanRequest = Types.LoanRequest;
    public type LoanStatus = Types.LoanStatus;
    public type LoanPayment = Types.LoanPayment;
    public type Amount = Types.Amount;
    public type RTokenId = Types.RTokenId;
    public type Error = Types.Error;

    // ==================== LENDING ENGINE CLASS ====================
    
    public class LendingEngine() {
        
        // ==================== NON-STABLE VARIABLES ====================
        private var loanCounter: LoanId = 0;
        private var paymentCounter: Types.TransactionId = 0;
        
        // ==================== RUNTIME STATE ====================
        private var loans = RBTree.RBTree<LoanId, Loan>(Nat.compare);
        private var payments = RBTree.RBTree<Types.TransactionId, LoanPayment>(Nat64.compare);
        
        // Borrower index: Principal -> [LoanId]
        private var borrowerLoans = RBTree.RBTree<Principal, Buffer.Buffer<LoanId>>(Principal.compare);
        
        // Collateral tracking: RTokenId -> LoanId
        private var collateralRegistry = RBTree.RBTree<RTokenId, LoanId>(Nat.compare);
        
        // Group loan tracking: GroupId -> [LoanId]
        private var groupLoans = RBTree.RBTree<Types.GroupId, Buffer.Buffer<LoanId>>(Nat.compare);

        // ==================== LENDING CONSTANTS ====================
        
        private let MINIMUM_COLLATERAL_RATIO: Nat = 12000; // 120% in basis points
        private let MAXIMUM_LOAN_TERM_DAYS: Nat = 365;     // 1 year maximum
        private let MINIMUM_LOAN_AMOUNT: Amount = 1_000_000; // 0.01 ICP minimum
        private let DEFAULT_INTEREST_RATE: Nat = 1200;     // 12% annually
        private let GRACE_PERIOD_DAYS: Nat = 7;            // Grace period for missed payments

        // ==================== INITIALIZATION ====================
        
        public func initializeFromState(
            loanEntries: [(LoanId, Loan)],
            paymentEntries: [(Types.TransactionId, LoanPayment)]
        ) {
            // Batch load loans
            for ((id, loan) in loanEntries.vals()) {
                loans.put(id, loan);
                if (id >= loanCounter) {
                    loanCounter := id + 1;
                };
            };
            
            // Batch load payments
            for ((id, payment) in paymentEntries.vals()) {
                payments.put(id, payment);
                if (id >= paymentCounter) {
                    paymentCounter := id + 1;
                };
            };
            
            // Rebuild indexes
            rebuildIndexes();
        };
        
        private func rebuildIndexes() {
            for ((loanId, loan) in loans.entries()) {
                // Borrower index
                addToBorrowerIndex(loan.borrower, loanId);
                
                // Group index
                addToGroupIndex(loan.borrowerGroupId, loanId);
                
                // Collateral registry
                for (tokenId in loan.collateralTokenIds.vals()) {
                    collateralRegistry.put(tokenId, loanId);
                };
            };
        };
        
        private func addToBorrowerIndex(borrower: Principal, loanId: LoanId) {
            switch (borrowerLoans.get(borrower)) {
                case (?loanBuffer) {
                    loanBuffer.add(loanId);
                };
                case null {
                    let newBuffer = Buffer.Buffer<LoanId>(5);
                    newBuffer.add(loanId);
                    borrowerLoans.put(borrower, newBuffer);
                };
            };
        };
        
        private func addToGroupIndex(groupId: Types.GroupId, loanId: LoanId) {
            switch (groupLoans.get(groupId)) {
                case (?loanBuffer) {
                    loanBuffer.add(loanId);
                };
                case null {
                    let newBuffer = Buffer.Buffer<LoanId>(10);
                    newBuffer.add(loanId);
                    groupLoans.put(groupId, newBuffer);
                };
            };
        };

        // ==================== LOAN REQUEST AND APPROVAL ====================
        
        // Create a new loan request
        public func requestLoan(
            borrower: Principal,
            borrowerGroupId: Types.GroupId,
            request: LoanRequest,
            rTokenValues: [(RTokenId, Amount)] // Current values of collateral tokens
        ) : Result.Result<LoanId, Error> {
            
            // Validate loan request
            switch (validateLoanRequest(borrower, request, rTokenValues)) {
                case (#ok(_)) { };
                case (#err(error)) { return #err(error) };
            };
            
            // Calculate terms
            let interestRate = switch (request.interestRate) {
                case (?rate) { rate };
                case null { calculateDynamicInterestRate(borrower, request.principalAmount) };
            };
            
            let collateralValue = Array.foldLeft<(RTokenId, Amount), Amount>(
                rTokenValues, 0, func(acc, (_, value)) = acc + value
            );
            
            let dueDate = Time.now() + Utils.daysToNanos(request.termDays);
            let loanId = loanCounter;
            loanCounter += 1;
            
            // Create loan record
            let loan: Loan = {
                id = loanId;
                borrower = borrower;
                lender = null; // Platform lending pool
                borrowerGroupId = borrowerGroupId;
                lenderGroupId = null;
                
                principalAmount = request.principalAmount;
                interestRate = interestRate;
                termDays = request.termDays;
                
                collateralTokenIds = request.collateralTokenIds;
                collateralValue = collateralValue;
                collateralRatio = calculateCollateralRatio(collateralValue, request.principalAmount);
                
                status = #pending;
                disbursedAmount = 0;
                remainingBalance = 0;
                accruedInterest = 0;
                
                createdAt = Time.now();
                approvedAt = null;
                disbursedAt = null;
                dueDate = ?dueDate;
                lastPaymentDate = null;
                
                totalPaid = 0;
                missedPayments = 0;
                
                memo = request.memo;
            };
            
            // Store loan
            loans.put(loanId, loan);
            
            // Update indexes
            addToBorrowerIndex(borrower, loanId);
            addToGroupIndex(borrowerGroupId, loanId);
            
            // Register collateral
            for (tokenId in request.collateralTokenIds.vals()) {
                collateralRegistry.put(tokenId, loanId);
            };
            
            Debug.print("Loan request created - ID: " # Nat.toText(loanId) # 
                       ", Borrower: " # Principal.toText(borrower) #
                       ", Amount: " # Nat64.toText(request.principalAmount) # " e8s");
            
            #ok(loanId)
        };
        
        // Approve a pending loan
        public func approveLoan(
            loanId: LoanId,
            approver: Principal
        ) : Result.Result<Bool, Error> {
            switch (loans.get(loanId)) {
                case (?loan) {
                    if (loan.status != #pending) {
                        return #err(#InvalidLoanTerm);
                    };
                    
                    // Calculate total amount due (principal + interest)
                    let totalInterest = calculateTotalInterest(
                        loan.principalAmount, 
                        loan.interestRate, 
                        loan.termDays
                    );
                    
                    let approvedLoan = {
                        loan with
                        status = #approved;
                        approvedAt = ?Time.now();
                        remainingBalance = loan.principalAmount + totalInterest;
                    };
                    
                    loans.put(loanId, approvedLoan);
                    
                    Debug.print("Loan approved - ID: " # Nat.toText(loanId) # 
                               ", Total due: " # Nat64.toText(approvedLoan.remainingBalance) # " e8s");
                    
                    #ok(true)
                };
                case null { #err(#LoanNotFound) };
            }
        };
        
        // Reject a pending loan
        public func rejectLoan(
            loanId: LoanId,
            rejector: Principal,
            reason: ?Text
        ) : Result.Result<Bool, Error> {
            switch (loans.get(loanId)) {
                case (?loan) {
                    if (loan.status != #pending) {
                        return #err(#InvalidLoanTerm);
                    };
                    
                    // Remove from storage (rejected loans are not kept)
                    loans.delete(loanId);
                    
                    // Remove from indexes
                    removeLoanFromIndexes(loan);
                    
                    Debug.print("Loan rejected - ID: " # Nat.toText(loanId) # 
                               ", Reason: " # Utils.textOption(reason));
                    
                    #ok(true)
                };
                case null { #err(#LoanNotFound) };
            }
        };

        // ==================== LOAN VALIDATION ====================
        
        private func validateLoanRequest(
            borrower: Principal,
            request: LoanRequest,
            rTokenValues: [(RTokenId, Amount)]
        ) : Result.Result<Bool, Error> {
            
            // Validate borrower
            if (not Utils.validatePrincipal(borrower)) {
                return #err(#UnauthorizedAccess);
            };
            
            // Validate loan amount
            if (request.principalAmount < MINIMUM_LOAN_AMOUNT) {
                return #err(#InvalidAmount);
            };
            
            // Validate loan term
            if (request.termDays == 0 or request.termDays > MAXIMUM_LOAN_TERM_DAYS) {
                return #err(#InvalidLoanTerm);
            };
            
            // Validate collateral tokens exist and match request
            if (request.collateralTokenIds.size() == 0 or 
                request.collateralTokenIds.size() != rTokenValues.size()) {
                return #err(#InsufficientCollateral);
            };
            
            // Check if collateral tokens are already locked
            for (tokenId in request.collateralTokenIds.vals()) {
                switch (collateralRegistry.get(tokenId)) {
                    case (?existingLoanId) {
                        // Token already used as collateral
                        return #err(#CollateralLocked);
                    };
                    case null { /* Token available */ };
                };
            };
            
            // Calculate total collateral value
            let totalCollateralValue = Array.foldLeft<(RTokenId, Amount), Amount>(
                rTokenValues, 0, func(acc, (_, value)) = acc + value
            );
            
            // Validate collateral ratio
            let collateralRatio = calculateCollateralRatio(totalCollateralValue, request.principalAmount);
            if (collateralRatio < MINIMUM_COLLATERAL_RATIO) {
                return #err(#InsufficientCollateral);
            };
            
            #ok(true)
        };
        
        // Calculate collateral ratio in basis points
        private func calculateCollateralRatio(collateralValue: Amount, loanAmount: Amount) : Nat {
            if (loanAmount == 0) { return 0 };
            Nat64.toNat((collateralValue * 10_000) / loanAmount)
        };

        // ==================== INTEREST CALCULATIONS ====================
        
        // Calculate dynamic interest rate based on borrower profile
        private func calculateDynamicInterestRate(borrower: Principal, amount: Amount) : Nat {
            // Simplified risk assessment - in production would consider:
            // - Borrower's contribution history
            // - Group participation record
            // - Current market conditions
            // - Loan amount and term
            
            var baseRate = DEFAULT_INTEREST_RATE;
            
            // Risk adjustments
            let borrowerHistory = getBorrowerHistory(borrower);
            if (borrowerHistory.totalLoans > 3 and borrowerHistory.defaultCount == 0) {
                baseRate := baseRate - 200; // 2% discount for good history
            };
            
            // Amount-based adjustment
            if (amount >= 100_000_000_000) { // >= 1000 ICP
                baseRate := baseRate - 100; // 1% discount for large loans
            };
            
            // Ensure minimum rate
            Nat.max(baseRate, 600) // Minimum 6% annually
        };
        
        // Calculate total interest for loan term
        private func calculateTotalInterest(principal: Amount, annualRate: Nat, termDays: Nat) : Amount {
            let dailyRate = Float.fromInt(annualRate) / 10_000.0 / 365.0;
            let totalRate = dailyRate * Float.fromInt(termDays);
            let interestFloat = Float.fromInt64(Int64.fromNat64(principal)) * totalRate;
            Nat64.fromNat(Int.abs(Float.toInt(interestFloat)))
        };

        // ==================== QUERY FUNCTIONS ====================
        
        // Get loan by ID
        public func getLoan(loanId: LoanId) : ?Loan {
            loans.get(loanId)
        };
        
        // Get loans for borrower
        public func getBorrowerLoans(borrower: Principal) : [Loan] {
            switch (borrowerLoans.get(borrower)) {
                case (?loanBuffer) {
                    let loanList = Buffer.Buffer<Loan>(loanBuffer.size());
                    for (loanId in loanBuffer.vals()) {
                        switch (loans.get(loanId)) {
                            case (?loan) { loanList.add(loan) };
                            case null { };
                        };
                    };
                    Buffer.toArray(loanList)
                };
                case null { [] };
            }
        };
        
        // Get loans for group
        public func getGroupLoans(groupId: Types.GroupId) : [Loan] {
            switch (groupLoans.get(groupId)) {
                case (?loanBuffer) {
                    let loanList = Buffer.Buffer<Loan>(loanBuffer.size());
                    for (loanId in loanBuffer.vals()) {
                        switch (loans.get(loanId)) {
                            case (?loan) { loanList.add(loan) };
                            case null { };
                        };
                    };
                    Buffer.toArray(loanList)
                };
                case null { [] };
            }
        };
        
        // Check if R Token is locked as collateral
        public func isTokenLocked(tokenId: RTokenId) : ?LoanId {
            collateralRegistry.get(tokenId)
        };
        
        // Get borrower credit history
        private func getBorrowerHistory(borrower: Principal) : {totalLoans: Nat; defaultCount: Nat; totalBorrowed: Amount} {
            let borrowerLoanList = getBorrowerLoans(borrower);
            var totalLoans = borrowerLoanList.size();
            var defaultCount = 0;
            var totalBorrowed: Amount = 0;
            
            for (loan in borrowerLoanList.vals()) {
                totalBorrowed += loan.principalAmount;
                if (loan.status == #defaulted) {
                    defaultCount += 1;
                };
            };
            
            {totalLoans = totalLoans; defaultCount = defaultCount; totalBorrowed = totalBorrowed}
        };

        // ==================== UTILITY FUNCTIONS ====================
        
        private func removeLoanFromIndexes(loan: Loan) {
            // Remove from borrower index
            switch (borrowerLoans.get(loan.borrower)) {
                case (?loanBuffer) {
                    let newBuffer = Buffer.Buffer<LoanId>(loanBuffer.size());
                    for (loanId in loanBuffer.vals()) {
                        if (loanId != loan.id) {
                            newBuffer.add(loanId);
                        };
                    };
                    borrowerLoans.put(loan.borrower, newBuffer);
                };
                case null { };
            };
            
            // Remove from group index
            switch (groupLoans.get(loan.borrowerGroupId)) {
                case (?loanBuffer) {
                    let newBuffer = Buffer.Buffer<LoanId>(loanBuffer.size());
                    for (loanId in loanBuffer.vals()) {
                        if (loanId != loan.id) {
                            newBuffer.add(loanId);
                        };
                    };
                    groupLoans.put(loan.borrowerGroupId, newBuffer);
                };
                case null { };
            };
            
            // Remove from collateral registry
            for (tokenId in loan.collateralTokenIds.vals()) {
                collateralRegistry.delete(tokenId);
            };
        };

        // ==================== STATE EXPORT FOR UPGRADES ====================
        
        public func exportState() : ([(LoanId, Loan)], [(Types.TransactionId, LoanPayment)]) {
            let loanEntries = Iter.toArray(loans.entries());
            let paymentEntries = Iter.toArray(payments.entries());
            (loanEntries, paymentEntries)
        };
    }
}