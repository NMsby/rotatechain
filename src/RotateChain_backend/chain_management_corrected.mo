// main.mo
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import ICRC1 "canister:icp_ledger_canister";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Prim "mo:prim";

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
        id: Text;
        name: Text;
        walletAddress: ?Blob;
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
        chainAccountIdentifier:?Blob;
        totalRounds: Nat;
        currentRound: Nat;
        roundDuration: Nat; // in seconds
        startDate: Text; // ISO string
        totalFunds: Float;
        currentFunds: Float;
        contributionAmount: Nat;
        currency: Text;
        members: [Member];
        loans: [Loan];
        interestRate: Float;
    };

    // Type alias for 32-byte subaccounts
    public type Subaccount = Blob;
    
    public type SingleChain = {
        id: ChainId;
        name: Text;
        currency:Text;
        members:[Member];
        contributionAmount:Nat;
        frequency: Nat;
    };
    
    public type CreateChainParams = {
        name: Text;
        userId: Text;
        userName: Text;
        fineRate: Float;
        chainType: ChainType;
        totalRounds: Nat;
        roundDuration: Nat;
        contributionAmount:Nat;
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

    //add the walletAddress from subAccount for the lender address


    // get all chains method
    public shared ({ caller }) func getAllChains() : async Result.Result<[SingleChain], Text> {
        // Verify caller is authenticated
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous users cannot access this resource");
        };
        
        // Convert all chains to SingleChain format
        let allChains = Iter.toArray(chains.vals());
        let result = Array.map<Chain, SingleChain>(
            allChains,
            func(chain) {
                {
                    id = chain.id;
                    name = chain.name;
                    currency = chain.currency;
                    members= chain.members;
                    contributionAmount = chain.contributionAmount;
                    frequency = chain.roundDuration;
                }
            }
        );
        
        #ok(result)
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

                //The subaccounts generation methods
        // Creates a subaccount from various input types
        func createSubaccount(inputText : Text) : Blob {
            // Convert text to UTF-8 encoded bytes
            let utf8Bytes = Blob.toArray(Text.encodeUtf8(inputText));
            
            // Create a 32-byte array, padding with zeros or truncating as needed
            let subaccountBytes = Array.tabulate(32, func(i : Nat) : Nat8 {
                if (i < utf8Bytes.size()) {
                utf8Bytes[i]  // Use the UTF-8 byte if available
                } else {
                0 // Pad with zero if beyond the UTF-8 byte length
                }
            });
            
            // Return as a Blob (32-byte subaccount)
            Blob.fromArray(subaccountBytes)
        };


        //the usage criteria
        // Get current canister's principal
        let myPrincipal = Principal.fromActor(chain_management); 
        // Create subaccount from text,let the text be a combination of the name and the id. Which is basically the chainid
        // store the chainid here
        let userId = params.userId;
        let userPrincipal = Principal.fromText(userId);
        // store the chain name here
        let chainName = params.name;
        //used the chainId and the chainName combination to get the subaccount
        let sub1 = createSubaccount(chainId # userId # chainName);  
        let userSub = createSubaccount(userId);
        //subaccounts
        let userSubAccount = ?Prim.arrayToBlob(Prim.blobToArray(userSub));
        let storageSubAccount = ?Prim.arrayToBlob(Prim.blobToArray(sub1)); 
        // Generate account identifier for the chain
        let chainAccountId = await ICRC1.account_identifier({owner=myPrincipal;subaccount=storageSubAccount;}); // => \8C\5C\20\C6\15\3F\7F\51\E2\0D\0F\0F\B5\08\51\5B\47\65\63\A9\62\B4\A9\91\5F\4F\02\70\8A\ED\4F\82
        let nat8ReadyAccountId = Blob.toArray(chainAccountId);

        
        let creatorMember : Member = {
            id = params.userId;
            name = params.userName;
            walletAddress = userSubAccount;
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
            contributionAmount = params.contributionAmount;
            currentRound = 1;
            roundDuration = params.roundDuration;
            startDate = params.startDate;
            totalFunds = params.creatorContributionAmount;
            currentFunds = params.creatorContributionAmount;
            currency = params.currency;
            chainAccountIdentifier = storageSubAccount;
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
                                ?{ 
                                    id = chainId; 
                                    name = chain.name;
                                    frequency = chain.roundDuration;
                                    contributionAmount = chain.contributionAmount;
                                    currency = chain.currency;
                                    members = chain.members;
                                    }
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
        userPrincipal:Text,
        name: Text,
        contributionAmount: Float,
        isLender: Bool
    ) : async Result.Result<Member, Text> {
        switch (chains.get(chainId)) {
            case null { #err("Chain not found") };
            case (?chain) {
                let memberId = generateId(nextMemberId, "member");
                nextMemberId += 1;

                // Creates a subaccount from various input types
                func createSubaccount(inputText : Text) : Blob {
                    // Convert text to UTF-8 encoded bytes
                    let utf8Bytes = Blob.toArray(Text.encodeUtf8(inputText));
                    
                    // Create a 32-byte array, padding with zeros or truncating as needed
                    let subaccountBytes = Array.tabulate(32, func(i : Nat) : Nat8 {
                        if (i < utf8Bytes.size()) {
                        utf8Bytes[i]  // Use the UTF-8 byte if available
                        } else {
                        0 // Pad with zero if beyond the UTF-8 byte length
                        }
                    });
                    
                    // Return as a Blob (32-byte subaccount)
                    Blob.fromArray(subaccountBytes)
                };


                //the usage criteria
                // Get current canister's principal
                let myPrincipal = Principal.fromText(userPrincipal); 
                // Create subaccount from text,let the text be a combination of the name and the id. Which is basically the chainid
                let sub1 = createSubaccount(userPrincipal);  
                let storageSubAccount = ?Prim.arrayToBlob(Prim.blobToArray(sub1)); 
                // Generate account identifier for the user
                let chainAccountId = await ICRC1.account_identifier({owner=myPrincipal;subaccount=storageSubAccount;}); // => \8C\5C\20\C6\15\3F\7F\51\E2\0D\0F\0F\B5\08\51\5B\47\65\63\A9\62\B4\A9\91\5F\4F\02\70\8A\ED\4F\82
                let nat8ReadyAccountId = Blob.toArray(chainAccountId);

                // generate the wallet address with user sub account principal
                
                let newMember : Member = {
                    id = userPrincipal;
                    name;
                    walletAddress=storageSubAccount;
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
        walletAddress: ?Blob,
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
                            let newWallet = walletAddress;
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
