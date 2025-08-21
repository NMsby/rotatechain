// state_manager.mo - Centralized state management with upgrade support
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Types "./types";

module StateManager {
    public type GroupId = Types.GroupId;
    public type GroupConfig = Types.GroupConfig;
    public type RotationState = Types.RotationState;
    public type Member = Types.Member;
    public type Transaction = Types.Transaction;
    public type TransactionId = Types.TransactionId;

    public class StateManager() {
        
        // ==================== STABLE VARIABLES ====================
        // These persist across canister upgrades
        
        private stable var groupCounter: GroupId = 0;
        private stable var transactionCounter: TransactionId = 0;
        private stable var isSystemPaused: Bool = false;
        
        // Stable storage for complex data structures
        private stable var groupEntries: [(GroupId, GroupConfig)] = [];
        private stable var rotationEntries: [(GroupId, RotationState)] = [];
        private stable var memberEntries: [(GroupId, [(Principal, Member)])] = [];
        private stable var transactionEntries: [(TransactionId, Transaction)] = [];
        private stable var groupMembershipEntries: [(Principal, [GroupId])] = [];

        // ==================== RUNTIME STATE ====================
        // Rebuilt from stable storage on canister start
        
        private var groups = HashMap.HashMap<GroupId, GroupConfig>(10, Nat.equal, Nat.hash);
        private var rotations = HashMap.HashMap<GroupId, RotationState>(10, Nat.equal, Nat.hash);
        private var transactions = HashMap.HashMap<TransactionId, Transaction>(100, Nat.equal, Nat.hash);
        private var groupMemberships = HashMap.HashMap<Principal, [GroupId]>(50, Principal.equal, Principal.hash);
        
        // Member data: GroupId -> (Principal -> Member)
        private var members = HashMap.HashMap<GroupId, HashMap.HashMap<Principal, Member>>(
            10, Nat.equal, Nat.hash
        );

        // ==================== INITIALIZATION ====================
        
        // Restore state from stable storage
        private func initializeState() {
            // Restore groups
            groups := HashMap.fromIter<GroupId, GroupConfig>(
                groupEntries.vals(), 10, Nat.equal, Nat.hash
            );
            
            // Restore rotations
            rotations := HashMap.fromIter<GroupId, RotationState>(
                rotationEntries.vals(), 10, Nat.equal, Nat.hash
            );
            
            // Restore transactions
            transactions := HashMap.fromIter<TransactionId, Transaction>(
                transactionEntries.vals(), 100, Nat.equal, Nat.hash
            );
            
            // Restore group memberships
            groupMemberships := HashMap.fromIter<Principal, [GroupId]>(
                groupMembershipEntries.vals(), 50, Principal.equal, Principal.hash
            );
            
            // Restore members (more complex due to nested structure)
            for ((groupId, memberList) in memberEntries.vals()) {
                let memberMap = HashMap.fromIter<Principal, Member>(
                    memberList.vals(), 10, Principal.equal, Principal.hash
                );
                members.put(groupId, memberMap);
            };
        };

        // Call initialization
        initializeState();

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
        };

        public func getAllGroups() : [(GroupId, GroupConfig)] {
            Iter.toArray(groups.entries())
        };

        public func getActiveGroups() : [(GroupId, GroupConfig)] {
            let activeGroups = Buffer.Buffer<(GroupId, GroupConfig)>(groups.size());
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
                case (?memberMap) { memberMap.get(principal) };
                case null { null };
            }
        };

        public func putMember(groupId: GroupId, principal: Principal, member: Member) {
            switch (members.get(groupId)) {
                case (?memberMap) { 
                    memberMap.put(principal, member);
                };
                case null {
                    let newMap = HashMap.HashMap<Principal, Member>(10, Principal.equal, Principal.hash);
                    newMap.put(principal, member);
                    members.put(groupId, newMap);
                };
            };
            
            // Update membership index
            updateMembershipIndex(principal, groupId);
        };

        public func removeMember(groupId: GroupId, principal: Principal) {
            switch (members.get(groupId)) {
                case (?memberMap) { 
                    memberMap.delete(principal);
                };
                case null { };
            };
            
            // Update membership index
            removeMembershipIndex(principal, groupId);
        };

        public func getGroupMembers(groupId: GroupId) : [(Principal, Member)] {
            switch (members.get(groupId)) {
                case (?memberMap) { Iter.toArray(memberMap.entries()) };
                case null { [] };
            }
        };

        // ==================== MEMBERSHIP INDEX ====================
        
        private func updateMembershipIndex(principal: Principal, groupId: GroupId) {
            switch (groupMemberships.get(principal)) {
                case (?currentGroups) {
                    // Check if already in list
                    let exists = Array.find<GroupId>(currentGroups, func(id) = id == groupId);
                    if (exists == null) {
                        let updatedGroups = Array.append(currentGroups, [groupId]);
                        groupMemberships.put(principal, updatedGroups);
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
            
            for ((_, group) in allGroups.vals()) {
                totalMembers += group.members.size();
                switch (rotations.get(group.id)) {
                    case (?rotation) { totalValueLocked += rotation.poolBalance };
                    case null { };
                };
            };

            let averageGroupSize = if (allGroups.size() > 0) {
                Float.fromInt(totalMembers) / Float.fromInt(allGroups.size())
            } else { 0.0 };

            {
                totalGroups = allGroups.size();
                activeGroups = activeGroups.size();
                totalMembers = totalMembers;
                totalValueLocked = totalValueLocked;
                totalTransactions = transactions.size();
                averageGroupSize = averageGroupSize;
                totalYieldGenerated = 0; // TODO: Calculate from transactions
            }
        };

        // ==================== UPGRADE HOOKS ====================
        
        public func preUpgrade() {
            // Save groups
            groupEntries := Iter.toArray(groups.entries());
            
            // Save rotations
            rotationEntries := Iter.toArray(rotations.entries());
            
            // Save members (flatten nested structure)
            let memberEntriesBuffer = Buffer.Buffer<(GroupId, [(Principal, Member)])>(members.size());
            for ((groupId, memberMap) in members.entries()) {
                memberEntriesBuffer.add((groupId, Iter.toArray(memberMap.entries())));
            };
            memberEntries := Buffer.toArray(memberEntriesBuffer);
            
            // Save transactions
            transactionEntries := Iter.toArray(transactions.entries());
            
            // Save group memberships
            groupMembershipEntries := Iter.toArray(groupMemberships.entries());
        };

        public func postUpgrade() {
            // Clear stable storage to save space
            groupEntries := [];
            rotationEntries := [];
            memberEntries := [];
            transactionEntries := [];
            groupMembershipEntries := [];
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