// main.mo
/*import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Option "mo:base/Option";

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
    func generateId(counter: Nat) : Text {
        return Principal.toText(Principal.fromActor(chain_management)) # "-" # Nat.toText(counter);
    };
    
    // Chain management functions
    public shared func createChain(params: CreateChainParams) : async Text {
        let chainId = generateId(nextChainId);
        nextChainId += 1;
        
        let creatorMember : Member = {
            id = generateId(1); // First member ID
            name = params.userName;
            walletAddress = params.creatorWallet;
            contributed = false;
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
            currentFunds = 0;
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
        userChains.put(params.userId, userChainsList # [chainId]);
        
        chainId
    };
    
    public query func getChain(chainId: Text) : async ?Chain {
        chains.get(chainId)
    };
    
    public shared func updateChain(
        chainId: Text,
        fields: {
            name: ?Text;
            currentRound: ?Nat;
            totalFunds: ?Float;
            currentFunds: ?Float;
        }
    ) : async Bool {
        switch (chains.get(chainId)) {
            case null { false };
            case (?chain) {
                let updatedChain = {
                    chain with
                    name = Option.get(fields.name, chain.name);
                    currentRound = Option.get(fields.currentRound, chain.currentRound);
                    totalFunds = Option.get(fields.totalFunds, chain.totalFunds);
                    currentFunds = Option.get(fields.currentFunds, chain.currentFunds);
                };
                chains.put(chainId, updatedChain);
                true
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
        member: {
            name: Text;
            walletAddress: Text;
            contributionAmount: Float;
            isLender: Bool;
        }
    ) : async Bool {
        switch (chains.get(chainId)) {
            case null { false };
            case (?chain) {
                let newMember : Member = {
                    id = generateId(Array.size(chain.members) + 1);
                    name = member.name;
                    walletAddress = member.walletAddress;
                    contributed = false;
                    contributionAmount = member.contributionAmount;
                    isLender = member.isLender;
                };
                
                let updatedMembers = chain.members # [newMember];
                let updatedTotalFunds = chain.totalFunds + member.contributionAmount;
                
                let updatedChain = {
                    chain with
                    members = updatedMembers;
                    totalFunds = updatedTotalFunds;
                };
                
                chains.put(chainId, updatedChain);
                
                // Add chain to new member's chain list
                let userChainsList = switch (userChains.get(chain.userId)) {
                    case null { [] };
                    case (?list) { list };
                };
                if (not Array.find<Text>(userChainsList, func(id) { id == chainId }) != null) {
                    userChains.put(chain.userId, userChainsList # [chainId]);
                };
                
                true
            }
        }
    };
    
    public shared func payContribution(chainId: Text, memberId: Text) : async Bool {
        switch (chains.get(chainId)) {
            case null { false };
            case (?chain) {
                let (updatedMembers, amount) = Array.mapFold<Member, (Float, [Member]), Member>(
                    chain.members,
                    func(m, (acc, members)) {
                        if (m.id == memberId and not m.contributed) {
                            let updatedMember = { m with contributed = true };
                            (acc + m.contributionAmount, members # [updatedMember])
                        } else {
                            (acc, members # [m])
                        }
                    },
                    (0.0, [])
                );
                
                if (amount > 0) {
                    let updatedChain = {
                        chain with
                        members = updatedMembers;
                        currentFunds = chain.currentFunds + amount;
                    };
                    chains.put(chainId, updatedChain);
                    true
                } else {
                    false
                }
            }
        }
    };
    
    public shared func updateMember(
        chainId: Text,
        memberId: Text,
        fields: {
            walletAddress: ?Text;
            contributionAmount: ?Float;
            isLender: ?Bool;
        }
    ) : async Bool {
        switch (chains.get(chainId)) {
            case null { false };
            case (?chain) {
                let updatedMembers = Array.map<Member, Member>(
                    chain.members,
                    func(m) {
                        if (m.id == memberId) {
                            {
                                m with
                                walletAddress = Option.get(fields.walletAddress, m.walletAddress);
                                contributionAmount = Option.get(fields.contributionAmount, m.contributionAmount);
                                isLender = Option.get(fields.isLender, m.isLender);
                            }
                        } else {
                            m
                        }
                    }
                );
                
                let updatedChain = { chain with members = updatedMembers };
                chains.put(chainId, updatedChain);
                true
            }
        }
    };
    
    // Loan management functions
    public shared func createLoan(
        chainId: Text,
        loanParams: CreateLoanParams
    ) : async ?LoanId {
        switch (chains.get(chainId)) {
            case null { null };
            case (?chain) {
                let loanId = generateId(nextLoanId);
                nextLoanId += 1;
                
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
                
                let updatedLoans = chain.loans # [newLoan];
                let updatedChain = { chain with loans = updatedLoans };
                chains.put(chainId, updatedChain);
                
                ?loanId
            }
        }
    };
    
    public shared func updateLoanStatus(
        chainId: Text,
        loanId: Text,
        status: LoanStatus
    ) : async Bool {
        switch (chains.get(chainId)) {
            case null { false };
            case (?chain) {
                let updatedLoans = Array.map<Loan, Loan>(
                    chain.loans,
                    func(loan) {
                        if (loan.id == loanId) {
                            { loan with status = status }
                        } else {
                            loan
                        }
                    }
                );
                
                let updatedChain = { chain with loans = updatedLoans };
                chains.put(chainId, updatedChain);
                true
            }
        }
    };
    
    public shared func updateLoanRepayment(
        chainId: Text,
        loanId: Text,
        repaymentDate: Text
    ) : async Bool {
        switch (chains.get(chainId)) {
            case null { false };
            case (?chain) {
                let updatedLoans = Array.map<Loan, Loan>(
                    chain.loans,
                    func(loan) {
                        if (loan.id == loanId) {
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
                
                let updatedChain = { chain with loans = updatedLoans };
                chains.put(chainId, updatedChain);
                true
            }
        }
    };
    
    // Additional helper functions
    public shared func advanceRound(chainId: Text) : async Bool {
        switch (chains.get(chainId)) {
            case null { false };
            case (?chain) {
                if (chain.currentRound < chain.totalRounds) {
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
                    
                    let finalChain = { updatedChain with members = resetMembers };
                    chains.put(chainId, finalChain);
                    true
                } else {
                    false
                }
            }
        }
    };
    
    public shared func getMemberLoans(chainId: Text, memberId: Text) : async [Loan] {
        switch (chains.get(chainId)) {
            case null { [] };
            case (?chain) {
                Array.filter<Loan>(
                    chain.loans,
                    func(loan) { 
                        loan.borrowerId == memberId or loan.lenderId == memberId 
                    }
                )
            }
        }
    };
    
    public shared func getContributionProgress(chainId: Text) : async Float {
        switch (chains.get(chainId)) {
            case null { 0.0 };
            case (?chain) {
                if (chain.totalFunds > 0) {
                    (chain.currentFunds / chain.totalFunds) * 100.0
                } else {
                    0.0
                }
            }
        }
    };
}*/