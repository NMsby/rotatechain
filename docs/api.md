# RotateChain API Documentation

## Overview

RotateChain provides comprehensive REST-like API through Internet Computer canister calls. All endpoints support both query (read-only) and update (state-changing) operations.

## Mainnet API Access

**Production Endpoint**: https://trmuc-riaaa-aaaan-qz6dq-cai.icp0.io    
**Candid Interface**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=trmuc-riaaa-aaaan-qz6dq-cai    
**Network**: Internet Computer Protocol Mainnet

### Testing Mainnet API

```bash
# Test core functionality
dfx canister --network ic call trmuc-riaaa-aaaan-qz6dq-cai healthCheck
dfx canister --network ic call trmuc-riaaa-aaaan-qz6dq-cai getPlatformAnalytics

# Verify system status
dfx canister --network ic status trmuc-riaaa-aaaan-qz6dq-cai
```

## Authentication

All API calls require Internet Identity authentication. The caller's Principal is automatically validated and used for authorization.

## Core Endpoints

### Group Management

#### Create Group
```motoko
createGroup(name: Text, contributionAmount: Nat, maxMembers: Nat, roundDurationDays: Nat) : async Result<Nat, Text>
```
Creates a new rotational savings group.

**Parameters:**
- `name`: Group display name (2-50 characters)
- `contributionAmount`: Required contribution per round (ICP in e8s)
- `maxMembers`: Maximum group size (3-20 members)
- `roundDurationDays`: Days between rotation payouts (7-90 days)

**Returns:** Group ID on success, error message on failure

#### Join Group
```motoko
joinGroup(groupId: Nat) : async Result<Bool, Text>
```
Join an existing group as a member.

**Parameters:**
- `groupId`: Target group identifier

**Returns:** Success boolean, error message on failure

### R Token Operations

#### Transfer R Tokens
```motoko
transferRTokens(tokenId: RTokenId, to: Principal, amount: Amount, memo: ?Text) : async Result<TransactionId, Error>
```
Transfer R Tokens to another group member.

**Parameters:**
- `tokenId`: Source R Token identifier
- `to`: Recipient Principal (must be group member)
- `amount`: Transfer amount in e8s
- `memo`: Optional transfer description

**Returns:** Transaction ID on success

#### Get R Token Balance
```motoko
getRTokenBalance(groupId: Nat) : async Amount
```
Query caller's R Token balance in specific group.

**Parameters:**
- `groupId`: Target group identifier

**Returns:** Balance in e8s

### Lending System

#### Request Loan
```motoko
requestLoan(borrowerGroupId: Nat, principalAmount: Amount, termDays: Nat, collateralTokenIds: [RTokenId], memo: ?Text) : async Result<LoanId, Error>
```
Request a loan using R Token collateral.

**Parameters:**
- `borrowerGroupId`: Borrower's primary group
- `principalAmount`: Requested loan amount in e8s
- `termDays`: Loan term in days (30-365)
- `collateralTokenIds`: Array of R Token IDs for collateral
- `memo`: Optional loan description

**Returns:** Loan ID on successful request

#### Make Loan Payment
```motoko
makeLoanPayment(loanId: LoanId, amount: Amount) : async Result<TransactionId, Error>
```
Make payment toward active loan.

**Parameters:**
- `loanId`: Target loan identifier
- `amount`: Payment amount in e8s

**Returns:** Payment transaction ID

### Analytics Endpoints

#### Get Group Analytics
```motoko
getGroupAnalytics(groupId: Nat) : async ?GroupPerformanceMetrics
```
Retrieve comprehensive group performance metrics.

**Returns:**
```motoko
type GroupPerformanceMetrics = {
    totalMembers: Nat;
    activeMembers: Nat;
    totalContributions: Amount;
    averageYield: Float;
    participationRate: Float;
    groupHealth: Float;
    complianceRate: Float;
}
```

#### Get Personal Analytics
```motoko
getMyAnalytics() : async UserAnalytics
```
Retrieve caller's personal analytics and credit assessment.

**Returns:**
```motoko
type UserAnalytics = {
    groupsJoined: Nat;
    totalContributed: Amount;
    totalReceived: Amount;
    rTokenBalance: Amount;
    creditScore: Float;
    participationScore: Float;
    yieldEarned: Amount;
}
```

#### Get Platform Analytics
```motoko
getPlatformAnalytics() : async PlatformAnalytics
```
Retrieve platform-wide statistics and metrics.

**Returns:**
```motoko
type PlatformAnalytics = {
    totalGroups: Nat;
    activeGroups: Nat;
    totalUsers: Nat;
    totalValueLocked: Amount;
    averageYield: Float;
    defaultRate: Float;
    rTokenVelocity: Float;
}
```

## Error Handling

All endpoints use Result types for consistent error handling:

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
    #LoanNotFound;
    #InsufficientCollateral;
    #InvalidLoanTerm;
    #LoanNotActive;
    #CollateralLocked;
}
```

## Rate Limits

No explicit rate limits are enforced, but the Internet Computer's consensus mechanism provides natural throttling for update calls.

## Testing Endpoints

#### System Health Check
```motoko
healthCheck() : async Bool
```
Basic system operational status.

#### Comprehensive System Test
```motoko
runSystemTests() : async SystemTestResults
```
Execute full system validation suite.

#### Performance Benchmark
```motoko
benchmarkAnalytics() : async BenchmarkResults
```
Measure analytics processing performance.

## Usage Examples

### JavaScript/TypeScript (Agent-JS)

```typescript
import { Actor, HttpAgent } from "@dfinity/agent";

const agent = new HttpAgent({ host: "https://ic0.app" });
const actor = Actor.createActor(idlFactory, {
  agent,
  canisterId: "your-canister-id",
});

// Create group
const result = await actor.createGroup(
  "My Savings Group",
  100000000, // 1 ICP in e8s
  5,         // 5 members
  30         // 30 day rounds
);

// Check R Token balance
const balance = await actor.getRTokenBalance(1);
```

This API provides comprehensive access to all RotateChain functionality through clean, consistent interfaces.