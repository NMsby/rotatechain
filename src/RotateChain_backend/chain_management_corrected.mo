// main.mo
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
//import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Array "mo:base/Array";

actor chain_management {
    // Type definitions matching frontend interfaces
    public type ChainId = Text;
    public type MemberId = Text;
    public type LoanId = Text;
    
    public type Frequency = {
        #weekly;
        #biweekly;
        #monthly;
        #quarterly;
    };
    
    public type ChainType = {
        #social;
        #global;
    };
    
    public type LoanStatus = {
        #pending;
        #approved;
        #repaid;
        #defaulted;
    };
    
    public type Member = {
        id: MemberId;
        name: Text;
        walletAddress: Text;
        contributed: Bool;
        contributionAmount: Float;
        isLender: Bool;
    };
    
    public type Loan = {
        id: LoanId;
        borrowerId: MemberId;
        lenderId: MemberId;
        amount: Float;
        interestRate: Float;
        status: LoanStatus;
        dueDate: Text;
        repaymentDate: ?Text;
    };
    
    public type Chain = {
        id: ChainId;
        name: Text;
        userId: Text;
        userName: Text;
        fineRate: Float;
        chainType: ChainType;
        totalRounds: Nat;
        currentRound: Nat;
        roundDuration: Nat; // in days
        startDate: Text; // ISO string
        totalFunds: Float;
        currentFunds: Float;
        currency: Text;
        members: [Member];
        loans: [Loan];
        interestRate: Float;
    };
    
    public type SingleChain = {
        id: ChainId;
        name: Text;
    };
    
    public type CreateChainParams = {
        name: Text;
        userId: Text;
        userName: Text;
        fineRate: Float;
        chainType: ChainType;
        totalRounds: Nat;
        roundDuration: Nat;
        startDate: Text;
        currency: Text;
        interestRate: Float;
        creatorWallet: Text;
        creatorContributionAmount: Float;
        creatorIsLender: Bool;
    };
    
    public type CreateLoanParams = {
        borrowerId: Text;
        lenderId: Text;
        amount: Float;
        interestRate: Float;
        status: LoanStatus;
        dueDate: Text;
    };
    
    // Stable storage for canister upgrades
    stable var nextChainId: Nat = 1;
    stable var nextLoanId: Nat = 1;
    stable var nextMemberId: Nat = 1;
    
    stable var chainsEntries : [(ChainId, Chain)] = [];
    stable var userChainsEntries : [(Text, [ChainId])] = [];
    
    // In-memory storage
    var chains = HashMap.HashMap<ChainId, Chain>(0, Text.equal, Text.hash);
    var userChains = HashMap.HashMap<Text, [ChainId]>(0, Text.equal, Text.hash);
    
    // System methods for canister upgrades
    system func preupgrade() {
        chainsEntries := Iter.toArray(chains.entries());
        userChainsEntries := Iter.toArray(userChains.entries());
    };
    
    system func postupgrade() {
        chains := HashMap.fromIter<ChainId, Chain>(
            chainsEntries.vals(), 0, Text.equal, Text.hash
        );
        userChains := HashMap.fromIter<Text, [ChainId]>(
            userChainsEntries.vals(), 0, Text.equal, Text.hash
        );
        chainsEntries := [];
        userChainsEntries := [];
    };
    
    // Helper function to generate unique IDs
    func generateId(counter: Nat, prefix: Text) : Text {
        return prefix # "-" # Nat.toText(counter);
    };
    
    // Chain management functions
    public shared ({caller}) func createChain(params: CreateChainParams) : async Result.Result<Text, Text> {
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous users cannot create chains");
        };
        
        let chainId = generateId(nextChainId, "chain");
        nextChainId += 1;
        
        let memberId = generateId(nextMemberId, "member");
        nextMemberId += 1;
        
        let creatorMember : Member = {
            id = memberId;
            name = params.userName;
            walletAddress = params.creatorWallet;
            contributed = true;
            contributionAmount = params.creatorContributionAmount;
            isLender = params.creatorIsLender;
        };
        
        let newChain : Chain = {
            id = chainId;
            name = params.name;
            userId = params.userId;
            userName = params.userName;
            fineRate = params.fineRate;
            chainType = params.chainType;
            totalRounds = params.totalRounds;
            currentRound = 1;
            roundDuration = params.roundDuration;
            startDate = params.startDate;
            totalFunds = params.creatorContributionAmount;
            currentFunds = params.creatorContributionAmount;
            currency = params.currency;
            members = [creatorMember];
            loans = [];
            interestRate = params.interestRate;
        };
        
        chains.put(chainId, newChain);
        
        // Add chain to user's chain list
        let userChainsList = switch (userChains.get(params.userId)) {
            case null { [] };
            case (?list) { list };
        };
        userChains.put(params.userId, Array.append(userChainsList, [chainId]));
        
        #ok(chainId)
    };
    
    public query func getChain(chainId: Text) : async ?Chain {
        chains.get(chainId)
    };
    
    public shared func updateChain(
        chainId: Text,
        name: ?Text,
        currentRound: ?Nat,
        totalFunds: ?Float,
        currentFunds: ?Float
    ) : async Result.Result<(), Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                let updatedChain : Chain = {
                    chain with
                    name = Option.get(name, chain.name);
                    currentRound = Option.get(currentRound, chain.currentRound);
                    totalFunds = Option.get(totalFunds, chain.totalFunds);
                    currentFunds = Option.get(currentFunds, chain.currentFunds);
                };
                chains.put(chainId, updatedChain);
                #ok()
            }
        }
    };
    
    public query func getUserChains(userId: Text) : async [SingleChain] {
        switch (userChains.get(userId)) {
            case null { [] };
            case (?chainIds) {
                Array.mapFilter<ChainId, SingleChain>(
                    chainIds,
                    func(chainId) {
                        switch (chains.get(chainId)) {
                            case null { null };
                            case (?chain) {
                                ?{ id = chainId; name = chain.name }
                            }
                        }
                    }
                )
            }
        }
    };
    
    // Member management functions
    public shared func addMember(
        chainId: Text,
        name: Text,
        walletAddress: Text,
        contributionAmount: Float,
        isLender: Bool
    ) : async Result.Result<Member, Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                let memberId = generateId(nextMemberId, "member");
                nextMemberId += 1;
                
                let newMember : Member = {
                    id = memberId;
                    name;
                    walletAddress;
                    contributed = false;
                    contributionAmount;
                    isLender;
                };
                
                let updatedMembers = Array.append(chain.members, [newMember]);
                let updatedTotalFunds = chain.totalFunds + contributionAmount;
                
                let updatedChain : Chain = {
                    chain with
                    members = updatedMembers;
                    totalFunds = updatedTotalFunds;
                };
                
                chains.put(chainId, updatedChain);
                #ok(newMember)
            }
        }
    };
    
    public shared func payContribution(chainId: Text, memberId: Text) : async Result.Result<(), Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                var found = false;
                var contributionAmount = 0.0;
                
                let updatedMembers = Array.map<Member, Member>(
                    chain.members,
                    func(m) {
                        if (m.id == memberId) {
                            found := true;
                            if (not m.contributed) {
                                contributionAmount := m.contributionAmount;
                                { m with contributed = true }
                            } else {
                                m
                            }
                        } else {
                            m
                        }
                    }
                );
                
                if (not found) {
                    return #err("Member not found");
                };
                
                if (contributionAmount == 0.0) {
                    return #err("Member already contributed or amount is zero");
                };
                
                let updatedChain : Chain = {
                    chain with
                    members = updatedMembers;
                    currentFunds = chain.currentFunds + contributionAmount;
                };
                
                chains.put(chainId, updatedChain);
                #ok()
            }
        }
    };
    
    public shared func updateMember(
        chainId: Text,
        memberId: Text,
        walletAddress: ?Text,
        contributionAmount: ?Float,
        isLender: ?Bool
    ) : async Result.Result<(), Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                var found = false;
                var oldContribution = 0.0;
                
                let updatedMembers = Array.map<Member, Member>(
                    chain.members,
                    func(m) {
                        if (m.id == memberId) {
                            found := true;
                            
                            // Track old contribution for adjustment
                            oldContribution := m.contributionAmount;
                            
                            let newContribution = Option.get(contributionAmount, m.contributionAmount);
                            let newWallet = Option.get(walletAddress, m.walletAddress);
                            let newLenderStatus = Option.get(isLender, m.isLender);
                            
                            { 
                                m with 
                                walletAddress = newWallet;
                                contributionAmount = newContribution;
                                isLender = newLenderStatus;
                            }
                        } else {
                            m
                        }
                    }
                );
                
                if (not found) {
                    return #err("Member not found");
                };
                
                let newContribution = Option.get(contributionAmount, 0.0);
                let contributionDelta = newContribution - oldContribution;
                
                let updatedChain : Chain = {
                    chain with
                    members = updatedMembers;
                    totalFunds = chain.totalFunds + contributionDelta;
                };
                
                chains.put(chainId, updatedChain);
                #ok()
            }
        }
    };
    
    // Loan management functions
    public shared func createLoan(
        chainId: Text,
        loanParams: CreateLoanParams
    ) : async Result.Result<LoanId, Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                let loanId = generateId(nextLoanId, "loan");
                nextLoanId += 1;
                
                // Verify members exist
                let borrowerExists = Array.find<Member>(
                    chain.members,
                    func(m) { m.id == loanParams.borrowerId }
                );
                
                let lenderExists = Array.find<Member>(
                    chain.members,
                    func(m) { m.id == loanParams.lenderId }
                );

                //previously it was not now I've equaled it to null
                
                if ( borrowerExists == null or lenderExists == null) {
                    return #err("Borrower or lender not found in chain");
                };
                
                let newLoan : Loan = {
                    id = loanId;
                    borrowerId = loanParams.borrowerId;
                    lenderId = loanParams.lenderId;
                    amount = loanParams.amount;
                    interestRate = loanParams.interestRate;
                    status = loanParams.status;
                    dueDate = loanParams.dueDate;
                    repaymentDate = null;
                };
                
                let updatedLoans = Array.append(chain.loans, [newLoan]);
                let updatedChain = { chain with loans = updatedLoans };
                chains.put(chainId, updatedChain);
                
                #ok(loanId)
            }
        }
    };
    
    public shared func updateLoanStatus(
        chainId: Text,
        loanId: Text,
        status: LoanStatus
    ) : async Result.Result<(), Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                var found = false;
                
                let updatedLoans = Array.map<Loan, Loan>(
                    chain.loans,
                    func(loan) {
                        if (loan.id == loanId) {
                            found := true;
                            { loan with status = status }
                        } else {
                            loan
                        }
                    }
                );
                
                if (not found) {
                    return #err("Loan not found");
                };
                
                let updatedChain = { chain with loans = updatedLoans };
                chains.put(chainId, updatedChain);
                #ok()
            }
        }
    };
    
    public shared func updateLoanRepayment(
        chainId: Text,
        loanId: Text,
        repaymentDate: Text
    ) : async Result.Result<(), Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                var found = false;
                
                let updatedLoans = Array.map<Loan, Loan>(
                    chain.loans,
                    func(loan) {
                        if (loan.id == loanId) {
                            found := true;
                            { 
                                loan with 
                                status = #repaid;
                                repaymentDate = ?repaymentDate;
                            }
                        } else {
                            loan
                        }
                    }
                );
                
                if (not found) {
                    return #err("Loan not found");
                };
                
                let updatedChain = { chain with loans = updatedLoans };
                chains.put(chainId, updatedChain);
                #ok()
            }
        }
    };
    
    // Additional helper functions
    public shared func advanceRound(chainId: Text) : async Result.Result<(), Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                if (chain.currentRound >= chain.totalRounds) {
                    return #err("Already at final round");
                };
                
                let updatedChain = {
                    chain with
                    currentRound = chain.currentRound + 1;
                    currentFunds = 0.0; // Reset for new round
                };
                
                // Reset member contributions
                let resetMembers = Array.map<Member, Member>(
                    chain.members,
                    func(m) { { m with contributed = false } }
                );
                
                let finalChain : Chain = { updatedChain with members = resetMembers };
                chains.put(chainId, finalChain);
                #ok()
            }
        }
    };
    
    public query func getMemberLoans(chainId: Text, memberId: Text) : async Result.Result<[Loan], Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                let memberLoans = Array.filter<Loan>(
                    chain.loans,
                    func(loan) { 
                        loan.borrowerId == memberId or loan.lenderId == memberId 
                    }
                );
                #ok(memberLoans)
            }
        }
    };
    
    public query func getContributionProgress(chainId: Text) : async Result.Result<Float, Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                if (chain.totalFunds > 0) {
                    #ok((chain.currentFunds / chain.totalFunds) * 100.0)
                } else {
                    #ok(0.0)
                }
            }
        }
    };
}