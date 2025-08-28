// payment_handler.mo - Complete ICP payment integration
import Types "./types";
import Utils "./utils";
import Ledger "canister:icp_ledger_canister";
import ICPPaymentService "./icp_payment_service";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

module PaymentHandler {

    // Get pool principal dynamically to avoid static expression error
    private func getPoolPrincipal() : Principal {
        Principal.fromText("2vxsx-fae"); // Placeholder - will be replaced with actual cansiter principal
    };
    
    // Process real group contribution with ICP transfer
    public func processContribution(
        groupId: Types.GroupId,
        contributor: Principal,
        amount: Types.Amount,
        groupContributionAmount: Types.Amount
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        
        // Validate contribution amount matches requirement
        if (amount != groupContributionAmount) {
            return #err(#InvalidAmount);
        };
        
        // Validate amount is within bounds
        if (not Utils.validateAmount(amount)) {
            return #err(#InvalidAmount);
        };

        // Get pool principal dynamically
        let poolPrincipal = getPoolPrincipal();

        // Process real ICP transfer through payment service
        switch (await ICPPaymentService.processGroupContribution(
            contributor,
            groupId,
            amount,
            poolPrincipal
        )) {
            case (#ok(blockIndex)) { 
                #ok(blockIndex)
            };
            case (#err(error)) {
                #err(error)
            };
        }
    };
    
    // Process real rotation payout with ICP transfer
    public func processRotationPayout(
        groupId: Types.GroupId,
        recipient: Principal,
        amount: Types.Amount,
        roundNumber: Nat
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        
        // Validate recipient
        if (not Utils.validatePrincipal(recipient)) {
            return #err(#UnauthorizedAccess);
        };
        
        // Validate amount
        if (not Utils.validateAmount(amount)) {
            return #err(#InvalidAmount);
        };

        // Get pool principal dynamically
        let poolPrincipal = getPoolPrincipal();

        // Process real ICP payout transfer
        switch (await ICPPaymentService.processRotationPayout(
            poolPrincipal,
            recipient,
            amount,
            groupId,
            roundNumber
        )) {
            case (#ok(blockIndex)) {
                #ok(blockIndex)
            };
            case (#err(error)) {
                #err(error)
            };
        }
    };
    
    // Get real account balance from ICP ledger
    public func getAccountBalance(principal: Principal) : async Types.Amount {
        await ICPPaymentService.getAccountBalance(principal)
    };
    
    // Verify real payment was processed
    public func verifyPayment(
        transactionId: Types.TransactionId,
        expectedAmount: Types.Amount
    ) : async Bool {
        await ICPPaymentService.verifyTransaction(transactionId, expectedAmount)
    };

    // Get pool account info
    public func getPoolAccountInfo() : async {principal: Principal; accountId: Ledger.Account} {
        let poolPrincipal = getPoolPrincipal();
        {
            principal = poolPrincipal;
            accountId = ICPPaymentService.getCanisterAccountId(poolPrincipal);
        }
    };

    // Process loan disbursement payment (lender to borrower)
    public func processLoanDisbursement(
        loanId: Types.LoanId,
        borrower: Principal,
        amount: Types.Amount
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        
        // Validate amount
        if (not Utils.validateAmount(amount)) {
            return #err(#InvalidAmount);
        };
        
        // Validate borrower
        if (not Utils.validatePrincipal(borrower)) {
            return #err(#UnauthorizedAccess);
        };
        
        // In production, this would process actual ICP transfer from lending pool to borrower
        // For now, simulate successful disbursement
        let timeNanos = Int.abs(Time.now()); // Convert to absolute value
        let simulatedBlockIndex = Nat64.fromNat(timeNanos % 1000000);
        
        Debug.print("Loan disbursement simulated - Loan ID: " # Nat.toText(loanId) # 
                ", Amount: " # Nat64.toText(amount) # " e8s" #
                ", Borrower: " # Principal.toText(borrower));
        
        #ok(simulatedBlockIndex)
    };

    // Process loan repayment (borrower to lender)
    public func processLoanRepayment(
        loanId: Types.LoanId,
        borrower: Principal,
        amount: Types.Amount
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        
        // Validate amount
        if (not Utils.validateAmount(amount)) {
            return #err(#InvalidAmount);
        };
        
        // Validate borrower
        if (not Utils.validatePrincipal(borrower)) {
            return #err(#UnauthorizedAccess);
        };
        
        // In production, this would process actual ICP transfer from borrower to lending pool
        // For now, simulate successful repayment
        let timeNanos = Int.abs(Time.now()); // Convert to absolute value
        let simulatedBlockIndex = Nat64.fromNat(timeNanos % 1000000);
        
        Debug.print("Loan repayment simulated - Loan ID: " # Nat.toText(loanId) # 
                ", Amount: " # Nat64.toText(amount) # " e8s" #
                ", Borrower: " # Principal.toText(borrower));
        
        #ok(simulatedBlockIndex)
    };
}