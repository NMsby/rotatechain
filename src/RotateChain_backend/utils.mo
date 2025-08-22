// utils.mo - Utility functions for validation, helpers, and common operations
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Types "./types";

module Utils {

    // ==================== INPUT VALIDATION ====================
    
    // Validate group creation parameters
    public func validateCreateGroupParams(params: Types.CreateGroupParams) : ?Types.Error {
        // Validate name
        if (Text.size(params.name) == 0 or Text.size(params.name) > 100) {
            return ?#InvalidAmount;
        };
        
        // Validate description
        if (Text.size(params.description) > 500) {
            return ?#InvalidAmount;
        };
        
        // Validate member count
        if (params.maxMembers < Types.MIN_GROUP_SIZE or params.maxMembers > Types.MAX_GROUP_SIZE) {
            return ?#InvalidAmount;
        };
        
        // Validate contribution amount
        if (params.contributionAmount < Types.MIN_CONTRIBUTION or 
        params.contributionAmount > Types.MAX_CONTRIBUTION) {
            return ?#InvalidAmount;
        };
        
        // Validate rotation interval
        if (params.rotationIntervalDays < Types.MIN_ROTATION_DAYS or 
        params.rotationIntervalDays > Types.MAX_ROTATION_DAYS) {
            return ?#InvalidTimestamp;
        };
        
        // Validate start date if provided
        switch (params.startDate) {
            case (?startDate) {
                if (startDate < Time.now()) {
                    return ?#InvalidTimestamp;
                };
            };
            case null { };
        };
        
        null // No errors
    };
    
    // Validate contribution parameters
    public func validateContributionParams(params: Types.ContributionParams) : ?Types.Error {
        if (params.amount < Types.MIN_CONTRIBUTION or params.amount > Types.MAX_CONTRIBUTION) {
            return ?#InvalidAmount;
        };
        
        switch (params.memo) {
            case (?memo) {
                if (Text.size(memo) > 100) {
                    return ?#InvalidAmount;
                };
            };
            case null { };
        };
        
        null
    };
    
    // Validate principal (basic check for anonymous principal)
    public func validatePrincipal(principal: Principal) : Bool {
        Principal.toText(principal) != "2vxsx-fae"
    };
    
    // Validate amount is positive and within bounds
    public func validateAmount(amount: Types.Amount) : Bool {
        amount > 0 and amount <= Types.MAX_CONTRIBUTION
    };
    
    // ==================== TIME UTILITIES ====================
    
    // Convert days to nanoseconds
    public func daysToNanos(days: Nat) : Int {
        Int.abs(days * 24 * 60 * 60 * 1_000_000_000)
    };
    
    // Convert nanoseconds to days
    public func nanosToDays(nanos: Int) : Nat {
        Int.abs(nanos) / (24 * 60 * 60 * 1_000_000_000)
    };
    
    // Check if timestamp is in the past
    public func isInPast(timestamp: Types.Timestamp) : Bool {
        timestamp < Time.now()
    };
    
    // Check if timestamp is in the future
    public func isInFuture(timestamp: Types.Timestamp) : Bool {
        timestamp > Time.now()
    };
    
    // Add days to a timestamp
    public func addDaysToTimestamp(timestamp: Types.Timestamp, days: Nat) : Types.Timestamp {
        timestamp + daysToNanos(days)
    };
    
    // Calculate time remaining until timestamp
    public func timeUntil(timestamp: Types.Timestamp) : Int {
        timestamp - Time.now()
    };
    
    // Format timestamp for display (basic formatting)
    public func formatTimestamp(timestamp: Types.Timestamp) : Text {
        // Basic implementation - in production, use proper date formatting
        Int.toText(timestamp)
    };
    
    // ==================== ARRAY UTILITIES ====================
    
    // Check if principal is in array
    public func principalInArray(principal: Principal, array: [Principal]) : Bool {
        switch (Array.find<Principal>(array, func(p) = p == principal)) {
            case (?_) { true };
            case null { false };
        }
    };
    
    // Remove principal from array
    public func removePrincipalFromArray(principal: Principal, array: [Principal]) : [Principal] {
        Array.filter<Principal>(array, func(p) = p != principal)
    };
    
    // Add principal to array if not already present
    public func addPrincipalToArray(principal: Principal, array: [Principal]) : [Principal] {
        if (principalInArray(principal, array)) {
            array
        } else {
            Array.append<Principal>(array, [principal])
        }
    };
    
    // Shuffle array using Fisher-Yates algorithm (simplified)
    public func shuffleArray<T>(array: [T], seed: Nat) : [T] {
        // Simple pseudo-random shuffle
        // In production, use proper randomization
        let arr = Array.thaw<T>(array);
        let size = arr.size();
        
        var i = size;
        while (i > 1) {
            i -= 1;
            let j = seed % (i + 1);
            let temp = arr[i];
            arr[i] := arr[j];
            arr[j] := temp;
        };
        
        Array.freeze<T>(arr)
    };
    
    // ==================== MATHEMATICAL UTILITIES ====================
    
    // Calculate percentage of amount
    public func calculatePercentage(amount: Types.Amount, percentage: Nat) : Types.Amount {
        // percentage in basis points (e.g., 100 = 1%)
        (amount * Nat64.fromNat(percentage)) / 10_000
    };
    
    // Calculate compound interest (simple approximation)
    public func calculateCompoundInterest(
        principal: Types.Amount, 
        rate: Nat, // annual rate in basis points
        periods: Nat // number of compounding periods
    ) : Types.Amount {
        if (periods == 0) { return principal };
        
        let rateFloat = Float.fromInt(rate) / 10_000.0; // Convert basis points to decimal
        let compound = Float.pow(1.0 + rateFloat, Float.fromInt(periods));
        let result = Float.fromInt64(Int64.fromNat64(principal)) * compound;
        
        Nat64.fromNat(Int.abs(Float.toInt(result)))
    };
   
    // Calculate platform fee
    public func calculatePlatformFee(amount: Types.Amount) : Types.Amount {
        calculatePercentage(amount, Types.PLATFORM_FEE_RATE)
    };
   
    // Calculate yield for a period
    public func calculateYield(
        amount: Types.Amount, 
        yieldRate: Nat, // annual yield rate in basis points
        days: Nat
    ) : Types.Amount {
        let dailyRate = yieldRate / 365; // Approximate daily rate
        calculatePercentage(amount, dailyRate * days)
    };
   
    // Safe addition with overflow protection
    public func safeAdd(a: Types.Amount, b: Types.Amount) : ?Types.Amount {
        let maxNat64 = 18_446_744_073_709_551_615 : Nat64;
        if (a > maxNat64 - b) {
            null // Overflow would occur
        } else {
            ?(a + b)
        }
    };
   
    // Safe subtraction with underflow protection
    public func safeSub(a: Types.Amount, b: Types.Amount) : ?Types.Amount {
        if (a >= b) {
            ?(a - b)
        } else {
            null // Underflow would occur
        }
    };
   
    // ==================== TEXT UTILITIES ====================
   
    // Clean and validate text input
    public func sanitizeText(text: Text) : Text {
        // Basic sanitization - remove leading/trailing whitespace
        // In production, implement proper text sanitization
        Text.trim(text, #char ' ')
    };
   
    // Check if text is empty or only whitespace
    public func isEmptyText(text: Text) : Bool {
        Text.size(Text.trim(text, #char ' ')) == 0
    };
   
    // Truncate text to maximum length
    public func truncateText(text: Text, maxLength: Nat) : Text {
        if (Text.size(text) <= maxLength) {
            text
        } else {
            // Basic truncation - in production, use proper text handling
            text // Simplified for this implementation
        }
    };
   
    // ==================== STATUS VALIDATION ====================
   
    // Check if group status allows member operations
    public func canModifyMembers(status: Types.GroupStatus) : Bool {
        switch (status) {
            case (#forming or #active) { true };
            case (#paused or #completed or #cancelled) { false };
        }
    };
   
    // Check if group status allows contributions
    public func canAcceptContributions(status: Types.GroupStatus) : Bool {
        switch (status) {
            case (#active) { true };
            case (#forming or #paused or #completed or #cancelled) { false };
        }
    };
   
    // Check if group status allows rotations
    public func canProcessRotations(status: Types.GroupStatus) : Bool {
        switch (status) {
            case (#active) { true };
            case (#forming or #paused or #completed or #cancelled) { false };
        }
    };
   
    // Check if member status allows operations
    public func isMemberActive(status: Types.MemberStatus) : Bool {
        switch (status) {
            case (#active) { true };
            case (#pending or #suspended or #exited) { false };
        }
    };
   
    // ==================== ROTATION UTILITIES ====================
   
    // Calculate next payout date
    public func calculateNextPayoutDate(
        startDate: Types.Timestamp, 
        intervalDays: Nat, 
        currentRound: Nat
    ) : Types.Timestamp {
        startDate + daysToNanos(intervalDays * currentRound)
    };
   
    // Check if it's time for next rotation
    public func isRotationDue(nextPayoutDate: Types.Timestamp) : Bool {
        Time.now() >= nextPayoutDate
    };
   
    // Calculate total rotation duration
    public func calculateTotalDuration(intervalDays: Nat, totalRounds: Nat) : Nat {
        intervalDays * totalRounds
    };
   
    // Generate rotation order from members
    public func generateRotationOrder(members: [Principal], seed: Nat) : [Principal] {
        shuffleArray<Principal>(members, seed)
    };
   
    // Get next recipient in rotation
    public func getNextRecipient(
        rotationOrder: [Principal], 
        currentRound: Nat
    ) : ?Principal {
        if (currentRound >= rotationOrder.size()) {
            null
        } else {
            ?rotationOrder[currentRound]
        }
    };
   
    // Check if all members have received payouts
    public func isRotationComplete(currentRound: Nat, totalRounds: Nat) : Bool {
        currentRound >= totalRounds
    };
   
    // ==================== ERROR HANDLING UTILITIES ====================
   
    // Convert error to human-readable text
    public func errorToText(error: Types.Error) : Text {
        switch (error) {
            case (#GroupNotFound) { "Group not found" };
            case (#InsufficientBalance) { "Insufficient balance for this operation" };
            case (#UnauthorizedAccess) { "You are not authorized for this operation" };
            case (#InvalidAmount) { "Invalid amount specified" };
            case (#GroupFull) { "Group has reached maximum number of members" };
            case (#AlreadyMember) { "You are already a member of this group" };
            case (#NotMember) { "You are not a member of this group" };
            case (#RotationInProgress) { "Rotation is currently in progress" };
            case (#PaymentFailed) { "Payment transaction failed" };
            case (#InvalidTimestamp) { "Invalid timestamp provided" };
            case (#ContractPaused) { "System is currently paused for maintenance" };
            case (#InvalidGroupStatus) { "Invalid group status for this operation" };
            case (#InsufficientMembers) { "Group needs more members to start" };
            case (#ContributionPeriodClosed) { "Contribution period is closed" };
            case (#AlreadyReceivedPayout) { "Member has already received payout this round" };
            case (#InvalidRotationOrder) { "Invalid rotation order configuration" };
            case (#MemberSuspended) { "Member account is suspended" };
            case (#ExcessiveAmount) { "Amount exceeds maximum allowed limit" };
            case (#NetworkError) { "Network communication error" };
        }
    };
   
    // Check if error is recoverable
    public func isRecoverableError(error: Types.Error) : Bool {
        switch (error) {
            case (#NetworkError or #PaymentFailed or #ContractPaused) { true };
            case _ { false };
        }
    };
   
    // ==================== LOGGING UTILITIES ====================
   
    // Create transaction memo
    public func createTransactionMemo(
        transactionType: Types.TransactionType,
        groupId: Types.GroupId,
        additional: ?Text
    ) : Text {
        let typeText = switch (transactionType) {
            case (#contribution) { "CONTRIB" };
            case (#payout) { "PAYOUT" };
            case (#withdrawal) { "WITHDRAW" };
            case (#fee) { "FEE" };
            case (#yield) { "YIELD" };
        };
       
        let baseText = "RC-" # typeText # "-" # Nat.toText(groupId);
       
        switch (additional) {
            case (?extra) { baseText # "-" # extra };
            case null { baseText };
        }
    };
   
    // ==================== ANALYTICS UTILITIES ====================
   
    // Calculate group health score (0-100)
    public func calculateGroupHealthScore(
        group: Types.GroupConfig,
        rotation: ?Types.RotationState,
        members: [(Principal, Types.Member)]
    ) : Nat {
        var score = 0;
       
        // Member participation score (40 points max)
        let activeMembers = Array.filter<(Principal, Types.Member)>(
            members, 
            func((_, member)) = member.status == #active
        );
        let participationRate = (activeMembers.size() * 100) / members.size();
        score += (participationRate * 40) / 100;
       
        // Group status score (30 points max)
        switch (group.status) {
            case (#active) { score += 30 };
            case (#forming) { score += 20 };
            case (#paused) { score += 10 };
            case (#completed) { score += 25 };
            case (#cancelled) { score += 0 };
        };
       
        // Financial health score (30 points max)
        switch (rotation) {
            case (?rot) {
                if (rot.poolBalance >= group.contributionAmount * Nat64.fromNat(group.members.size())) {
                    score += 30;
                } else {
                    let ratio = rot.poolBalance / (group.contributionAmount * Nat64.fromNat(group.members.size()));
                    score += Nat64.toNat(ratio * 30);
                };
            };
            case null { score += 0 };
        };
       
        Nat.min(score, 100)
    };
   
    // Calculate expected completion date
    public func calculateExpectedCompletion(
        startDate: Types.Timestamp,
        intervalDays: Nat,
        totalRounds: Nat
    ) : Types.Timestamp {
        startDate + daysToNanos(intervalDays * totalRounds)
    };
   
    // ==================== CONSTANTS ====================
   
    public let SECONDS_PER_DAY : Int = 86400;
    public let NANOS_PER_SECOND : Int = 1_000_000_000;
    public let NANOS_PER_DAY : Int = 86400000000000;
    public let BASIS_POINTS_SCALE : Nat = 10_000;
    public let PERCENTAGE_SCALE : Nat = 100;
   
    // Default values
    public let DEFAULT_SEED : Nat = 42;
    public let MAX_MEMO_LENGTH : Nat = 100;
    public let MAX_NAME_LENGTH : Nat = 100;
    public let MAX_DESCRIPTION_LENGTH : Nat = 500;
}