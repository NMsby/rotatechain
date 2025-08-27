// state_manager.mo - Centralized state management with upgrade support
import RBTree "mo:base/RBTree";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import Result "mo:base/Result";
import Time "mo:base/Time";

import Types "./types";
import RTokenManager "./r_token_manager";
import YieldManager "./yield_manager";
import YielDistributor "./yield_distributor";

module StateManager {
    public type GroupId = Types.GroupId;
    public type GroupConfig = Types.GroupConfig;
    public type RotationState = Types.RotationState;
    public type Member = Types.Member;
    public type Transaction = Types.Transaction;
    public type TransactionId = Types.TransactionId;

    // R Token types
    public type RTokenId = Types.RTokenId;
    public type RToken = Types.RToken;
    public type RTokenTransfer = Types.RTokenTransfer;

    public class StateManager() {
        
        // ==================== NON-STABLE VARIABLES ====================
        // State persistence handled at actor level
        
        private var groupCounter: GroupId = 0;
        private var transactionCounter: TransactionId = 0;
        private var isSystemPaused: Bool = false;

        // ==================== R TOKEN INTEGRATION ====================
        // Initialize R Token manager as part of state management
        private let rTokenManager = RTokenManager.RTokenManager();

        // ==================== YIELD INTEGRATION ====================

        // Initialize Yield manager as part of state management
        private let yieldManager = YieldManager.YieldManager();

        // Initialize Yield distributor as part of state management
        private let yieldDistributor = YieldDistributor.YieldDistributor();
        
        // ==================== RUNTIME STATE ====================
        // Rebuilt from stable storage on canister start
        
        private var groups = RBTree.RBTree<GroupId, GroupConfig>(Nat.compare);
        private var rotations = RBTree.RBTree<GroupId, RotationState>(Nat.compare);
        private var transactions = RBTree.RBTree<TransactionId, Transaction>(Nat64.compare);
        private var groupMemberships = RBTree.RBTree<Principal, [GroupId]>(Principal.compare);
        
        // Member data: GroupId -> (Principal -> Member)
        private var members = RBTree.RBTree<GroupId, RBTree.RBTree<Principal, Member>>(Nat.compare);

        // ==================== STATE INITIALIZATION ====================

        // Restore state from stable storage
        public func initializeFromState(
            groupEntries: [(GroupId, GroupConfig)],
            rotationEntries: [(GroupId, RotationState)],
            memberEntries: [(GroupId, [(Principal, Member)])],
            transactionEntries: [(TransactionId, Transaction)],
            groupMembershipEntries: [(Principal, [GroupId])],
            rTokenEntries: [(Types.RTokenId, Types.RToken)],
            rTokenTransferEntries: [(Types.TransactionId, Types.RTokenTransfer)],
            rTokenHolderEntries: [(Principal, [(Types.GroupId, Types.Amount)])],
            gCounter: GroupId,
            tCounter: TransactionId,
            paused: Bool
        ) {
            // Initialize counters and flags
            groupCounter := gCounter;
            transactionCounter := tCounter;
            isSystemPaused := paused;

            // Initialize groups
            for ((id, group) in groupEntries.vals()) {
                groups.put(id, group);
                if (id >= groupCounter) {
                    groupCounter := id + 1;
                };
            };
            
            // Initialize rotations
            for ((id, rotation) in rotationEntries.vals()) {
                rotations.put(id, rotation);
            };
            
            // Initialize transactions
            for ((id, transaction) in transactionEntries.vals()) {
                transactions.put(id, transaction);
                if (id >= transactionCounter) {
                    transactionCounter := id + 1;
                };
            };
            
            // Initialize group memberships
            for ((principal, groupIds) in groupMembershipEntries.vals()) {
                groupMemberships.put(principal, groupIds);
            };
            
            // Initialize members (nested structure)
            for ((groupId, memberList) in memberEntries.vals()) {
                let memberTree = RBTree.RBTree<Principal, Member>(Principal.compare);
                for ((principal, member) in memberList.vals()) {
                    memberTree.put(principal, member);
                };
                members.put(groupId, memberTree);
            };
            
            // Initialize R Token manager with stored state
            rTokenManager.initializeFromState(rTokenEntries, rTokenTransferEntries, rTokenHolderEntries);
        };

        public func exportState() : (
            [(GroupId, GroupConfig)],
            [(GroupId, RotationState)],
            [(GroupId, [(Principal, Member)])],
            [(TransactionId, Transaction)],
            [(Principal, [GroupId])],
            [(Types.RTokenId, Types.RToken)],
            [(Types.TransactionId, Types.RTokenTransfer)],
            [(Principal, [(Types.GroupId, Types.Amount)])],
            GroupId,
            TransactionId,
            Bool
        ) {
            let groupEntries = Iter.toArray(groups.entries());
            let rotationEntries = Iter.toArray(rotations.entries());
            let transactionEntries = Iter.toArray(transactions.entries());
            let groupMembershipEntries = Iter.toArray(groupMemberships.entries());
            
            // Export nested member structure
            let memberBuffer = Buffer.Buffer<(GroupId, [(Principal, Member)])>(RBTree.size(members.share()));
            for ((groupId, memberTree) in members.entries()) {
                let memberArray = Iter.toArray(memberTree.entries());
                memberBuffer.add((groupId, memberArray));
            };
            let memberEntries = Buffer.toArray(memberBuffer);
            
            // Export R Token state
            let (rTokenEntries, rTokenTransferEntries, rTokenHolderEntries) = rTokenManager.exportState();
            
            (groupEntries, rotationEntries, memberEntries, transactionEntries, groupMembershipEntries, 
             rTokenEntries, rTokenTransferEntries, rTokenHolderEntries, groupCounter, transactionCounter, isSystemPaused)
        };

        // ==================== GROUP OPERATIONS ====================
        
        public func getGroup(groupId: GroupId) : ?GroupConfig {
            groups.get(groupId)
        };

        public func putGroup(groupId: GroupId, group: GroupConfig) {
            groups.put(groupId, group);
        };

        public func deleteGroup(groupId: GroupId) {
            groups.delete(groupId);
            rotations.delete(groupId);
            members.delete(groupId);
            // Note: R Token cleanup is handled by the R Token manager
        };

        public func getAllGroups() : [(GroupId, GroupConfig)] {
            Iter.toArray(groups.entries())
        };

        public func getActiveGroups() : [(GroupId, GroupConfig)] {
            let activeGroups = Buffer.Buffer<(GroupId, GroupConfig)>(RBTree.size(groups.share()));
            for ((id, group) in groups.entries()) {
                if (group.status == #active) {
                    activeGroups.add((id, group));
                };
            };
            Buffer.toArray(activeGroups)
        };

        // ==================== ROTATION OPERATIONS ====================
        
        public func getRotation(groupId: GroupId) : ?RotationState {
            rotations.get(groupId)
        };

        public func putRotation(groupId: GroupId, rotation: RotationState) {
            rotations.put(groupId, rotation);
        };

        public func deleteRotation(groupId: GroupId) {
            rotations.delete(groupId);
        };

        // ==================== MEMBER OPERATIONS ====================
        
        public func getMember(groupId: GroupId, principal: Principal) : ?Member {
            switch (members.get(groupId)) {
                case (?memberTree) { memberTree.get(principal) };
                case null { null };
            }
        };

        public func putMember(groupId: GroupId, principal: Principal, member: Member) {
            let memberTree = switch (members.get(groupId)) {
                case (?tree) { tree };
                case null {
                    let newTree = RBTree.RBTree<Principal, Member>(Principal.compare);
                    members.put(groupId, newTree);
                    newTree
                };
            };
            
            memberTree.put(principal, member);
            addMembershipIndex(principal, groupId);
        };

        public func removeMember(groupId: GroupId, principal: Principal) {
            switch (members.get(groupId)) {
                case (?memberTree) {
                    memberTree.delete(principal);
                };
                case null { };
            };
            
            // Remove group membership index
            removeMembershipIndex(principal, groupId);
        };

        public func getGroupMembers(groupId: GroupId) : [Member] {
            switch (members.get(groupId)) {
                case (?memberTree) {
                    let memberBuffer = Buffer.Buffer<Member>(RBTree.size(memberTree.share()));
                    for ((_, member) in memberTree.entries()) {
                        memberBuffer.add(member);
                    };
                    Buffer.toArray(memberBuffer)
                };
                case null { [] };
            }
        };

        // Update member's liquid token balance (integrated with R Token system)
        public func updateMemberLiquidTokenBalance(groupId: GroupId, principal: Principal, newBalance: Types.Amount) {
            switch (members.get(groupId)) {
                case (?memberMap) {
                    switch (memberMap.get(principal)) {
                        case (?member) {
                            let updatedMember = { member with liquidTokenBalance = newBalance };
                            memberMap.put(principal, updatedMember);
                        };
                        case null { };
                    };
                };
                case null { };
            };
        };

        // ==================== MEMBERSHIP INDEX ====================
        
        private func addMembershipIndex(principal: Principal, groupId: GroupId) {
            switch (groupMemberships.get(principal)) {
                case (?currentGroups) {
                    // Check if already exists to avoid duplicates
                    let exists = Array.find<GroupId>(currentGroups, func(id) = id == groupId);
                    switch (exists) {
                        case null {
                            let updatedGroups = Array.append<GroupId>(currentGroups, [groupId]);
                            groupMemberships.put(principal, updatedGroups);
                        };
                        case (?_) { }; // Already exists
                    };
                };
                case null {
                    groupMemberships.put(principal, [groupId]);
                };
            }
        };

        private func removeMembershipIndex(principal: Principal, groupId: GroupId) {
            switch (groupMemberships.get(principal)) {
                case (?currentGroups) {
                    let filteredGroups = Array.filter<GroupId>(currentGroups, func(id) = id != groupId);
                    if (filteredGroups.size() == 0) {
                        groupMemberships.delete(principal);
                    } else {
                        groupMemberships.put(principal, filteredGroups);
                    };
                };
                case null { };
            }
        };

        public func getUserGroups(user: Principal) : [GroupConfig] {
            switch (groupMemberships.get(user)) {
                case (?userGroupIds) {
                    let userGroups = Buffer.Buffer<GroupConfig>(userGroupIds.size());
                    for (groupId in userGroupIds.vals()) {
                        switch (groups.get(groupId)) {
                            case (?group) { userGroups.add(group) };
                            case null { };
                        };
                    };
                    Buffer.toArray(userGroups)
                };
                case null { [] };
            }
        };

        // ==================== R TOKEN DELEGATED OPERATIONS ====================
        
        // Issue R Tokens when contribution is made
        public func issueRTokensForContribution(
            groupId: GroupId,
            recipient: Principal,
            contributionAmount: Types.Amount,
            memo: ?Text
        ) : Result.Result<RTokenId, Types.Error> {
            let result = rTokenManager.issueRTokens(groupId, recipient, contributionAmount, memo);
            
            // Update member's liquid token balance
            switch (result) {
                case (#ok(_tokenId)) {
                    let currentBalance = rTokenManager.getRTokenBalance(recipient, groupId);
                    updateMemberLiquidTokenBalance(groupId, recipient, currentBalance);
                };
                case (#err(_)) { };
            };
            
            result
        };

        // Transfer R Tokens between members
        public func transferRTokensWithValidation(
            tokenId: RTokenId,
            from: Principal,
            to: Principal,
            amount: Types.Amount,
            memo: ?Text
        ) : Result.Result<Types.TransactionId, Types.Error> { 

            // Get token to determine group
            switch (rTokenManager.getRToken(tokenId)) {
                case (?token) {
                    // Get group to validate membership
                    switch (groups.get(token.groupId)) {
                        case (?group) {
                            // Call enhanced transfer with group member validation
                            let result = rTokenManager.transferRTokens(
                                tokenId, from, to, amount, memo, group.members
                            );

                            // Update both members' liquid token balances on success
                            switch (result) {
                                case (#ok(transferId)) {
                                    let fromBalance = rTokenManager.getRTokenBalance(from, token.groupId);
                                    let toBalance = rTokenManager.getRTokenBalance(to, token.groupId);
                                    updateMemberLiquidTokenBalance(token.groupId, from, fromBalance);
                                    updateMemberLiquidTokenBalance(token.groupId, to, toBalance);
                                    
                                    // Create transaction record
                                    let transaction: Types.Transaction = {
                                        id = nextTransactionId();
                                        groupId = token.groupId;
                                        from = from;
                                        to = ?to;
                                        amount = amount;
                                        timestamp = Time.now();
                                        transactionType = #yield; // Using yield type for R Token transfers
                                        memo = ?("R Token transfer: " # Nat64.toText(transferId));
                                        blockHeight = ?transferId;
                                    };
                                    putTransaction(transaction);
                                    
                                    #ok(transferId)
                                };
                                case (#err(error)) { #err(error) };
                            };
                        };
                        case null { #err(#GroupNotFound) };
                    };
                };
                case null { #err(#GroupNotFound) };
            };
        };

        // Get transfer history for a specific user
        public func getUserTransferHistory(user: Principal) : [Types.RTokenTransfer] {
            rTokenManager.getUserTransferHistory(user)
        };

        // Get transfer details
        public func getTransferDetails(transferId: Types.TransactionId) : ?Types.RTokenTransfer {
            rTokenManager.getTransferDetails(transferId)
        };

        // Get all transfers for a specific token
        public func getTokenTransferHistory(tokenId: Types.RTokenId) : [Types.RTokenTransfer] {
            rTokenManager.getTokenTransferHistory(tokenId)
        };

        // Redeem R Tokens for ICP
        public func redeemRTokens(
            tokenId: RTokenId,
            holder: Principal,
            amount: Types.Amount
        ) : Result.Result<Types.Amount, Types.Error> {
            let result = rTokenManager.redeemRTokens(tokenId, holder, amount);
            
            // Update member's liquid token balance
            switch (result) {
                case (#ok(_)) {
                    switch (rTokenManager.getRToken(tokenId)) {
                        case (?token) {
                            let newBalance = rTokenManager.getRTokenBalance(holder, token.groupId);
                            updateMemberLiquidTokenBalance(token.groupId, holder, newBalance);
                        };
                        case null { };
                    };
                };
                case (#err(_)) { };
            };
            
            result
        };

        // Get R Token balance for user in specific group
        public func getRTokenBalance(holder: Principal, groupId: GroupId) : Types.Amount {
            rTokenManager.getRTokenBalance(holder, groupId)
        };

        // Get all R Token balances for a user
        public func getAllRTokenBalances(holder: Principal) : [(GroupId, Types.Amount)] {
            rTokenManager.getAllRTokenBalances(holder)
        };

        // Get specific R Token details
        public func getRToken(tokenId: RTokenId) : ?RToken {
            rTokenManager.getRToken(tokenId)
        };

        // Get all R Tokens for a holder
        public func getHolderTokens(holder: Principal) : [RToken] {
            rTokenManager.getHolderTokens(holder)
        };

        // Get all R Tokens in a group
        public func getGroupTokens(groupId: GroupId) : [RToken] {
            rTokenManager.getGroupTokens(groupId)
        };

        // Get R Token statistics for a group
        public func getGroupTokenStats(groupId: GroupId) : {totalTokens: Nat; totalValue: Types.Amount; activeTokens: Nat} {
            rTokenManager.getGroupTokenStats(groupId)
        };

        // Get platform-wide R Token statistics
        public func getPlatformTokenStats() : {totalTokens: Nat; totalValue: Types.Amount; totalHolders: Nat} {
            rTokenManager.getPlatformTokenStats()
        };

        // ==================== YIELD OPERATIONS ====================

        // Calculate yield for a specific group over a duration
        public func calculateGroupYield(
            groupId: GroupId,
            durationDays: Nat
        ) : Result.Result<Types.YieldCalculation, Types.Error> {
            switch (groups.get(groupId)) {
                case (?group) {
                    switch (rotations.get(groupId)) {
                        case (?rotation) {
                            let strategy = yieldManager.createDefaultStrategy(
                                group.members.size(), 
                                group.contributionAmount
                            );
                            yieldManager.calculateYield(
                                rotation.poolBalance,
                                strategy,
                                durationDays,
                                ?rotation.poolBalance,
                                null
                            )
                        };
                        case null { #err(#GroupNotFound) };
                    };
                };
                case null { #err(#GroupNotFound) };
            }
        };

        // Update R Token yields
        public func updateRTokenYields(groupId: GroupId) : Result.Result<Nat, Types.Error> {
            switch (groups.get(groupId)) {
                case (?group) {
                    let strategy = yieldManager.createDefaultStrategy(
                        group.members.size(),
                        group.contributionAmount
                    );
                    
                    let tokens = rTokenManager.getGroupTokens(groupId);
                    var updatedCount = 0;
                    
                    for (token in tokens.vals()) {
                        switch (yieldManager.calculateRTokenYieldUpdate(token, strategy)) {
                            case (#ok(yieldAmount)) {
                                if (yieldAmount > 0) {
                                    ignore rTokenManager.updateTokenYield(token.id, yieldAmount);
                                    updatedCount += 1;
                                };
                            };
                            case (#err(_)) { /* Continue with other tokens */ };
                        };
                    };
                    
                    #ok(updatedCount)
                };
                case null { #err(#GroupNotFound) };
            }
        };

        // Distribute yield to group members
        public func distributeGroupYield(
            groupId: GroupId,
            totalYield: Types.Amount
        ) : Result.Result<Types.TransactionId, Types.Error> {
            switch (groups.get(groupId)) {
                case (?group) {
                    let groupMembers = getGroupMembers(groupId);
                    if (groupMembers.size() == 0) {
                        return #err(#NotMember);
                    };
                    
                    // Create distribution strategy
                    let strategy = yieldDistributor.createDefaultDistributionStrategy(
                        groupMembers.size(),
                        group.totalPoolSize
                    );
                    
                    // Calculate distribution
                    switch (yieldDistributor.calculateDistribution(groupId, totalYield, groupMembers, strategy)) {
                        case (#ok(distribution)) {
                            // Execute distribution to members
                            var distributedCount = 0;
                            for ((principal, yieldAmount) in distribution.distributions.vals()) {
                                // Update member balance (simulate yield payment)
                                switch (getMember(groupId, principal)) {
                                    case (?member) {
                                        let updatedMember = { 
                                            member with 
                                            receivedPayouts = member.receivedPayouts + yieldAmount;
                                            liquidTokenBalance = member.liquidTokenBalance + yieldAmount;
                                        };
                                        putMember(groupId, principal, updatedMember);
                                        distributedCount += 1;
                                    };
                                    case null { /* Skip non-existent members */ };
                                };
                            };
                            
                            // Create transaction record
                            let transactionId = nextTransactionId();
                            let transaction: Types.Transaction = {
                                id = transactionId;
                                groupId = groupId;
                                from = Principal.fromText("2vxsx-fae"); // System principal
                                to = null; // Multiple recipients
                                amount = totalYield;
                                timestamp = Time.now();
                                transactionType = #yield;
                                memo = ?("Yield distribution to " # Nat.toText(distributedCount) # " members");
                                blockHeight = ?distribution.distributionId;
                            };
                            putTransaction(transaction);
                            
                            Debug.print("Yield distributed - Group: " # Nat.toText(groupId) # 
                                    ", Amount: " # Nat64.toText(totalYield) # " e8s" #
                                    ", Members: " # Nat.toText(distributedCount));
                            
                            #ok(transactionId)
                        };
                        case (#err(error)) { #err(error) };
                    };
                };
                case null { #err(#GroupNotFound) };
            }
        };

        // Distribute yield to R Token holders in a group
        public func distributeRTokenYield(
            groupId: GroupId,
            totalYield: Types.Amount
        ) : Result.Result<Nat, Types.Error> {
            let groupTokens = rTokenManager.getGroupTokens(groupId);
            
            if (groupTokens.size() == 0) {
                return #ok(0);
            };
            
            let distributions = yieldDistributor.distributeRTokenYield(groupTokens, totalYield);
            var updatedCount = 0;
            
            for ((tokenId, yieldAmount) in distributions.vals()) {
                switch (rTokenManager.updateTokenYield(tokenId, yieldAmount)) {
                    case (#ok(_)) {
                        updatedCount += 1;
                    };
                    case (#err(_)) { /* Continue with other tokens */ };
                };
            };
            
            Debug.print("R Token yield distributed - Group: " # Nat.toText(groupId) # 
                    ", Updated tokens: " # Nat.toText(updatedCount));
            
            #ok(updatedCount)
        };

        // ==================== TRANSACTION OPERATIONS ====================
        
        public func getTransaction(transactionId: TransactionId) : ?Transaction {
            transactions.get(transactionId)
        };

        public func putTransaction(transaction: Transaction) {
            transactions.put(transaction.id, transaction);
        };

        public func getGroupTransactions(groupId: GroupId) : [Transaction] {
            let groupTransactions = Buffer.Buffer<Transaction>(100);
            for ((_, transaction) in transactions.entries()) {
                if (transaction.groupId == groupId) {
                    groupTransactions.add(transaction);
                };
            };
            Buffer.toArray(groupTransactions)
        };

        public func getUserTransactions(user: Principal) : [Transaction] {
            let userTransactions = Buffer.Buffer<Transaction>(100);
            for ((_, transaction) in transactions.entries()) {
                if (transaction.from == user or transaction.to == ?user) {
                    userTransactions.add(transaction);
                };
            };
            Buffer.toArray(userTransactions)
        };

        // ==================== ID GENERATION ====================
        
        public func nextGroupId() : GroupId {
            groupCounter += 1;
            groupCounter
        };

        public func nextTransactionId() : TransactionId {
            transactionCounter += 1;
            transactionCounter
        };

        // ==================== SYSTEM STATE ====================
        
        public func pauseSystem() {
            isSystemPaused := true;
        };

        public func resumeSystem() {
            isSystemPaused := false;
        };

        public func isSystemPausedState() : Bool {
            isSystemPaused
        };

        // ==================== STATISTICS ====================
        
        public func getSystemStatistics() : Types.GroupStatistics {
            let allGroups = Iter.toArray(groups.entries());
            let activeGroups = Array.filter<(GroupId, GroupConfig)>(allGroups, func((_, group)) = group.status == #active);
            
            var totalMembers = 0;
            var totalValueLocked : Types.Amount = 0;
            var totalYieldGenerated : Types.Amount = 0;
            
            for ((_, group) in allGroups.vals()) {
                totalMembers += group.members.size();
                switch (rotations.get(group.id)) {
                    case (?rotation) { 
                        totalValueLocked += rotation.poolBalance;
                        totalYieldGenerated += rotation.yieldGenerated;
                    };
                    case null { };
                };
            };

            let averageGroupSize = if (allGroups.size() > 0) {
                Float.fromInt(totalMembers) / Float.fromInt(allGroups.size())
            } else { 0.0 };

            // Get R Token statistics
            let rTokenStats = rTokenManager.getPlatformTokenStats();

            {
                totalGroups = allGroups.size();
                activeGroups = activeGroups.size();
                totalMembers = totalMembers;
                totalValueLocked = totalValueLocked + rTokenStats.totalValue;
                totalTransactions = RBTree.size(transactions.share());
                averageGroupSize = averageGroupSize;
                totalYieldGenerated = totalYieldGenerated;
            }
        };

        // ==================== VALIDATION & INTEGRITY ====================
        
        public func validateSystemIntegrity() : Bool {
            // Check that all group members exist in member maps
            for ((groupId, group) in groups.entries()) {
                switch (members.get(groupId)) {
                    case (?memberMap) {
                        for (principal in group.members.vals()) {
                            switch (memberMap.get(principal)) {
                                case null { return false }; // Member not found
                                case (?_) { };
                            };
                        };
                    };
                    case null { 
                        if (group.members.size() > 0) { return false }; 
                    };
                };
            };
            
            // Check that all rotations have corresponding groups
            for ((groupId, _) in rotations.entries()) {
                switch (groups.get(groupId)) {
                    case null { return false }; // Rotation without group
                    case (?_) { };
                };
            };
            
            true
        };
    }
}