// rotation_engine.mo - Advanced rotation logic
import Types "./types";
import Utils "./utils";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Nat64 "mo:base/Nat64";

module RotationEngine {
    
    // Create initial rotation state for new group
    public func initializeRotation(group: Types.GroupConfig) : Types.RotationState {
        let rotationOrder = Utils.generateRotationOrder(group.members, Utils.DEFAULT_SEED);
        let nextPayoutDate = Utils.calculateNextPayoutDate(
            group.startDate,
            group.rotationIntervalDays,
            1
        );
        
        {
            groupId = group.id;
            currentRound = 1;
            totalRounds = group.members.size();
            nextPayoutDate = nextPayoutDate;
            currentRecipient = if (rotationOrder.size() > 0) ?rotationOrder[0] else null;
            previousRecipients = [];
            poolBalance = 0;
            yieldGenerated = 0;
            rotationOrder = rotationOrder;
            roundStartTime = Time.now();
            contributionsThisRound = [];
        }
    };
    
    // Process rotation advancement
    public func advanceRotation(
        rotation: Types.RotationState,
        allContributed: Bool
    ) : Result.Result<Types.RotationState, Types.Error> {
        
        if (not allContributed) {
            return #err(#RotationInProgress);
        };
        
        let newRound = rotation.currentRound + 1;
        let isCompleted = newRound > rotation.totalRounds;
        
        let nextRecipient = if (not isCompleted) {
            Utils.getNextRecipient(rotation.rotationOrder, newRound - 1)
        } else {
            null
        };
        
        let updatedPreviousRecipients = switch (rotation.currentRecipient) {
            case (?current) { Array.append(rotation.previousRecipients, [current]) };
            case null { rotation.previousRecipients };
        };
        
        let nextPayoutDate = if (not isCompleted) {
            Utils.addDaysToTimestamp(rotation.roundStartTime, rotation.currentRound * 30) // Assuming 30-day intervals
        } else {
            rotation.nextPayoutDate
        };
        
        #ok({
            rotation with
            currentRound = newRound;
            currentRecipient = nextRecipient;
            previousRecipients = updatedPreviousRecipients;
            nextPayoutDate = nextPayoutDate;
            roundStartTime = if (not isCompleted) Time.now() else rotation.roundStartTime;
            contributionsThisRound = [];
        })
    };
    
    // Calculate payout amount with yield
    public func calculatePayoutAmount(
        rotation: Types.RotationState,
        contributionAmount: Nat64,
        memberCount: Nat
    ) : Nat64 {
        let totalContributions = contributionAmount * Nat64.fromNat(memberCount);
        let yieldAmount = Utils.calculateYield(totalContributions, Types.DEFAULT_YIELD_RATE, 30);
        let platformFee = Utils.calculatePlatformFee(yieldAmount);
        
        totalContributions + yieldAmount - platformFee
    };
}