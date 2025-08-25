// types.mo - Complete type system for RotateChain
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

module Types {
    // ==================== CORE IDENTIFIERS ====================
    public type GroupId = Nat;
    public type MemberId = Principal;
    public type Amount = Nat64;  // ICP amounts in e8s (smallest unit)
    public type Timestamp = Int;
    public type TransactionId = Nat64;
    public type RoundNumber = Nat;

    // ==================== R TOKEN SYSTEM ====================
    public type RTokenId = Nat;

    // R Token status lifecycle
    public type RTokenStatus = {
        #active;       // Can be transferred and redeemed
        #locked;       // Locked as collateral or during rotation
        #redeemed;     // Already converted back to ICP
    };

    // R Token record - represents liquid contribution tokens
    public type RToken = {
        id: RTokenId;
        groupId: GroupId;
        holder: Principal;
        originalAmount: Amount;         // Original ICP contribution amount
        currentAmount: Amount;          // Current value (including yield)
        issuedAt: Timestamp;
        lastYieldUpdate: Timestamp;
        accumulatedYield: Amount;       // Total yield earned
        status: RTokenStatus;
        memo: ?Text;                    // Optional issuance memo
    };

    // R Token transfer record
    public type RTokenTransfer = {
        id: TransactionId;
        tokenId: RTokenId;
        from: Principal;
        to: Principal;
        amount: Amount;
        timestamp: Timestamp;
        memo: ?Text;
    };

    // ==================== ENUMERATIONS ====================
    
    // Group lifecycle status
    public type GroupStatus = {
        #forming;      // Collecting members, not started
        #active;       // Running rotations
        #paused;       // Temporarily suspended by admin
        #completed;    // All rotations finished successfully
        #cancelled;    // Prematurely terminated
    };

    // Member status within a group
    public type MemberStatus = {
        #active;       // Participating normally
        #pending;      // Joined but not yet contributing
        #suspended;    // Temporarily blocked from operations
        #exited;       // Left the group
    };

    // Transaction categories
    public type TransactionType = {
        #contribution; // Regular member contribution
        #payout;       // Rotation payout to recipient
        #withdrawal;   // Early withdrawal (with penalties)
        #fee;          // Platform or transaction fees
        #yield;        // DeFi yield distribution
    };

    // ==================== CORE DATA STRUCTURES ====================
    
    // Group configuration and metadata
    public type GroupConfig = {
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
        createdAt: Timestamp;
        totalPoolSize: Amount;           // Total expected pool size
        platformFeeRate: Nat;            // Fee rate in basis points (e.g., 25 = 0.25%)
        yieldRate: Nat;                  // Expected annual yield rate in basis points
    };

    // Individual member information
    public type Member = {
        principal: Principal;
        joinedAt: Timestamp;
        totalContributions: Amount;
        receivedPayouts: Amount;
        pendingContributions: Amount;    // Contributions not yet processed
        status: MemberStatus;
        lastContributionTime: ?Timestamp;
        missedContributions: Nat;        // Track defaults
        liquidTokenBalance: Amount;      // rTokens for trading
    };

    // Rotation state and progress
    public type RotationState = {
        groupId: GroupId;
        currentRound: RoundNumber;
        totalRounds: Nat;
        nextPayoutDate: Timestamp;
        currentRecipient: ?Principal;
        previousRecipients: [Principal];
        poolBalance: Amount;
        yieldGenerated: Amount;
        rotationOrder: [Principal];
        roundStartTime: Timestamp;
        contributionsThisRound: [(Principal, Amount)];
    };

    // Transaction record for audit trail
    public type Transaction = {
        id: TransactionId;
        groupId: GroupId;
        from: Principal;
        to: ?Principal;
        amount: Amount;
        timestamp: Timestamp;
        transactionType: TransactionType;
        memo: ?Text;
        blockHeight: ?Nat64;           // ICP ledger block reference
    };

    // ==================== API TYPES ====================
    
    // Group creation parameters
    public type CreateGroupParams = {
        name: Text;
        description: Text;
        maxMembers: Nat;
        contributionAmount: Amount;
        rotationIntervalDays: Nat;
        startDate: ?Timestamp;         // Optional, defaults to immediate
    };

    // Contribution parameters
    public type ContributionParams = {
        groupId: GroupId;
        amount: Amount;
        memo: ?Text;
    };

    // ==================== ERROR HANDLING ====================
    
    public type Error = {
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
        #InvalidGroupStatus;
        #InsufficientMembers;
        #ContributionPeriodClosed;
        #AlreadyReceivedPayout;
        #InvalidRotationOrder;
        #MemberSuspended;
        #ExcessiveAmount;
        #NetworkError;
    };

    // ==================== RESPONSE TYPES ====================
    
    public type CreateGroupResponse = Result.Result<GroupId, Error>;
    public type JoinGroupResponse = Result.Result<Bool, Error>;
    public type ContributeResponse = Result.Result<TransactionId, Error>;
    public type PayoutResponse = Result.Result<TransactionId, Error>;
    public type BalanceResponse = Result.Result<Amount, Error>;
    public type GroupInfoResponse = Result.Result<GroupConfig, Error>;
    public type MemberInfoResponse = Result.Result<Member, Error>;
    public type RotationInfoResponse = Result.Result<RotationState, Error>;
    public type TransactionHistoryResponse = Result.Result<[Transaction], Error>;

    // ==================== STATISTICS & ANALYTICS ====================
    
    public type GroupStatistics = {
        totalGroups: Nat;
        activeGroups: Nat;
        totalMembers: Nat;
        totalValueLocked: Amount;
        totalTransactions: Nat;
        averageGroupSize: Float;
        totalYieldGenerated: Amount;
    };

    public type MemberStatistics = {
        groupsJoined: Nat;
        totalContributed: Amount;
        totalReceived: Amount;
        missedPayments: Nat;
        currentBalance: Amount;
        liquidTokens: Amount;
    };

    // ==================== CONSTANTS ====================
    
    public let PLATFORM_FEE_RATE : Nat = 25;        // 0.25% in basis points
    public let MIN_CONTRIBUTION : Amount = 100_000; // 0.001 ICP minimum
    public let MAX_CONTRIBUTION : Amount = 1_000_000_000_000; // 10,000 ICP maximum
    public let MIN_GROUP_SIZE : Nat = 3;
    public let MAX_GROUP_SIZE : Nat = 20;
    public let MIN_ROTATION_DAYS : Nat = 7;          // 1 week minimum
    public let MAX_ROTATION_DAYS : Nat = 90;         // 3 months maximum
    public let DEFAULT_YIELD_RATE : Nat = 500;       // 5% annual yield
}