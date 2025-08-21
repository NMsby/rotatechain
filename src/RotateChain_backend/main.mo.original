import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Time "mo:base/Time";

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
    
    if (name == "") { return #err("Group name cannot be empty") };
    if (maxMembers < 2 or maxMembers > 12) { return #err("Group size must be 2-12 members") };
    if (contributionAmount < 1000) { return #err("Minimum contribution is 1000") };
    
    let groupId = nextGroupId;
    nextGroupId += 1;
    
    let newGroup: Group = {
      id = groupId;
      name = name;
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
    switch (findGroup(groupId)) {
      case (?group) {
        if (group.members.size() >= group.totalRounds) {
          return #err("Group is full");
        };
        
        if (group.isActive) {
          return #err("Cannot join active group");
        };
        
        // Check if already a member
        let isMember = Array.find<Principal>(group.members, func(p) = Principal.equal(p, msg.caller));
        switch (isMember) {
          case (?_) { return #err("Already a member of this group") };
          case null {};
        };
        
        // Add new member
        let updatedMembers = Array.append(group.members, [msg.caller]);
        let isNowActive = updatedMembers.size() == group.totalRounds;
        let updatedGroup = { group with 
          members = updatedMembers;
          isActive = isNowActive;
          currentRound = if (isNowActive) 1 else 0;
          nextRecipient = if (isNowActive) ?updatedMembers[0] else null;
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

  // Record contribution
  public shared(msg) func recordContribution(groupId: Nat) : async Result.Result<Bool, Text> {
    switch (findGroup(groupId)) {
      case (?group) {
        if (not group.isActive) {
          return #err("Group is not active yet");
        };
        
        // Check if caller is a member
        let isMember = Array.find<Principal>(group.members, func(p) = Principal.equal(p, msg.caller));
        switch (isMember) {
          case null { return #err("Not a member of this group") };
          case (?_) {
            // Check if already contributed this round
            if (hasContributed(groupId, msg.caller, group.currentRound)) {
              return #err("Already contributed for round " # Nat.toText(group.currentRound));
            };
            
            recordContributionInternal(groupId, msg.caller, group.currentRound);
            
            Debug.print("Contribution recorded: " # Principal.toText(msg.caller) # " -> Group " # Nat.toText(groupId) # ", Round " # Nat.toText(group.currentRound));
            #ok(true)
          };
        }
      };
      case null { #err("Group not found") };
    }
  };

  // Advance to next round
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
        
        // Advance round
        let newRound = group.currentRound + 1;
        let isCompleted = newRound > group.totalRounds;
        
        let nextRecipient = if (not isCompleted and group.members.size() > 0) {
          let recipientIndex = (newRound - 1) % group.members.size();
          ?group.members[recipientIndex]
        } else null;
        
        let updatedGroup = { group with 
          currentRound = newRound;
          nextRecipient = nextRecipient;
          isActive = not isCompleted;
          completedAt = if (isCompleted) ?Time.now() else null;
        };
        updateGroup(updatedGroup);
        
        if (isCompleted) {
          Debug.print("🎉 Group " # Nat.toText(groupId) # " COMPLETED! All rounds finished.");
        } else {
          Debug.print("Group " # Nat.toText(groupId) # " advanced to round " # Nat.toText(newRound));
        };
        #ok(true)
      };
      case null { #err("Group not found") };
    }
  };

  // Get user's groups
  public query(msg) func getMyGroups() : async [GroupSummary] {
    let userGroups = Array.filter<Group>(groupsArray, func(g) = 
      Array.find<Principal>(g.members, func(p) = Principal.equal(p, msg.caller)) != null
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

  // Get platform stats
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
}
