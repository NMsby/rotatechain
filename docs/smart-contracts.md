# RotateChain Smart Contract Documentation

## Overview

RotateChain smart contracts are implemented in Motoko and deployed on the Internet Computer. The system uses a modular architecture with multiple canisters handling different aspects of the platform.

## Contract Architecture

### Main Backend Canister (RotateChain_backend)

**Canister ID:** `[To be deployed]`
**Source:** `src/RotateChain_backend/main.mo`

#### Core Data Types

```motoko
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

// Group management types
type GroupId = Nat;
type MemberId = Principal;
type Amount = Nat64;
type Timestamp = Int;

// Group configuration
type GroupConfig = {
    id: GroupId;
    name: Text;
    description: Text;
    admin: Principal;
    members: [Principal];
    maxMembers: Nat;
    minMembers: Nat;
    contributionAmount: Amount;
    rotationIntervalDays: Nat;
    startDate: Timestamp;
    endDate: ?Timestamp;
    status: GroupStatus;
};

// Group status enumeration
type GroupStatus = {
    #forming;      // Collecting members
    #active;       // Running rotations
    #paused;       // Temporarily suspended
    #completed;    // All rotations finished
    #cancelled;    // Prematurely terminated
};

// Rotation state
type RotationState = {
    groupId: GroupId;
    currentRound: Nat;
    totalRounds: Nat;
    nextPayoutDate: Timestamp;
    currentRecipient: ?Principal;
    previousRecipients: [Principal];
    poolBalance: Amount;
    yieldGenerated: Amount;
    rotationOrder: [Principal];
};

// Member information
type Member = {
    principal: Principal;
    joinedAt: Timestamp;
    totalContributions: Amount;
    receivedPayouts: Amount;
    liquidTokens: Amount;
    status: MemberStatus;
};

type MemberStatus = {
    #active;
    #pending;
    #suspended;
    #exited;
};
```

#### Public Functions

##### Group Management

```motoko
// Create a new rotational savings group
public shared(msg) func createGroup(
    name: Text,
    description: Text,
    maxMembers: Nat,
    contributionAmount: Amount,
    rotationIntervalDays: Nat
) : async Result<GroupId, Error> {
    // Implementation details
}

// Join an existing group
public shared(msg) func joinGroup(groupId: GroupId) : async Result<Bool, Error> {
    // Implementation details
}

// Leave a group (with penalties if applicable)
public shared(msg) func leaveGroup(groupId: GroupId) : async Result<Amount, Error> {
    // Implementation details
}

// Get group information
public query func getGroup(groupId: GroupId) : async ?GroupConfig {
    // Implementation details
}

// Get all groups for a user
public query func getUserGroups(user: Principal) : async [GroupConfig] {
    // Implementation details
}
```

##### Rotation Management

```motoko
// Process a rotation payout
public shared(msg) func processRotation(groupId: GroupId) : async Result<TransactionId, Error> {
    // Implementation details
}

// Get current rotation state
public query func getRotationState(groupId: GroupId) : async ?RotationState {
    // Implementation details
}

// Calculate next rotation date
public query func getNextRotationDate(groupId: GroupId) : async ?Timestamp {
    // Implementation details
}

// Emergency pause rotation (admin only)
public shared(msg) func pauseRotation(groupId: GroupId) : async Result<Bool, Error> {
    // Implementation details
}
```

##### Member Functions

```motoko
// Make a contribution to group pool
public shared(msg) func contribute(groupId: GroupId, amount: Amount) : async Result<TransactionId, Error> {
    // Implementation details
}

// Get member information
public query func getMember(groupId: GroupId, member: Principal) : async ?Member {
    // Implementation details
}

// Update member status (admin function)
public shared(msg) func updateMemberStatus(
    groupId: GroupId, 
    member: Principal, 
    status: MemberStatus
) : async Result<Bool, Error> {
    // Implementation details
}
```

##### Liquid Token Functions

```motoko
// Issue liquid tokens during rotation
public shared(msg) func issueLiquidTokens(
    groupId: GroupId, 
    recipient: Principal, 
    amount: Amount
) : async Result<Bool, Error> {
    // Implementation details
}

// Redeem liquid tokens
public shared(msg) func redeemLiquidTokens(
    groupId: GroupId, 
    amount: Amount
) : async Result<Amount, Error> {
    // Implementation details
}

// Transfer liquid tokens between members
public shared(msg) func transferLiquidTokens(
    groupId: GroupId,
    to: Principal,
    amount: Amount
) : async Result<Bool, Error> {
    // Implementation details
}
```

### ICP Integration Canister (icp_backend)

**Canister ID:** `[To be deployed]`
**Source:** `src/RotateChain_backend/icp_integration.mo`

#### Payment Processing

```motoko
import Ledger "canister:icp_ledger_canister";

// Process ICP payment
public shared(msg) func processPayment(
    to: Text,
    amount: Amount,
    memo: ?Text
) : async Result<TransactionId, Error> {
    // Implementation details
}

// Get account balance
public shared(msg) func getBalance(account: Text) : async Amount {
    // Implementation details
}

// Get transaction history
public query func getTransactionHistory(
    account: Text,
    limit: ?Nat
) : async [Transaction] {
    // Implementation details
}
```

#### Yield Management

```motoku
// Calculate yield for a group
public func calculateYield(
    groupId: GroupId,
    poolBalance: Amount,
    duration: Nat
) : async Amount {
    // Implementation details
}

// Distribute yield to group members
public shared(msg) func distributeYield(
    groupId: GroupId,
    totalYield: Amount
) : async Result<[TransactionId], Error> {
    // Implementation details
}
```

## Error Handling

### Custom Error Types

```motoko
type Error = {
    #GroupNotFound;
    #InsufficientBalance;
    #UnauthorizedAccess;
    #InvalidAmount;
    #GroupFull;
    #AlreadyMember;
    #NotMember;
    #RotationInProgress;
    #PaymentFailed;
    #InvalidTimestamp;
    #ContractPaused;
};
```

### Error Messages

```motoko
public func errorToText(error: Error) : Text {
    switch (error) {
        case (#GroupNotFound) "Group not found";
        case (#InsufficientBalance) "Insufficient balance";
        case (#UnauthorizedAccess) "Unauthorized access";
        case (#InvalidAmount) "Invalid amount specified";
        case (#GroupFull) "Group has reached maximum members";
        case (#AlreadyMember) "Already a member of this group";
        case (#NotMember) "Not a member of this group";
        case (#RotationInProgress) "Rotation currently in progress";
        case (#PaymentFailed) "Payment transaction failed";
        case (#InvalidTimestamp) "Invalid timestamp provided";
        case (#ContractPaused) "Contract is currently paused";
    }
}
```

## State Management

### Stable Variables

```motoko
// Persistent state across upgrades
private stable var groupCounter: GroupId = 0;
private stable var groupEntries: [(GroupId, GroupConfig)] = [];
private stable var rotationEntries: [(GroupId, RotationState)] = [];
private stable var memberEntries: [(GroupId, [(Principal, Member)])] = [];

// Runtime state
private var groups = HashMap.fromIter<GroupId, GroupConfig>(
    groupEntries.vals(), 
    Nat.equal, 
    Nat.hash
);
private var rotations = HashMap.fromIter<GroupId, RotationState>(
    rotationEntries.vals(), 
    Nat.equal, 
    Nat.hash
);
```

### Upgrade Hooks

```motoko
system func preupgrade() {
    groupEntries := Iter.toArray(groups.entries());
    rotationEntries := Iter.toArray(rotations.entries());
}

system func postupgrade() {
    groupEntries := [];
    rotationEntries := [];
}
```

## Access Control

### Authorization Functions

```motoko
// Check if caller is group admin
private func isGroupAdmin(groupId: GroupId, caller: Principal) : Bool {
    switch (groups.get(groupId)) {
        case (?group) { group.admin == caller };
        case null { false };
    }
}

// Check if caller is group member
private func isGroupMember(groupId: GroupId, caller: Principal) : Bool {
    switch (groups.get(groupId)) {
        case (?group) { 
            Array.find<Principal>(group.members, func(p) = p == caller) != null 
        };
        case null { false };
    }
}

// Require admin access
private func requireAdmin(groupId: GroupId, caller: Principal) : Result<(), Error> {
    if (isGroupAdmin(groupId, caller)) {
        #ok(())
    } else {
        #err(#UnauthorizedAccess)
    }
}
```

## Events and Logging

### Event Types

```motoko
type Event = {
    #GroupCreated: { groupId: GroupId; admin: Principal };
    #MemberJoined: { groupId: GroupId; member: Principal };
    #MemberLeft: { groupId: GroupId; member: Principal };
    #ContributionMade: { groupId: GroupId; member: Principal; amount: Amount };
    #RotationExecuted: { groupId: GroupId; recipient: Principal; amount: Amount };
    #YieldDistributed: { groupId: GroupId; totalYield: Amount };
    #LiquidTokensIssued: { groupId: GroupId; recipient: Principal; amount: Amount };
};

// Event logging
private func logEvent(event: Event) : () {
    // Implementation for event storage and notification
}
```

## Testing Framework

### Unit Tests

```motoko
// Test group creation
func testCreateGroup() : async Bool {
    // Implementation
}

// Test member joining
func testJoinGroup() : async Bool {
    // Implementation
}

// Test rotation execution
func testRotationExecution() : async Bool {
    // Implementation
}
```

## Deployment Instructions

### Local Deployment

```bash
# Start local IC replica
dfx start --background

# Deploy all canisters
dfx deploy

# Get canister IDs
dfx canister id RotateChain_backend
dfx canister id icp_backend
```

### Mainnet Deployment

```bash
# Deploy to IC mainnet
dfx deploy --network ic --with-cycles 1000000000000

# Verify deployment
dfx canister --network ic status RotateChain_backend
```

## Security Considerations

1. **Input Validation:** All public functions validate inputs before processing
2. **Access Control:** Principal-based authorization for all sensitive operations
3. **Overflow Protection:** Safe arithmetic operations to prevent overflow attacks
4. **Reentrancy Protection:** Guards against reentrancy attacks
5. **Emergency Controls:** Admin functions to pause operations if needed

---

*Last Updated: July 26, 2025*
*Version: 1.0*