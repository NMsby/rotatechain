# RotateChain API Reference

## Overview

This document provides comprehensive API documentation for RotateChain's smart contract interfaces and frontend services.

## Base URL

**Local Development:** `http://localhost:4943`
**IC Mainnet:** `https://ic0.app`

## Authentication

All API calls require Internet Identity authentication or Plug Wallet connection.

### Authentication Headers

```typescript
{
  "Authorization": "Bearer <identity_token>",
  "Content-Type": "application/json"
}
```

## Groups API

### Create Group

Creates a new rotational savings group.

**Endpoint:** `POST /api/groups`

**Request Body:**
```typescript
{
  name: string;              // Group name (3-50 characters)
  description: string;       // Group description (optional)
  maxMembers: number;        // Maximum members (3-12)
  contributionAmount: string; // Amount in ICP (e8s format)
  rotationIntervalDays: number; // Days between rotations (7-90)
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    groupId: number;
    transactionId?: string;
  };
  error?: string;
}
```

**Example:**
```javascript
const response = await fetch('/api/groups', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    name: "Family Savings Circle",
    description: "Monthly family savings group",
    maxMembers: 6,
    contributionAmount: "100000000", // 1 ICP in e8s
    rotationIntervalDays: 30
  })
});
```

### Get Group Details

Retrieves detailed information about a specific group.

**Endpoint:** `GET /api/groups/{groupId}`

**Response:**
```typescript
{
  id: number;
  name: string;
  description: string;
  admin: string;            // Principal ID
  members: string[];        // Array of Principal IDs
  maxMembers: number;
  contributionAmount: string;
  rotationIntervalDays: number;
  status: 'forming' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: string;        // ISO timestamp
  currentRound: number;
  totalRounds: number;
  poolBalance: string;      // Current pool balance in e8s
  yieldGenerated: string;   // Total yield generated in e8s
}
```

### Join Group

Join an existing group as a member.

**Endpoint:** `POST /api/groups/{groupId}/join`

**Response:**
```typescript
{
  success: boolean;
  data: {
    membershipStatus: 'pending' | 'active';
    transactionId?: string;
  };
  error?: string;
}
```

### Leave Group

Leave a group (with potential penalties).

**Endpoint:** `POST /api/groups/{groupId}/leave`

**Response:**
```typescript
{
  success: boolean;
  data: {
    refundAmount: string;    // Amount refunded in e8s
    penaltyAmount: string;   // Penalty charged in e8s
    transactionId: string;
  };
  error?: string;
}
```

### Get User Groups

Get all groups for the authenticated user.

**Endpoint:** `GET /api/groups/user`

**Response:**
```typescript
{
  groups: Array<{
    id: number;
    name: string;
    role: 'admin' | 'member';
    status: string;
    nextRotationDate: string;
    memberPosition: number;
  }>;
  total: number;
}
```

## Rotations API

### Get Rotation State

Get current rotation information for a group.

**Endpoint:** `GET /api/groups/{groupId}/rotation`

**Response:**
```typescript
{
  groupId: number;
  currentRound: number;
  totalRounds: number;
  nextPayoutDate: string;   // ISO timestamp
  currentRecipient: string | null; // Principal ID
  previousRecipients: string[];
  poolBalance: string;
  yieldGenerated: string;
  rotationOrder: string[];
}
```

### Process Rotation

Execute the next rotation payout (admin only).

**Endpoint:** `POST /api/groups/{groupId}/rotation/process`

**Response:**
```typescript
{
  success: boolean;
  data: {
    recipient: string;       // Principal ID
    payoutAmount: string;    // Amount paid in e8s
    yieldAmount: string;     // Yield included in e8s
    transactionId: string;
    nextRotationDate: string;
  };
  error?: string;
}
```

## Contributions API

### Make Contribution

Make a contribution to a group pool.

**Endpoint:** `POST /api/groups/{groupId}/contribute`

**Request Body:**
```typescript
{
  amount: string;          // Amount in e8s
  memo?: string;           // Optional memo
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    transactionId: string;
    newBalance: string;    // New pool balance
    liquidTokensIssued: string; // Liquid tokens received
  };
  error?: string;
}
```

### Get Contribution History

Get contribution history for a user in a group.

**Endpoint:** `GET /api/groups/{groupId}/contributions`

**Query Parameters:**
- `limit`: Number of records (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```typescript
{
  contributions: Array<{
    amount: string;
    timestamp: string;
    transactionId: string;
    memo?: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

## Liquid Tokens API

### Get Liquid Token Balance

Get liquid token balance for a user in a group.

**Endpoint:** `GET /api/groups/{groupId}/liquid-tokens/balance`

**Response:**
```typescript
{
  balance: string;         // Liquid token balance
  redeemableValue: string; // Current redemption value in ICP
  yieldEarned: string;     // Yield earned on liquid tokens
}
```

### Transfer Liquid Tokens

Transfer liquid tokens to another group member.

**Endpoint:** `POST /api/groups/{groupId}/liquid-tokens/transfer`

**Request Body:**
```typescript
{
  to: string;              // Recipient Principal ID
  amount: string;          // Amount to transfer
  memo?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    transactionId: string;
    newBalance: string;
  };
  error?: string;
}
```

### Redeem Liquid Tokens

Redeem liquid tokens for ICP.

**Endpoint:** `POST /api/groups/{groupId}/liquid-tokens/redeem`

**Request Body:**
```typescript
{
  amount: string;          // Amount to redeem
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    icpAmount: string;     // ICP amount received
    transactionId: string;
    remainingBalance: string;
  };
  error?: string;
}
```

## Analytics API

### Get Group Analytics

Get comprehensive analytics for a group.

**Endpoint:** `GET /api/groups/{groupId}/analytics`

**Query Parameters:**
- `period`: '7d' | '30d' | '90d' | 'all' (default: '30d')

**Response:**
```typescript
{
  overview: {
    totalContributions: string;
    totalPayouts: string;
    totalYield: string;
    averageYieldRate: number;
    completedRotations: number;
  };
  memberStats: Array<{
    principal: string;
    totalContributed: string;
    totalReceived: string;
    liquidTokenBalance: string;
    yieldEarned: string;
  }>;
  performanceData: Array<{
    date: string;
    poolBalance: string;
    yieldGenerated: string;
    contributionsReceived: string;
  }>;
  yieldHistory: Array<{
    date: string;
    yieldRate: number;
    totalYield: string;
  }>;
}
```

### Get Platform Analytics

Get platform-wide analytics (public endpoint).

**Endpoint:** `GET /api/analytics/platform`

**Response:**
```typescript
{
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  totalValueLocked: string;    // Total ICP locked in all groups
  totalYieldGenerated: string;
  averageGroupSize: number;
  platformGrowth: Array<{
    date: string;
    newGroups: number;
    newMembers: number;
    volumeTraded: string;
  }>;
}
```

## Wallet API

### Get Wallet Balance

Get ICP balance for connected wallet.

**Endpoint:** `GET /api/wallet/balance`

**Response:**
```typescript
{
  balance: string;         // Balance in e8s
  balanceICP: number;      // Balance in ICP units
}
```

### Get Transaction History

Get transaction history for connected wallet.

**Endpoint:** `GET /api/wallet/transactions`

**Query Parameters:**
- `limit`: Number of records (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `type`: 'all' | 'contributions' | 'payouts' | 'yields' (default: 'all')

**Response:**
```typescript
{
  transactions: Array<{
    id: string;
    type: 'contribution' | 'payout' | 'yield' | 'transfer';
    amount: string;
    timestamp: string;
    groupId?: number;
    groupName?: string;
    status: 'pending' | 'completed' | 'failed';
    memo?: string;
 }>;
 total: number;
 hasMore: boolean;
}

## WebSocket Events API

### Real-time Event Subscription

Connect to real-time events for live updates.

**WebSocket Endpoint:** `wss://api.rotatechain.ic0.app/ws`

**Authentication:**
```javascript
const ws = new WebSocket('wss://api.rotatechain.ic0.app/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: identityToken
  }));
};
```

**Event Types:**
```typescript
// Group events
{
  type: 'group_created';
  data: {
    groupId: number;
    name: string;
    admin: string;
  };
}

{
  type: 'member_joined';
  data: {
    groupId: number;
    member: string;
    totalMembers: number;
  };
}

{
  type: 'contribution_received';
  data: {
    groupId: number;
    member: string;
    amount: string;
    newPoolBalance: string;
  };
}

{
  type: 'rotation_executed';
  data: {
    groupId: number;
    recipient: string;
    amount: string;
    yieldAmount: string;
    nextRotationDate: string;
  };
}

{
  type: 'yield_distributed';
  data: {
    groupId: number;
    totalYield: string;
    perMemberYield: string;
  };
}
```

## Error Responses

### Standard Error Format

```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `GROUP_NOT_FOUND` | Specified group does not exist |
| `INSUFFICIENT_BALANCE` | Insufficient wallet balance |
| `UNAUTHORIZED` | Not authorized for this action |
| `INVALID_AMOUNT` | Invalid amount specified |
| `GROUP_FULL` | Group has reached maximum members |
| `ALREADY_MEMBER` | Already a member of this group |
| `NOT_MEMBER` | Not a member of this group |
| `ROTATION_IN_PROGRESS` | Cannot perform action during rotation |
| `PAYMENT_FAILED` | Payment transaction failed |
| `INVALID_TIMESTAMP` | Invalid timestamp provided |
| `CONTRACT_PAUSED` | Smart contract is paused |
| `VALIDATION_ERROR` | Input validation failed |
| `RATE_LIMITED` | Too many requests |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Standard endpoints:** 100 requests per minute
- **Authentication endpoints:** 20 requests per minute
- **Transaction endpoints:** 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1627846261
```

## SDK Integration

### JavaScript/TypeScript SDK

```bash
npm install @rotatechain/sdk
```

**Usage:**
```typescript
import { RotateChainSDK } from '@rotatechain/sdk';

const sdk = new RotateChainSDK({
  network: 'ic', // or 'local'
  identity: myIdentity
});

// Create a group
const group = await sdk.groups.create({
  name: "My Savings Group",
  maxMembers: 6,
  contributionAmount: "100000000", // 1 ICP
  rotationIntervalDays: 30
});

// Join a group
await sdk.groups.join(groupId);

// Make contribution
await sdk.contributions.make(groupId, "100000000");

// Get analytics
const analytics = await sdk.analytics.getGroup(groupId);
```

### React Hooks

```typescript
import { useRotateChain, useGroup, useWallet } from '@rotatechain/react';

function MyComponent() {
  const { isConnected, connect } = useRotateChain();
  const { group, loading } = useGroup(groupId);
  const { balance } = useWallet();

  return (
    <div>
      {isConnected ? (
        <div>Balance: {balance} ICP</div>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## Testing

### Test Endpoints

Use these endpoints for testing with mock data:

**Base URL:** `http://localhost:4943/test`

All test endpoints return simulated data and don't affect real state.

### Postman Collection

Import our Postman collection for easy API testing:

```bash
curl -o rotatechain-api.postman_collection.json \
  https://raw.githubusercontent.com/Rogetz/rotatechain_improvized/main/docs/postman/collection.json
```

## API Versioning

Current API version: `v1`

All endpoints are prefixed with `/api/v1/`

Future versions will maintain backward compatibility where possible.

---

*Last Updated: July 26, 2025*
*API Version: 1.0*