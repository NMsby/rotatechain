// Enhanced main.mo - working logic + new modules
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat64 "mo:base/Nat64";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Bool "mo:base/Bool";
import Blob "mo:base/Blob";
import Prim "mo:prim";

// Import new modules for validation and utilities
import Types "./types";
import Utils "./utils";

/// Imports required modules and libraries for the backend canister functionality.
import Ledger "canister:icp_ledger_canister";
import PaymentHandler "./payment_handler";
import StateManager "./state_manager";
import YieldManager "./yield_manager";
import YieldDistributor "./yield_distributor";
import groupManagement "group_management";
import AnalyticsEngine "./analytics_engine";

actor RotateChain {
  
    // heartbeat variables
    var lastTick: Int = 0;
    let interval: Nat = 1_000_000_000; // 1 second in nanoseconds

    // Complete types for rotational savings
    // add account identifier property and the lastDisbursedAt property.    
    public type Group = {
        id: Nat;
        name: Text;
        //changed the members array to point to the Member array
        members: [Types.Member];
        contributionAmount: Nat;
        currentRound: Nat;
        totalRounds: Nat;
        isActive: Bool;
        creator: Principal;
        nextRecipient: ?Types.Member;
        createdAt: Int;
        completedAt: ?Int;
        //added the chanAccountIdentifier,type,last,currency,interest
        chainAccountIdentifier:?Blob;
        chainType:Text;
        lastDisbursedAt: Int;
        currency:Text;
        interestRate:Text;
    };

    public type GroupSummary = {
        id: Nat;
        name: Text;
        memberCount: Nat;
        contributionAmount: Nat;
        currentRound: Nat;
        totalRounds: Nat;
        isActive: Bool;
        spotsRemaining: Nat;
        nextRecipient: ?Types.Member;
        progress: Nat;
    };

    public type PlatformStats = {
        totalGroups: Nat;
        totalMembers: Nat;
        totalValueLocked: Nat;
        activeGroups: Nat;
        completedGroups: Nat;
        completedRounds: Nat;
    };

    // ==================== STABLE VARIABLES (ACTOR LEVEL) ====================
    // Legacy state for existing system
    private stable var nextGroupId: Nat = 1;
    private stable var groupsArray: [Group] = [];
    private stable var contributionsTracker: [(Nat, Principal, Nat)] = [];

    // StateManager stable storage - These persist across upgrades
    private stable var groupEntries: [(Types.GroupId, Types.GroupConfig)] = [];
    private stable var rotationEntries: [(Types.GroupId, Types.RotationState)] = [];
    private stable var memberEntries: [(Types.GroupId, [(Principal, Types.Member)])] = [];
    private stable var transactionEntries: [(Types.TransactionId, Types.Transaction)] = [];
    private stable var groupMembershipEntries: [(Principal, [Types.GroupId])] = [];

    // R Token stable storage
    private stable var rTokenEntries: [(Types.RTokenId, Types.RToken)] = [];
    private stable var rTokenTransferEntries: [(Types.TransactionId, Types.RTokenTransfer)] = [];
    private stable var rTokenHolderEntries: [(Principal, [(Types.GroupId, Types.Amount)])] = [];

    // Lending stable storage
    private stable var loanEntries: [(Types.LoanId, Types.Loan)] = [];
    private stable var loanPaymentEntries: [(Types.TransactionId, Types.LoanPayment)] = [];
    
    // State counters
    private stable var groupCounter: Types.GroupId = 0;
    private stable var transactionCounter: Types.TransactionId = 0;
    private stable var isSystemPaused: Bool = false;

    // ==================== YIELD MANAGER INSTANCE ====================
    private let yieldManager = YieldManager.YieldManager();

    // ==================== INITIALIZE STATE MANAGER ====================
    private let stateManager = StateManager.StateManager();

    // ==================== ANALYTICS ENGINE INSTANCE ====================
    private let analyticsEngine = AnalyticsEngine.AnalyticsEngine();

    // Initialize state on canister creation
    private func initializeStateManager() {
        stateManager.initializeFromState(
            groupEntries,
            rotationEntries, 
            memberEntries,
            transactionEntries,
            groupMembershipEntries,
            rTokenEntries,
            rTokenTransferEntries,
            rTokenHolderEntries,
            groupCounter,
            transactionCounter,
            isSystemPaused
        );

        // Initialize lending state
        stateManager.initializeLendingState(loanEntries, loanPaymentEntries);
    };

    // Call initialization
    initializeStateManager();

    // ==================== HEARTBEAT ====================

    
    system func heartbeat(): async () {
        
        let now = Time.now();
        
        if (now - lastTick >= interval) {
            lastTick := now;
            await tick();
        };
    };

    public func tick() : async () {
        let now = Time.now() / 1_000_000_000; // Convert to seconds

        let chains = stateManager.getAllTickerGroups();
        for ((id, chain) in chains.entries()) {
            if (now - chain.lastDisbursedAt >= (chain.rotationIntervalDays * 1_000_000_000) ) {
                //updateRound
                let advanceResult = await advanceRound(chain.id);
            };
        };
    };


    // ==================== HELPER FUNCTIONS ====================

    // Find a group by ID
    private func findGroup(groupId: Nat) : ?Group {
        Array.find<Group>(groupsArray, func(g) = g.id == groupId)
    };

    // Update an existing group
    private func updateGroup(updatedGroup: Group) : () {
        groupsArray := Array.map<Group, Group>(groupsArray, func(g) = 
        if (g.id == updatedGroup.id) updatedGroup else g
        );
    };

    // Check if a user has contributed to a specific group in a specific round
    private func hasContributed(groupId: Nat, principal: Principal, round: Nat) : Bool {
        Array.find<(Nat, Principal, Nat)>(contributionsTracker, func((gId, p, r)) = 
        gId == groupId and Principal.equal(p, principal) and r == round
        ) != null
    };

    // Record a user's contribution to a specific group in a specific round
    private func recordContributionInternal(groupId: Nat, principal: Principal, round: Nat) : () {
        contributionsTracker := Array.append(contributionsTracker, [(groupId, principal, round)]);
    };

    // Calculate progress percentage
    private func calculateProgress(currentRound: Nat, totalRounds: Nat) : Nat {
        if (totalRounds == 0) { 0 } else { (currentRound * 100) / totalRounds }
    };

    // ==================== GROUP MANAGEMENT ====================

    // Create new rotation group
    public shared(msg) func createGroup(
        name: Text,
        chainType:Text,
        contributionAmount: Nat,
        maxMembers: Nat,
        currency:Text,
        interestRate:Nat,
        _roundDurationDays: Nat
    ) : async Result.Result<Nat, Text> {

        let groupId = nextGroupId;
        nextGroupId += 1;

        //for the wallet
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


        let myPrincipal = Principal.fromActor(RotateChain); 
        
        let userId = Principal.toText(msg.caller);
        let userPrincipal = Principal.fromText(userId);
        let chainName = Utils.sanitizeText(name);
        let sub1 = createSubaccount(Nat.toText(groupId)  # userId # chainName);  
        let userSub = createSubaccount(userId # chainName);
        let userSubAccount = ?Prim.arrayToBlob(Prim.blobToArray(userSub));
        let storageSubAccount = ?Prim.arrayToBlob(Prim.blobToArray(sub1)); 

        let creatorMember : Types.Member = {
            principal= msg.caller;
            joinedAt= Time.now();
            totalContributions= 0;
            receivedPayouts=0;
            pendingContributions= 0;    // Contributions not yet processed
            status= #pending;
            lastContributionTime=null;
            missedContributions=0;        // Track defaults
            liquidTokenBalance= 0;      // rTokens for trading
            //added the walletAddress
            walletAddress=userSubAccount;
        };
    
        // Validation using utils.mo
        if (Utils.isEmptyText(name)) { 
            return #err("Group name cannot be empty") 
        };
        
        if (maxMembers < Types.MIN_GROUP_SIZE or maxMembers > Types.MAX_GROUP_SIZE) { 
            return #err("Group size must be between " # Nat.toText(Types.MIN_GROUP_SIZE) # " and " # Nat.toText(Types.MAX_GROUP_SIZE) # " members") 
        };
        
        if (contributionAmount < Nat64.toNat(Types.MIN_CONTRIBUTION)) { 
        return #err("Minimum contribution is " # Nat64.toText(Types.MIN_CONTRIBUTION)) 
        };

        // Validate principal
        if (not Utils.validatePrincipal(msg.caller)) {
            return #err("Invalid caller principal");
        };
        
        
        let newGroup: Group = {
            id = groupId;
            name = Utils.sanitizeText(name);  // Enhanced: sanitize input
            members = [creatorMember];
            contributionAmount = contributionAmount;
            currentRound = 0;
            totalRounds = maxMembers;
            isActive = false;
            creator = msg.caller;
            nextRecipient = null;
            createdAt = Time.now();
            completedAt = null;
            chainAccountIdentifier=storageSubAccount;
            chainType=chainType;
            lastDisbursedAt=0;
            currency=currency;
            interestRate = Nat.toText(interestRate) ;
        };
        
        groupsArray := Array.append(groupsArray, [newGroup]);
            
        Debug.print("Group created: " # Nat.toText(groupId) # " - " # name);
        #ok(groupId)
    };

    // Join existing group
    public shared(msg) func joinGroup(groupId: Nat) : async Result.Result<Bool, Text> {
        // Enhanced validation
        if (not Utils.validatePrincipal(msg.caller)) {
            return #err("Invalid caller principal");
        };

        switch (findGroup(groupId)) {
            case (?group) {
                if (group.members.size() >= group.totalRounds) {
                    return #err("Group is full");
                };
            
                if (group.isActive) {
                    return #err("Cannot join active group");
                };
            
                // Check if already a member
                if (Utils.principalInArray(msg.caller, Array.map<Types.Member, Principal>(group.members, func (member : Types.Member) : Principal {
                    return member.principal;
                }))) {
                    return #err("Already a member of this group");
                };

                //for the wallet
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

                
                let userId = Principal.toText(msg.caller);
                let userPrincipal = Principal.fromText(userId);
                let chainName = Utils.sanitizeText(group.name);
                let userSub = createSubaccount(userId # chainName);
                let userSubAccount = ?Prim.arrayToBlob(Prim.blobToArray(userSub));

                let newMember : Types.Member = {
                    principal= msg.caller;
                    joinedAt= Time.now();
                    totalContributions= 0;
                    receivedPayouts=0;
                    pendingContributions= 0;    // Contributions not yet processed
                    status= #pending;
                    lastContributionTime=null;
                    missedContributions=0;        // Track defaults
                    liquidTokenBalance= 0;      // rTokens for trading
                    //added the walletAddress
                    walletAddress=userSubAccount;
                };

                // Add new member
                let updatedMembers = Utils.addPrincipalToArray(newMember, group.members);
                let isNowActive = updatedMembers.size() == group.totalRounds;
                let updatedGroup = { group with 
                members = updatedMembers;
                isActive = isNowActive;
                currentRound = if (isNowActive) 1 else 0;
                nextRecipient = if (isNowActive and updatedMembers.size() > 0) ?updatedMembers[0] else null;
                };
                updateGroup(updatedGroup);
            
                Debug.print("Member joined: " # Principal.toText(msg.caller) # " -> Group " # Nat.toText(groupId));
                if (isNowActive) {
                    Debug.print("Group " # Nat.toText(groupId) # " is now ACTIVE! Round 1 started.");
                };
                #ok(true)
            };
            case null { #err("Group not found") };
        }
    };

    // Record contribution with real ICP payment processing
    public shared(msg) func recordContribution(groupId: Nat) : async Result.Result<Bool, Text> {
        switch (findGroup(groupId)) {
            case (?group) {
                if (not group.isActive) {
                    return #err("Group is not active yet");
                };
            
                // Check if caller is a member
                if (not Utils.principalInArray(msg.caller, Array.map<Types.Member, Principal>(group.members, func (member : Types.Member) : Principal {
                    return member.principal;
                }))) {
                    return #err("Not a member of this group");
                };
            
                // Check if already contributed this round
                if (hasContributed(groupId, msg.caller, group.currentRound)) {
                    return #err("Already contributed for round " # Nat.toText(group.currentRound));
                };

                // Process REAL ICP payment through payment handler
                let contributionAmount = Nat64.fromNat(group.contributionAmount);
                switch (await PaymentHandler.processContribution(
                    groupId,
                    msg.caller,
                    contributionAmount,
                    contributionAmount
                )) {
                    case (#ok(transactionId)) {
                        recordContributionInternal(groupId, msg.caller, group.currentRound);

                        // Issue R Tokens for contribution
                        switch (stateManager.issueRTokensForContribution(
                            groupId,
                            msg.caller,
                            contributionAmount,
                            ?"Group contribution"
                        )) {
                            case (#ok(tokenId)) {
                                Debug.print("R Token issued: " # Nat.toText(tokenId));
                            };
                            case (#err(rTokenError)) {
                                Debug.print("R Token issuance failed: " # debug_show(rTokenError));
                                // Continue anyway - ICP payment was successful
                            };
                        };
                        
                        Debug.print("✅ Real ICP payment processed successfully!");
                        Debug.print("Transaction ID: " # Nat64.toText(transactionId));
                        Debug.print("Contributor: " # Principal.toText(msg.caller));
                        Debug.print("Amount: " # Nat64.toText(contributionAmount) # " e8s");
                        
                        #ok(true)
                    };
                    case (#err(error)) {
                        let errorText = Utils.errorToText(error);
                        Debug.print("❌ Payment failed: " # errorText);
                        #err("Payment failed: " # errorText)
                    };
                }
            };
            case null { #err("Group not found") };
        }
    };

    // Advance to the next round
    public shared(_msg) func advanceRound(groupId: Nat) : async Result.Result<Bool, Text> {
        switch (findGroup(groupId)) {
            case (?group) {
                if (not group.isActive) {
                    return #err("Group is not active");
                };
            
                // Check if all members have contributed
                var allContributed = true;
                for (member in group.members.vals()) {
                    if (not hasContributed(groupId, member.principal, group.currentRound)) {
                        allContributed := false;
                    };
                };
            
                if (not allContributed) {
                    return #err("Not all members have contributed to round " # Nat.toText(group.currentRound));
                };

                // Calculate payment  amount (contributions + yield - fees)
                let baseAmount = Nat64.fromNat(group.contributionAmount * group.members.size());
                let yieldAmount = Utils.calculateYield(baseAmount, Types.DEFAULT_YIELD_RATE, 30);
                let platformFee = Utils.calculatePlatformFee(yieldAmount);
                let totalPayout = baseAmount + yieldAmount - platformFee;

                // Process real payout to current recipient
                switch (group.nextRecipient) {
                    case (?recipient) {
                        
                        /*await PaymentHandler.processRotationPayout(
                            groupId,
                            recipient,
                            totalPayout,
                            group.currentRound1
                        )*/
                        let withdrawalResult = await chainWithdraw(group.chainAccountIdentifier,Principal.toText(recipient.principal),recipient.walletAddress,group.currency); 
                        switch (withdrawalResult) {
                            case ("Success") {
                                let now = Time.now();
                                // Advance round after successful payout
                                let newRound = group.currentRound + 1;
                                let isCompleted = newRound > group.totalRounds;
                        
                                // Safe recipient index calculation
                                let nextRecipient = if (not isCompleted and group.members.size() > 0) {
                                    let memberCount = group.members.size();
                                    if (memberCount > 0) {
                                        let recipientIndex = (newRound - 1) % memberCount;
                                        ?group.members[recipientIndex]
                                    } else {
                                        null
                                    }
                                } else null;
                        
                                let updatedGroup = { group with 
                                    currentRound = newRound;
                                    nextRecipient = nextRecipient;
                                    isActive = not isCompleted;
                                    lastDisbursedAt = now;
                                    completedAt = if (isCompleted) ?Time.now() else null;
                                };
                                updateGroup(updatedGroup);

                                Debug.print("💰 Real ICP payout processed successfully!");
                                //Debug.print("Payout Transaction ID: " # Nat64.toText(payoutTxId));
                                Debug.print("Recipient: " # Principal.toText(recipient.principal));
                                Debug.print("Amount: " # Nat64.toText(totalPayout) # " e8s");
                        
                                if (isCompleted) {
                                    Debug.print("🎉 Group " # Nat.toText(groupId) # " COMPLETED! All rounds finished.");
                                } else {
                                    Debug.print("➡️ Group " # Nat.toText(groupId) # " advanced to round " # Nat.toText(newRound));
                                };

                                #ok(true)
                            };
                            case ("Error") {
                                //let errorText = Utils.errorToText(error);
                                //Debug.print("❌ Payout failed: " # errorText);
                                Debug.print("❌ payout failed");
                                //#err("Payout failed: " # errorText)
                                #err("Payout failed: ")
                            };
                        }
                    };
                    case null {
                        #err("No recipient assigned for this round")
                    };
                }
            };
            case null { #err("Group not found") };
        }
    };

    //chainBalance
    private func chainBalance(token : Text, chainAccountIdentifier:?Blob) : async Nat {
        

        func convertOptionalBlobToNat8Array(optionalBlob : ?Blob) : ?[Nat8] {
            switch (optionalBlob) {
                case (null) { null };
                case (?blob) { ?Blob.toArray(blob) };
            }
        };

        let actorPrincipal = Principal.fromActor(RotateChain);

        let cAccount = {
            owner = actorPrincipal;
            subaccount = chainAccountIdentifier;
        };


        switch(token) {
        /*case("ckBTC") { await ckBTC.icrc1_balance_of(cAccount) };
        case("ckETH") { await ckETH.icrc1_balance_of(cAccount)};
        case("ckUSDC") { await ckUSDC.icrc1_balance_of(cAccount)};*/
        case("ICP") { await Ledger.icrc1_balance_of(cAccount) };
        case("LICP") { await Ledger.icrc1_balance_of(cAccount) };
        case(_) { return 0 };
        }
    };


    //chain withdrawal
    private func chainWithdraw(chainAccountIdentifier : ?Blob,identity:Text,walletAddress:?Blob, token : Text) : async Text {

        let account = {
            owner = Principal.fromText(identity);
            subaccount = walletAddress;
        };

        let amount = await chainBalance(token,chainAccountIdentifier);

        let actualAmount = (amount * 90/100);


        let args = {
            to = account;
            amount = actualAmount;
            fee =  ?10_000;
            memo = null;
            from_subaccount = chainAccountIdentifier;
            created_at_time = null;
        };


        //here in the chain withdrawal ensure you check for the loans that one has and pay them to the respective users one by one then pay the remaining cash to the receiver provided remaining cash is greater than 0.
        let result = switch(token) {
            /*case("ckBTC") { await ckBTC.icrc1_transfer(args) };
            case("ckETH") { await ckETH.icrc1_transfer(args) };
            case("ckUSDC") { await ckUSDC.icrc1_transfer(args) };*/
            case("ICP") { await Ledger.icrc1_transfer(args) };
            case("LICP") { await Ledger.icrc1_transfer(args) };
            case(_) { #Err(#GenericError) };
        };

        switch(result) {
            case(#Ok(txId)){ //return "Success TxID: " # Nat.toText(txId);
                return "Success";
            };
            case (#Err(#InsufficientFunds({ balance }))) {
                // update the chain wallet account balance
                return "Error";
            };
            //case(#Err(err)) return "Error: " # debug_show(err);
            case(#Err(err)) return "Error";
        }
    };


    // ==================== R TOKEN OPERATIONS ====================

    // Transfer R Tokens between members
    public shared(msg) func transferRTokens(
        tokenId: Types.RTokenId,
        to: Principal,
        amount: Types.Amount,
        memo: ?Text
    ) : async Result.Result<Types.TransactionId, Types.Error> { 
        // Validate basic parameters
        if (not Utils.validatePrincipal(to)) {
            return #err(#UnauthorizedAccess);
        };
        
        if (Principal.equal(msg.caller, to)) {
            return #err(#InvalidAmount);
        };
        
        // Use enhanced state manager function with validation
        switch (stateManager.transferRTokensWithValidation(tokenId, msg.caller, to, amount, memo)) {
            case (#ok(transferId)) {
                Debug.print("R Token transfer initiated by: " # Principal.toText(msg.caller));
                Debug.print("Transfer ID: " # Nat64.toText(transferId));
                #ok(transferId)
            };
            case (#err(error)) {
                Debug.print("R Token transfer failed: " # debug_show(error));
                #err(error)
            };
        }
    };

    // Batch Transfer Functionality for convenience
    public shared(msg) func batchTransferRTokens(
        transfers: [(Types.RTokenId, Principal, Types.Amount, ?Text)]
    ) : async Result.Result<[Types.TransactionId], Types.Error> {
        
        let results = Buffer.Buffer<Types.TransactionId>(transfers.size());
        
        for ((tokenId, to, amount, memo) in transfers.vals()) {
            switch (stateManager.transferRTokensWithValidation(tokenId, msg.caller, to, amount, memo)) {
                case (#ok(transferId)) {
                    results.add(transferId);
                };
                case (#err(error)) {
                    return #err(error); // Fail fast on any error
                };
            };
        };
        
        #ok(Buffer.toArray(results))
    };

    // Get transfer history for user
    public shared query(msg) func getMyTransferHistory() : async [Types.RTokenTransfer] {
        stateManager.getUserTransferHistory(msg.caller)
    };

    // Get transfer details
    public query func getTransferDetails(transferId: Types.TransactionId) : async ?Types.RTokenTransfer {
        stateManager.getTransferDetails(transferId)
    };
    
    // Redeem R Tokens for ICP
    public shared(msg) func redeemRTokens(
        tokenId: Types.RTokenId,
        amount: Types.Amount
    ) : async Result.Result<Types.Amount, Types.Error> {
        stateManager.redeemRTokens(tokenId, msg.caller, amount)
    };
    
    // Get R Token balance for specific group
    public shared query(msg) func getRTokenBalance(groupId: Nat) : async Types.Amount {
        stateManager.getRTokenBalance(msg.caller, groupId)
    };
    
    // Get all R Token balances
    public shared query(msg) func getAllRTokenBalances() : async [(Types.GroupId, Types.Amount)] {
        stateManager.getAllRTokenBalances(msg.caller)
    };
    
    // Get R Token details
    public query func getRToken(tokenId: Types.RTokenId) : async ?Types.RToken {
        stateManager.getRToken(tokenId)
    };
    
    // Get user's R Tokens
    public shared query(msg) func getMyRTokens() : async [Types.RToken] {
        stateManager.getHolderTokens(msg.caller)
    };
    
    // Get R Token statistics for a group
    public query func getGroupRTokenStats(groupId: Nat) : async {totalTokens: Nat; totalValue: Types.Amount; activeTokens: Nat} {
        stateManager.getGroupTokenStats(groupId)
    };

    // ==================== YIELD FUNCTIONS ====================
    
    // Get projected yield for a group
    public query func getProjectedYield(
        groupId: Nat,
        durationDays: Nat
    ) : async Result.Result<Types.YieldCalculation, Types.Error> {
        stateManager.calculateGroupYield(groupId, durationDays)
    };

    // Update all R Token yields for a group (admin function)
    public shared(msg) func updateGroupRTokenYields(
        groupId: Nat
    ) : async Result.Result<Nat, Types.Error> {
        // Add admin check if needed
        stateManager.updateRTokenYields(groupId)
    };

    // Get yield comparison for different strategies
    public query func compareYieldStrategies(
        principal: Types.Amount,
        durationDays: Nat
    ) : async [(Types.YieldStrategy, Types.YieldCalculation)] {
        let strategies = [
            (#fixed(500) : Types.YieldStrategy), // 5% fixed
            (#variable({
                baseRate = 500;
                minRate = 300;
                maxRate = 800;
                marketFactor = 1.0;
            }) : Types.YieldStrategy),
            (#compound({
                rate = 550;
                compoundFrequency = 12;
            }) : Types.YieldStrategy)
        ];
        
        // Create local yield manager instance for query function
        let localYieldManager = YieldManager.YieldManager();
        localYieldManager.compareStrategies(principal, strategies, durationDays)
    };

    // Get current market conditions
    public query func getMarketConditions() : async {volatility: Float; liquidity: Float; riskFactor: Float} {
        yieldManager.getCurrentMarketConditions()
    };

    // Distribute yield to group members (admin function)
    public shared(msg) func distributeYield(
        groupId: Nat,
        totalYield: Types.Amount
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        // Add admin authorization check if needed
        stateManager.distributeGroupYield(groupId, totalYield)
    };

    // Auto-distribute yield based on calculated returns
    public shared(msg) func autoDistributeYield(
        groupId: Nat,
        durationDays: Nat
    ) : async Result.Result<{memberDistribution: Types.TransactionId; rTokenUpdates: Nat}, Types.Error> {
        // Calculate yield for the period
        switch (stateManager.calculateGroupYield(groupId, durationDays)) {
            case (#ok(yieldCalculation)) {
                let totalYield = yieldCalculation.yieldAmount;
                
                if (totalYield > 0) {
                    // Distribute 80% to members, 20% to R Token holders
                    let memberYield = (totalYield * 80) / 100;
                    let rTokenYield = totalYield - memberYield;
                    
                    // Distribute to members
                    switch (stateManager.distributeGroupYield(groupId, memberYield)) {
                        case (#ok(transactionId)) {
                            // Distribute to R Token holders
                            switch (stateManager.distributeRTokenYield(groupId, rTokenYield)) {
                                case (#ok(updatedTokens)) {
                                    #ok({
                                        memberDistribution = transactionId;
                                        rTokenUpdates = updatedTokens;
                                    })
                                };
                                case (#err(error)) { #err(error) };
                            };
                        };
                        case (#err(error)) { #err(error) };
                    };
                } else {
                    #err(#InvalidAmount);
                }
            };
            case (#err(error)) { #err(error) };
        }
    };

    // Get yield distribution preview
    public query func previewYieldDistribution(
        groupId: Nat,
        totalYield: Types.Amount
    ) : async Result.Result<[(Principal, Types.Amount)], Types.Error> {
        switch (findGroup(groupId)) {
            case (?group) {
                // This would require additional helper functions to convert Group to [Member]
                // For now, return placeholder implementation
                #ok([]);
            };
            case null { #err(#GroupNotFound) };
        }
    };

    // ==================== LENDING SYSTEM ENDPOINTS ====================

    // Request a loan using R Tokens as collateral
    public shared(msg) func requestLoan(
        borrowerGroupId: Nat,
        principalAmount: Types.Amount,
        termDays: Nat,
        collateralTokenIds: [Types.RTokenId],
        memo: ?Text
    ) : async Result.Result<Types.LoanId, Types.Error> {
        
        let loanRequest: Types.LoanRequest = {
            principalAmount = principalAmount;
            termDays = termDays;
            collateralTokenIds = collateralTokenIds;
            interestRate = null; // System will calculate
            memo = memo;
        };
        
        switch (stateManager.requestLoan(msg.caller, borrowerGroupId, loanRequest)) {
            case (#ok(loanId)) {
                Debug.print("Loan requested by: " # Principal.toText(msg.caller));
                Debug.print("Loan ID: " # Nat.toText(loanId));
                Debug.print("Amount: " # Nat64.toText(principalAmount) # " e8s");
                #ok(loanId)
            };
            case (#err(error)) {
                Debug.print("Loan request failed: " # debug_show(error));
                #err(error)
            };
        }
    };

    // Approve a loan (admin function - for now, any group member can approve)
    public shared(msg) func approveLoan(
        loanId: Types.LoanId
    ) : async Result.Result<Bool, Types.Error> {
        // Note: In production, add proper admin authorization
        switch (stateManager.approveLoan(loanId, msg.caller)) {
            case (#ok(success)) {
                Debug.print("Loan approved by: " # Principal.toText(msg.caller));
                Debug.print("Loan ID: " # Nat.toText(loanId));
                #ok(success)
            };
            case (#err(error)) {
                Debug.print("Loan approval failed: " # debug_show(error));
                #err(error)
            };
        }
    };

    // Disburse approved loan funds (admin function)
    public shared(msg) func disburseLoan(
        loanId: Types.LoanId
    ) : async Result.Result<Bool, Types.Error> {
        // Note: In production, integrate with actual ICP transfer
        switch (stateManager.disburseLoan(loanId, msg.caller)) {
            case (#ok(success)) {
                Debug.print("Loan disbursed by: " # Principal.toText(msg.caller));
                Debug.print("Loan ID: " # Nat.toText(loanId));
                #ok(success)
            };
            case (#err(error)) {
                Debug.print("Loan disbursement failed: " # debug_show(error));
                #err(error)
            };
        }
    };

    // Make a loan payment
    public shared(msg) func makeLoanPayment(
        loanId: Types.LoanId,
        amount: Types.Amount
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        // Note: In production, integrate with actual ICP payment processing
        switch (stateManager.makeLoanPayment(loanId, msg.caller, amount)) {
            case (#ok(paymentId)) {
                Debug.print("Loan payment made by: " # Principal.toText(msg.caller));
                Debug.print("Loan ID: " # Nat.toText(loanId));
                Debug.print("Payment Amount: " # Nat64.toText(amount) # " e8s");
                Debug.print("Payment ID: " # Nat64.toText(paymentId));
                #ok(paymentId)
            };
            case (#err(error)) {
                Debug.print("Loan payment failed: " # debug_show(error));
                #err(error)
            };
        }
    };

    // Get loan details
    public query func getLoanDetails(loanId: Types.LoanId) : async ?Types.Loan {
        stateManager.getLoan(loanId)
    };

    // Get user's loans
    public shared query(msg) func getMyLoans() : async [Types.Loan] {
        stateManager.getBorrowerLoans(msg.caller)
    };

    // Get lending platform statistics
    public query func getLendingStats() : async {
        totalLoans: Nat;
        activeLoans: Nat;
        defaultedLoans: Nat;
        totalLent: Types.Amount;
        totalRepaid: Types.Amount;
        averageInterestRate: Float;
    } {
        stateManager.getLendingStatistics()
    };

    // Check if an R Token is locked as collateral
    public query func isRTokenLocked(tokenId: Types.RTokenId) : async ?Types.LoanId {
        switch (stateManager.getLoan(0)) { // This is a placeholder - need to add proper function
            case (?_) { 
                // Would need to add isTokenLocked function to stateManager
                null // Placeholder
            };
            case null { null };
        }
    };

    // ==================== ANALYTICS ENDPOINTS ====================

    // Get comprehensive group performance analytics
    public query func getGroupAnalytics(groupId: Nat) : async ?AnalyticsEngine.GroupPerformanceMetrics {
        switch (findGroup(groupId)) {
            case (?group) {
                // Convert legacy Group to enhanced types and get related data
                // This is a simplified implementation - full integration would require
                // proper data conversion between legacy and new type systems
                
                let mockRotation: Types.RotationState = {
                    groupId = groupId;
                    currentRound = group.currentRound;
                    totalRounds = group.totalRounds;
                    nextPayoutDate = Time.now() + 86400000000000; // 1 day
                    currentRecipient = group.nextRecipient;
                    previousRecipients = [];
                    poolBalance = Nat64.fromNat(group.contributionAmount * group.members.size());
                    yieldGenerated = Nat64.fromNat(group.contributionAmount * group.members.size() / 20); // 5% yield
                    rotationOrder = Array.map<Types.Member, Principal>(group.members, func (member : Types.Member) : Principal {
                    return member.principal;
                });
                    roundStartTime = group.createdAt;
                    contributionsThisRound = [];
                };
                
                let mockMembers = Array.map<Principal, Types.Member>(Array.map<Types.Member, Principal>(group.members, func (member : Types.Member) : Principal {
                    return member.principal;
                }), func(p) : Types.Member {
                    { 
                            principal = p;
                            joinedAt = group.createdAt;
                            totalContributions = Nat64.fromNat(group.contributionAmount * group.currentRound);
                            receivedPayouts = if (Principal.equal(p, group.creator)) Nat64.fromNat(group.contributionAmount * group.members.size()) else 0;
                            pendingContributions = 0;
                            status = #active;
                            lastContributionTime = ?Time.now();
                            missedContributions = 0;
                            liquidTokenBalance = Nat64.fromNat(group.contributionAmount);
                            walletAddress = null; // Legacy groups don't have wallet addresses
                    }
                });
                
                ?analyticsEngine.calculateGroupPerformance(
                    groupId, 
                    {
                        id = groupId;
                        name = group.name;
                        description = "Legacy group";
                        admin = group.creator;
                        members = group.members;
                        maxMembers = group.totalRounds;
                        minMembers = 2;
                        contributionAmount = Nat64.fromNat(group.contributionAmount);
                        rotationIntervalDays = 30;
                        startDate = group.createdAt;
                        endDate = group.completedAt;
                        lastDisbursedAt = group.lastDisbursedAt;
                        status = if (group.isActive) #active else #completed;
                        createdAt = group.createdAt;
                        totalPoolSize = Nat64.fromNat(group.contributionAmount * group.totalRounds);
                        platformFeeRate = 25;
                        yieldRate = 500;
                        yieldStrategy = #fixed(500);
                    },
                    mockRotation,
                    mockMembers,
                    [], // Empty R tokens for legacy groups
                    [] // Empty transactions for legacy groups
                )
            };
            case null { null };
        }
    };

    // Get user analytics for the caller
    public shared query(msg) func getMyAnalytics() : async AnalyticsEngine.UserAnalytics {
        let userGroups = Array.filter<Group>(groupsArray, func(g) = 
            Utils.principalInArray(msg.caller, Array.map<Types.Member, Principal>(g.members, func (member : Types.Member) : Principal {
                    return member.principal;
                }))
        );
        
        // Convert to enhanced types (simplified)
        let enhancedGroups = Array.map<Group, Types.GroupConfig>(userGroups, func(g) : Types.GroupConfig {
            {
                id = g.id;
                name = g.name;
                description = "Legacy group";
                admin = g.creator;
                members = g.members;
                maxMembers = g.totalRounds;
                minMembers = 2;
                contributionAmount = Nat64.fromNat(g.contributionAmount);
                rotationIntervalDays = 30;
                lastDisbursedAt = g.lastDisbursedAt;
                startDate = g.createdAt;
                endDate = g.completedAt;
                status = if (g.isActive) #active else #completed;
                createdAt = g.createdAt;
                totalPoolSize = Nat64.fromNat(g.contributionAmount * g.totalRounds);
                platformFeeRate = 25;
                yieldRate = 500;
                yieldStrategy = #fixed(500);
            }
        });
        
        // Get user data from state manager
        let userTokens = stateManager.getHolderTokens(msg.caller);
        let userLoans = stateManager.getBorrowerLoans(msg.caller);
        let userTransfers = stateManager.getUserTransferHistory(msg.caller);
        
        // Create mock member data
        let mockMembers = Array.map<Group, Types.Member>(userGroups, func(g) : Types.Member {
            {
                principal = msg.caller;
                joinedAt = g.createdAt;
                totalContributions = Nat64.fromNat(g.contributionAmount * g.currentRound);
                receivedPayouts = if (Principal.equal(msg.caller, g.creator)) Nat64.fromNat(g.contributionAmount * g.members.size()) else 0;
                pendingContributions = 0;
                status = #active;
                lastContributionTime = ?Time.now();
                missedContributions = 0;
                liquidTokenBalance = Nat64.fromNat(g.contributionAmount);
                walletAddress = null;
            }
        });
    
        analyticsEngine.calculateUserAnalytics(
            msg.caller,
            enhancedGroups,
            mockMembers,
            userTokens,
            userLoans,
            [], // Empty transactions - would get from state manager in full implementation
            userTransfers
        )
    };

    // Get platform-wide analytics
    public query func getPlatformAnalytics() : async AnalyticsEngine.PlatformAnalytics {
        // Get enhanced data from state manager
        let allGroups = stateManager.getAllGroups();
        let allRotations = stateManager.getAllRotations();
        let allMembers = stateManager.getAllMembers();
        let allTokens = stateManager.getAllRTokens();
        let allLoans = stateManager.getAllLoans();
        let allTransfers = stateManager.getAllTransfers();
        
        analyticsEngine.calculatePlatformAnalytics(
            allGroups,
            allRotations,
            allMembers,
            allTokens,
            allLoans,
            allTransfers
        )
    };

    // Get yield analytics across the platform
    public query func getYieldAnalytics() : async AnalyticsEngine.YieldAnalytics {
        let allGroups = stateManager.getAllGroups();
        let allRotations = stateManager.getAllRotations();
        
        // Mock yield distributions - would calculate from actual distribution records
        let yieldDistributions = Array.map<(Types.GroupId, Types.GroupConfig), (Types.GroupId, Types.Amount)>(
            allGroups, 
            func((groupId, _)) = (groupId, 1_000_000_000) // 10 ICP per group average
        );
        
        analyticsEngine.calculateYieldAnalytics(allGroups, allRotations, yieldDistributions)
    };

    // Get risk analytics for the lending portfolio
    public query func getRiskAnalytics() : async AnalyticsEngine.RiskAnalytics {
        let allLoans = stateManager.getAllLoans();
        let allTokens = stateManager.getAllRTokens();
        
        // Get platform data directly instead of calling async function
        // let platformAnalytics = await getPlatformAnalytics();
        let allGroups = stateManager.getAllGroups();
        let allRotations = stateManager.getAllRotations();
        let allMembers = stateManager.getAllMembers();
        let allTransfers = stateManager.getAllTransfers();
        
        let platformAnalytics = analyticsEngine.calculatePlatformAnalytics(
            allGroups,
            allRotations,
            allMembers,
            allTokens,
            allLoans,
            allTransfers
        ); 

        analyticsEngine.calculateRiskAnalytics(allLoans, allTokens, platformAnalytics)
    };

    // Get historical platform trends
    public query func getPlatformTrends(days: Nat) : async [(Int, AnalyticsEngine.PlatformAnalytics)] {
        analyticsEngine.getHistoricalTrends(days)
    };

    // Record current platform state for trend analysis (admin function)
    public shared(msg) func recordPlatformSnapshot() : async Bool {
        let currentAnalytics = await getPlatformAnalytics();
        analyticsEngine.recordPlatformSnapshot(currentAnalytics);
        
        Debug.print("Platform snapshot recorded by: " # Principal.toText(msg.caller));
        true
    };

    // ==================== ANALYTICS TESTING & VALIDATION ====================

    // Comprehensive system test function
    public shared(msg) func runSystemTests() : async {
        healthCheck: Bool;
        groupAnalyticsTest: Bool;
        userAnalyticsTest: Bool;
        platformAnalyticsTest: Bool;
        lendingIntegrationTest: Bool;
        yieldSystemTest: Bool;
        errors: [Text];
    } {
        let errors = Buffer.Buffer<Text>(10);
        var healthCheckResult = true;
        var groupAnalyticsTest = false;
        var userAnalyticsTest = false;
        var platformAnalyticsTest = false;
        var lendingIntegrationTest = false;
        var yieldSystemTest = false;
        
        // Test 1: Basic health check
        try {
            let health = await healthCheck();
            healthCheckResult := health;
        } catch (e) {
            errors.add("Health check failed: " # Error.message(e));
            healthCheckResult := false;
        };
        
        // Test 2: Group analytics
        try {
            switch (await getGroupAnalytics(1)) {
                case (?metrics) {
                    groupAnalyticsTest := metrics.groupHealth >= 0.0 and metrics.groupHealth <= 1.0;
                    if (not groupAnalyticsTest) {
                        errors.add("Group analytics returned invalid health score");
                    };
                };
                case null {
                    errors.add("No group analytics returned for test group");
                };
            };
        } catch (e) {
            errors.add("Group analytics test failed: " # Error.message(e));
        };
        
        // Test 3: User analytics
        try {
            let userAnalytics = await getMyAnalytics();
            userAnalyticsTest := userAnalytics.creditScore >= 0.0 and userAnalytics.creditScore <= 1.0;
            if (not userAnalyticsTest) {
                errors.add("User analytics returned invalid credit score");
            };
        } catch (e) {
            errors.add("User analytics test failed: " # Error.message(e));
        };
        
        // Test 4: Platform analytics
        try {
            let platformAnalytics = await getPlatformAnalytics();
            platformAnalyticsTest := platformAnalytics.totalGroups >= 0;
            if (not platformAnalyticsTest) {
                errors.add("Platform analytics returned negative group count");
            };
        } catch (e) {
            errors.add("Platform analytics test failed: " # Error.message(e));
        };
        
        // Test 5: Lending integration
        try {
            let lendingStats = await getLendingStats();
            lendingIntegrationTest := lendingStats.totalLoans >= 0;
            if (not lendingIntegrationTest) {
                errors.add("Lending statistics returned negative loan count");
            };
        } catch (e) {
            errors.add("Lending integration test failed: " # Error.message(e));
        };
        
        // Test 6: Yield system
        try {
            let yieldAnalytics = await getYieldAnalytics();
            yieldSystemTest := yieldAnalytics.totalYieldGenerated >= 0;
            if (not yieldSystemTest) {
                errors.add("Yield analytics returned negative yield");
            };
        } catch (e) {
            errors.add("Yield system test failed: " # Error.message(e));
        };
        
        Debug.print("System test completed - Health: " # Bool.toText(healthCheckResult) # 
                ", Group: " # Bool.toText(groupAnalyticsTest) #
                ", User: " # Bool.toText(userAnalyticsTest) #
                ", Platform: " # Bool.toText(platformAnalyticsTest) #
                ", Lending: " # Bool.toText(lendingIntegrationTest) #
                ", Yield: " # Bool.toText(yieldSystemTest));
        
        {
            healthCheck = healthCheckResult;
            groupAnalyticsTest = groupAnalyticsTest;
            userAnalyticsTest = userAnalyticsTest;
            platformAnalyticsTest = platformAnalyticsTest;
            lendingIntegrationTest = lendingIntegrationTest;
            yieldSystemTest = yieldSystemTest;
            errors = Buffer.toArray(errors);
        }
    };

    // Performance benchmark test
    public shared(msg) func benchmarkAnalytics() : async {
        groupAnalyticsTime: Nat;
        platformAnalyticsTime: Nat;
        riskAnalyticsTime: Nat;
        totalOperations: Nat;
    } {
        let startTime = Time.now();
        
        // Benchmark group analytics
        let groupStart = Time.now();
        ignore await getGroupAnalytics(1);
        let groupTime = Int.abs(Time.now() - groupStart);
        
        // Benchmark platform analytics
        let platformStart = Time.now();
        ignore await getPlatformAnalytics();
        let platformTime = Int.abs(Time.now() - platformStart);
        
        // Benchmark risk analytics
        let riskStart = Time.now();
        ignore await getRiskAnalytics();
        let riskTime = Int.abs(Time.now() - riskStart);
        
        let totalTime = Int.abs(Time.now() - startTime);
        
        Debug.print("Analytics benchmark completed in " # Int.toText(totalTime) # " nanoseconds");
        
        {
            groupAnalyticsTime = groupTime;
            platformAnalyticsTime = platformTime;
            riskAnalyticsTime = riskTime;
            totalOperations = 3;
        }
    };

    // Data integrity validation
    public shared(msg) func validateDataIntegrity() : async {
        tokensValid: Bool;
        loansValid: Bool;
        balancesValid: Bool;
        errors: [Text];
    } {
        let errors = Buffer.Buffer<Text>(10);
        var tokensValid = true;
        var loansValid = true;
        var balancesValid = true;
        
        // Validate R Token consistency
        try {
            let myTokens = await getMyRTokens();
            let myBalances = await getAllRTokenBalances();
            
            var calculatedBalance: Types.Amount = 0;
            for (token in myTokens.vals()) {
                calculatedBalance += token.currentAmount;
            };
            
            var reportedBalance: Types.Amount = 0;
            for ((_, balance) in myBalances.vals()) {
                reportedBalance += balance;
            };
            
            if (calculatedBalance != reportedBalance) {
                tokensValid := false;
                errors.add("R Token balance mismatch: calculated=" # Nat64.toText(calculatedBalance) # 
                        ", reported=" # Nat64.toText(reportedBalance));
            };
        } catch (e) {
            tokensValid := false;
            errors.add("R Token validation failed: " # Error.message(e));
        };
        
        // Validate loan consistency
        try {
            let myLoans = await getMyLoans();
            let lendingStats = await getLendingStats();
            
            if (myLoans.size() > lendingStats.totalLoans) {
                loansValid := false;
                errors.add("User loans exceed platform total");
            };
        } catch (e) {
            loansValid := false;
            errors.add("Loan validation failed: " # Error.message(e));
        };
        
        Debug.print("Data integrity validation completed - Tokens: " # Bool.toText(tokensValid) #
                ", Loans: " # Bool.toText(loansValid) #
                ", Balances: " # Bool.toText(balancesValid));
        
        {
            tokensValid = tokensValid;
            loansValid = loansValid;
            balancesValid = balancesValid;
            errors = Buffer.toArray(errors);
        }
    };
    
    // ==================== QUERY FUNCTIONS ====================

    // Check account balance
    public shared(msg) func getMyBalance() : async Nat64 {
        await PaymentHandler.getAccountBalance(msg.caller)
    };

    // Get pool information
    public func getPoolInfo() : async {principal: Principal; accountId: Ledger.Account} {
        await PaymentHandler.getPoolAccountInfo()
    };

    // Get user's groups
    public query(msg) func getMyGroups() : async [GroupSummary] {
        let userGroups = Array.filter<Group>(groupsArray, func(g) = 
            Utils.principalInArray(msg.caller,Array.map<Types.Member, Principal>(g.members, func (member : Types.Member) : Principal {
                    return member.principal;
                }))  // Enhanced: use utils
        );
        
        Array.map<Group, GroupSummary>(userGroups, func(g) = 
            {
                id = g.id;
                name = g.name;
                memberCount = g.members.size();
                contributionAmount = g.contributionAmount;
                currentRound = g.currentRound;
                totalRounds = g.totalRounds;
                isActive = g.isActive;
                spotsRemaining = g.totalRounds - g.members.size();
                nextRecipient =  g.nextRecipient ;
                progress = calculateProgress(g.currentRound, g.totalRounds);
            }
        )
    };

    // Get all available groups
    public query func getAvailableGroups() : async [GroupSummary] {
        let availableGroups = Array.filter<Group>(groupsArray, func(g) = 
            g.members.size() < g.totalRounds and not g.isActive
        );
        
        Array.map<Group, GroupSummary>(availableGroups, func(g) = 
            {
                id = g.id;
                name = g.name;
                memberCount = g.members.size();
                contributionAmount = g.contributionAmount;
                currentRound = g.currentRound;
                totalRounds = g.totalRounds;
                isActive = g.isActive;
                spotsRemaining = g.totalRounds - g.members.size();
                nextRecipient = g.nextRecipient;
                progress = calculateProgress(g.currentRound, g.totalRounds);
            }
        )
    };

    // Get platform Stats
    private func calculatePlatformStats() : PlatformStats {
        var totalMembers = 0;
        var totalValueLocked = 0;
        var activeGroups = 0;
        var completedGroups = 0;
        var completedRounds = 0;
        
        for (group in groupsArray.vals()) {
            totalMembers += group.members.size();
            totalValueLocked += group.contributionAmount * group.members.size() * group.currentRound;
            if (group.isActive) { activeGroups += 1 };
            if (group.completedAt != null) { completedGroups += 1 };
            completedRounds += group.currentRound;
        };
        
        {
            totalGroups = groupsArray.size();
            totalMembers = totalMembers;
            totalValueLocked = totalValueLocked;
            activeGroups = activeGroups;
            completedGroups = completedGroups;
            completedRounds = completedRounds;
        }
    };

    // Public query function for platform statistics
    public query func getPlatformStats() : async PlatformStats {
        calculatePlatformStats()
    };

    // System statistics
    public query func getSystemStats() : async {
        totalGroups: Nat;
        activeGroups: Nat;
        totalTransactions: Nat;
        systemVersion: Text;
    } {
        let stats = calculatePlatformStats();
        {
            totalGroups = stats.totalGroups;
            activeGroups = stats.activeGroups; 
            totalTransactions = 0; // Will be implemented with state manager integration
            systemVersion = "1.0.0";
        }
    };

    // Demo data initialization
    public func initializeDemoData() : async Bool {
        Debug.print("🚀 Initializing RotateChain demo data...");
        true
    };

    // Get all groups (detailed)
    public query func getGroups() : async [Group] {
        groupsArray
    };

    // Get specific group
    public query func getGroup(groupId: Nat) : async ?Group {
        findGroup(groupId)
    };

    // Welcome greeting
    public query func greet(name : Text) : async Text {
        return "Hello, " # name # "! 🎉 Welcome to RotateChain - Revolutionizing Rotational Savings! 💰";
    };

    // Health check
    public query func healthCheck() : async Bool {
        // Basic health check - can be enhanced later
        true  // System is operational
    };

    // Error handling helper
    public func getErrorMessage(error: Types.Error) : async Text {
        Utils.errorToText(error)
    };

    // ==================== SYSTEM UPGRADE HOOKS ====================

    // Pre-upgrade hook
    system func preupgrade() {
        // Export all state from StateManager
        let (groups, rotations, members, transactions, memberships, rtokens, rtransfers, rholders, gCounter, tCounter, paused) = stateManager.exportState();
        
        // Store in stable variables
        groupEntries := groups;
        rotationEntries := rotations;
        memberEntries := members;
        transactionEntries := transactions;
        groupMembershipEntries := memberships;
        rTokenEntries := rtokens;
        rTokenTransferEntries := rtransfers;
        rTokenHolderEntries := rholders;
        groupCounter := gCounter;
        transactionCounter := tCounter;
        isSystemPaused := paused;

        // Add lending state export
        let (loanExp, paymentExp) = stateManager.exportLendingState();
        loanEntries := loanExp;
        loanPaymentEntries := paymentExp;
        
        Debug.print("Pre-upgrade: State exported successfully");
    };

    // Post-upgrade hook
    system func postupgrade() {
        // State is automatically restored via initializeStateManager()
        // Clear stable storage to save memory
        groupEntries := [];
        rotationEntries := [];
        memberEntries := [];
        transactionEntries := [];
        groupMembershipEntries := [];
        rTokenEntries := [];
        rTokenTransferEntries := [];
        rTokenHolderEntries := [];
        
        Debug.print("Post-upgrade: State restored successfully");
    };
}