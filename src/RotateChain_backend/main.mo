// Enhanced main.mo - working logic + new modules
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";

// Import new modules for validation and utilities
import Types "./types";
import Utils "./utils";

/// Imports required modules and libraries for the backend canister functionality.
import Ledger "canister:icp_ledger_canister";
import PaymentHandler "./payment_handler";
import ICPPaymentService "./icp_payment_service";

actor RotateChain {
  
    // Complete types for rotational savings
    public type Group = {
        id: Nat;
        name: Text;
        members: [Principal];
        contributionAmount: Nat;
        currentRound: Nat;
        totalRounds: Nat;
        isActive: Bool;
        creator: Principal;
        nextRecipient: ?Principal;
        createdAt: Int;
        completedAt: ?Int;
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
        nextRecipient: ?Principal;
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

    // State management
    private stable var nextGroupId: Nat = 1;
    private stable var groupsArray: [Group] = [];
    private stable var contributionsTracker: [(Nat, Principal, Nat)] = [];

    // Helper functions
    private func findGroup(groupId: Nat) : ?Group {
        Array.find<Group>(groupsArray, func(g) = g.id == groupId)
    };

    private func updateGroup(updatedGroup: Group) : () {
        groupsArray := Array.map<Group, Group>(groupsArray, func(g) = 
        if (g.id == updatedGroup.id) updatedGroup else g
        );
    };

    private func hasContributed(groupId: Nat, principal: Principal, round: Nat) : Bool {
        Array.find<(Nat, Principal, Nat)>(contributionsTracker, func((gId, p, r)) = 
        gId == groupId and Principal.equal(p, principal) and r == round
        ) != null
    };

    private func recordContributionInternal(groupId: Nat, principal: Principal, round: Nat) : () {
        contributionsTracker := Array.append(contributionsTracker, [(groupId, principal, round)]);
    };

    private func calculateProgress(currentRound: Nat, totalRounds: Nat) : Nat {
        if (totalRounds == 0) { 0 } else { (currentRound * 100) / totalRounds }
    };

    // Create new rotation group
    public shared(msg) func createGroup(
        name: Text,
        contributionAmount: Nat,
        maxMembers: Nat,
        _roundDurationDays: Nat
    ) : async Result.Result<Nat, Text> {
    
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
        
        let groupId = nextGroupId;
        nextGroupId += 1;
        
        let newGroup: Group = {
            id = groupId;
            name = Utils.sanitizeText(name);  // Enhanced: sanitize input
            members = [msg.caller];
            contributionAmount = contributionAmount;
            currentRound = 0;
            totalRounds = maxMembers;
            isActive = false;
            creator = msg.caller;
            nextRecipient = null;
            createdAt = Time.now();
            completedAt = null;
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
                if (Utils.principalInArray(msg.caller, group.members)) {
                    return #err("Already a member of this group");
                };
            
                // Add new member
                let updatedMembers = Utils.addPrincipalToArray(msg.caller, group.members);
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
                if (not Utils.principalInArray(msg.caller, group.members)) {
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
                    if (not hasContributed(groupId, member, group.currentRound)) {
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
                        switch (await PaymentHandler.processRotationPayout(
                            groupId,
                            recipient,
                            totalPayout,
                            group.currentRound
                        )) {
                            case (#ok(payoutTxId)) {             
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
                                    completedAt = if (isCompleted) ?Time.now() else null;
                                };
                                updateGroup(updatedGroup);

                                Debug.print("💰 Real ICP payout processed successfully!");
                                Debug.print("Payout Transaction ID: " # Nat64.toText(payoutTxId));
                                Debug.print("Recipient: " # Principal.toText(recipient));
                                Debug.print("Amount: " # Nat64.toText(totalPayout) # " e8s");
                        
                                if (isCompleted) {
                                    Debug.print("🎉 Group " # Nat.toText(groupId) # " COMPLETED! All rounds finished.");
                                } else {
                                    Debug.print("➡️ Group " # Nat.toText(groupId) # " advanced to round " # Nat.toText(newRound));
                                };

                                #ok(true)
                            };
                            case (#err(error)) {
                                let errorText = Utils.errorToText(error);
                                Debug.print("❌ Payout failed: " # errorText);
                                #err("Payout failed: " # errorText)
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
            Utils.principalInArray(msg.caller, g.members)  // Enhanced: use utils
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
                nextRecipient = g.nextRecipient;
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
    public query func getPlatformStats() : async PlatformStats {
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

    // System statistics
    public query func getSystemStats() : async {
        totalGroups: Nat;
        activeGroups: Nat;
        totalTransactions: Nat;
        systemVersion: Text;
    } {
        let stats = getPlatformStats();
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
}