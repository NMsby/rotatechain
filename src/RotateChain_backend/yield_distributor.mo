// yield_distributor.mo - Advanced yield distribution and allocation system
import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Float "mo:base/Float";

import Types "./types";
import Utils "./utils";

module YieldDistributor {

    // ==================== DISTRIBUTION STRATEGY TYPES ====================
    
    public type DistributionStrategy = {
        #proportional;          // Distribute based on contribution amounts
        #equal;                 // Equal distribution to all members
        #weighted: {            // Custom weighting factors
            factors: [(Principal, Float)];
        };
        #tiered: {              // Different rates for different tiers
            memberTiers: [(Principal, Nat)]; // Member -> tier mapping
            tierMultipliers: [Float];        // Tier multipliers
        };
    };

    public type YieldDistribution = {
        groupId: Types.GroupId;
        totalYield: Types.Amount;
        strategy: DistributionStrategy;
        distributions: [(Principal, Types.Amount)];
        timestamp: Types.Timestamp;
        distributionId: Types.TransactionId;
    };

    public type DistributionResult = {
        successful: [(Principal, Types.Amount)];
        failed: [(Principal, Types.Amount, Types.Error)];
        totalDistributed: Types.Amount;
        totalFailed: Types.Amount;
    };

    // ==================== YIELD DISTRIBUTOR CLASS ====================
    
    public class YieldDistributor() {
        
        // Distribution counter for unique IDs
        private var distributionCounter: Types.TransactionId = 0;
        
        // ==================== CORE DISTRIBUTION FUNCTIONS ====================
        
        // Calculate yield distribution for group members
        public func calculateDistribution(
            groupId: Types.GroupId,
            totalYield: Types.Amount,
            members: [Types.Member],
            strategy: DistributionStrategy
        ) : Result.Result<YieldDistribution, Types.Error> {
            
            if (totalYield == 0) {
                return #err(#InvalidAmount);
            };
            
            if (members.size() == 0) {
                return #err(#NotMember);
            };
            
            let distributions = switch (strategy) {
                case (#proportional) {
                    calculateProportionalDistribution(totalYield, members)
                };
                case (#equal) {
                    calculateEqualDistribution(totalYield, members)
                };
                case (#weighted(config)) {
                    calculateWeightedDistribution(totalYield, members, config.factors)
                };
                case (#tiered(config)) {
                    calculateTieredDistribution(totalYield, members, config.memberTiers, config.tierMultipliers)
                };
            };
            
            switch (distributions) {
                case (#ok(memberDistributions)) {
                    let distributionId = distributionCounter;
                    distributionCounter += 1;
                    
                    #ok({
                        groupId = groupId;
                        totalYield = totalYield;
                        strategy = strategy;
                        distributions = memberDistributions;
                        timestamp = Time.now();
                        distributionId = distributionId;
                    })
                };
                case (#err(error)) { #err(error) };
            }
        };
        
        // Proportional distribution based on contribution amounts
        private func calculateProportionalDistribution(
            totalYield: Types.Amount,
            members: [Types.Member]
        ) : Result.Result<[(Principal, Types.Amount)], Types.Error> {
            
            // Calculate total contributions
            var totalContributions: Types.Amount = 0;
            for (member in members.vals()) {
                switch (Utils.safeAdd(totalContributions, member.totalContributions)) {
                    case (?sum) { totalContributions := sum };
                    case null { return #err(#ExcessiveAmount) };
                };
            };
            
            if (totalContributions == 0) {
                return #err(#InvalidAmount);
            };
            
            // Calculate proportional distributions
            let distributions = Buffer.Buffer<(Principal, Types.Amount)>(members.size());
            var distributedAmount: Types.Amount = 0;
            
            for (member in members.vals()) {
                if (member.totalContributions > 0) {
                    let proportion = Nat64.toNat(member.totalContributions) * Nat64.toNat(totalYield) / Nat64.toNat(totalContributions);
                    let memberYield = Nat64.fromNat(proportion);
                    
                    distributions.add((member.principal, memberYield));
                    distributedAmount += memberYield;
                };
            };
            
            Debug.print("Proportional distribution calculated - Total: " # Nat64.toText(totalYield) # 
                       " e8s, Distributed: " # Nat64.toText(distributedAmount) # " e8s");
            
            #ok(Buffer.toArray(distributions))
        };
        
        // Equal distribution among all members
        private func calculateEqualDistribution(
            totalYield: Types.Amount,
            members: [Types.Member]
        ) : Result.Result<[(Principal, Types.Amount)], Types.Error> {
            
            let memberCount = members.size();
            if (memberCount == 0) {
                return #err(#NotMember);
            };
            
            let yieldPerMember = totalYield / Nat64.fromNat(memberCount);
            let remainder = totalYield % Nat64.fromNat(memberCount);
            
            let distributions = Buffer.Buffer<(Principal, Types.Amount)>(memberCount);
            var extraDistributed = 0;
            
            for (member in members.vals()) {
                var memberYield = yieldPerMember;
                
                // Distribute remainder to first few members
                if (extraDistributed < Nat64.toNat(remainder)) {
                    memberYield += 1;
                    extraDistributed += 1;
                };
                
                distributions.add((member.principal, memberYield));
            };
            
            Debug.print("Equal distribution calculated - " # Nat64.toText(yieldPerMember) # 
                       " e8s per member, Remainder: " # Nat64.toText(remainder) # " e8s");
            
            #ok(Buffer.toArray(distributions))
        };
        
        // Weighted distribution using custom factors
        private func calculateWeightedDistribution(
            totalYield: Types.Amount,
            members: [Types.Member],
            weightFactors: [(Principal, Float)]
        ) : Result.Result<[(Principal, Types.Amount)], Types.Error> {
            
            // Calculate total weight
            var totalWeight: Float = 0.0;
            for ((_, weight) in weightFactors.vals()) {
                totalWeight += weight;
            };
            
            if (totalWeight <= 0.0) {
                return #err(#InvalidAmount);
            };
            
            let distributions = Buffer.Buffer<(Principal, Types.Amount)>(members.size());
            
            for (member in members.vals()) {
                // Find weight for this member (default to 1.0)
                var memberWeight: Float = 1.0;
                for ((principal, weight) in weightFactors.vals()) {
                    if (Principal.equal(principal, member.principal)) {
                        memberWeight := weight;
                    };
                };
                
                let yieldFloat = Float.fromInt64(Int64.fromNat64(totalYield)) * memberWeight / totalWeight;
                let memberYield = Nat64.fromNat(Int.abs(Float.toInt(yieldFloat)));
                
                distributions.add((member.principal, memberYield));
            };
            
            #ok(Buffer.toArray(distributions))
        };
        
        // Tiered distribution with member tier multipliers
        private func calculateTieredDistribution(
            totalYield: Types.Amount,
            members: [Types.Member],
            memberTiers: [(Principal, Nat)],
            tierMultipliers: [Float]
        ) : Result.Result<[(Principal, Types.Amount)], Types.Error> {
            
            if (tierMultipliers.size() == 0) {
                return #err(#InvalidAmount);
            };
            
            // Calculate weighted total
            var totalWeight: Float = 0.0;
            for (member in members.vals()) {
                let tierIndex = getMemberTier(member.principal, memberTiers);
                if (tierIndex < tierMultipliers.size()) {
                    totalWeight += tierMultipliers[tierIndex];
                } else {
                    totalWeight += 1.0; // Default multiplier
                };
            };
            
            let distributions = Buffer.Buffer<(Principal, Types.Amount)>(members.size());
            
            for (member in members.vals()) {
                let tierIndex = getMemberTier(member.principal, memberTiers);
                let multiplier = if (tierIndex < tierMultipliers.size()) {
                    tierMultipliers[tierIndex]
                } else {
                    1.0
                };
                
                let yieldFloat = Float.fromInt64(Int64.fromNat64(totalYield)) * multiplier / totalWeight;
                let memberYield = Nat64.fromNat(Int.abs(Float.toInt(yieldFloat)));
                
                distributions.add((member.principal, memberYield));
            };
            
            #ok(Buffer.toArray(distributions))
        };
        
        // Helper function to find member tier
        private func getMemberTier(principal: Principal, memberTiers: [(Principal, Nat)]) : Nat {
            for ((p, tier) in memberTiers.vals()) {
                if (Principal.equal(p, principal)) {
                    return tier;
                };
            };
            0 // Default tier
        };
        
        // ==================== R TOKEN YIELD DISTRIBUTION ====================
        
        // Distribute yield to R Token holders
        public func distributeRTokenYield(
            tokens: [Types.RToken],
            totalYield: Types.Amount
        ) : [(Types.RTokenId, Types.Amount)] {
            
            if (totalYield == 0 or tokens.size() == 0) {
                return [];
            };
            
            // Calculate total R Token value
            var totalTokenValue: Types.Amount = 0;
            for (token in tokens.vals()) {
                totalTokenValue += token.currentAmount;
            };
            
            if (totalTokenValue == 0) {
                return [];
            };
            
            // Distribute proportionally to R Token holdings
            let distributions = Buffer.Buffer<(Types.RTokenId, Types.Amount)>(tokens.size());
            
            for (token in tokens.vals()) {
                let proportion = Nat64.toNat(token.currentAmount) * Nat64.toNat(totalYield) / Nat64.toNat(totalTokenValue);
                let tokenYield = Nat64.fromNat(proportion);
                
                if (tokenYield > 0) {
                    distributions.add((token.id, tokenYield));
                };
            };
            
            Debug.print("R Token yield distributed - Total: " # Nat64.toText(totalYield) # 
                       " e8s to " # Nat.toText(distributions.size()) # " tokens");
            
            Buffer.toArray(distributions)
        };
        
        // ==================== DISTRIBUTION STRATEGIES ====================
        
        // Create default distribution strategy based on group characteristics
        public func createDefaultDistributionStrategy(
            groupSize: Nat,
            totalPoolValue: Types.Amount
        ) : DistributionStrategy {
            if (groupSize <= 5) {
                #equal // Small groups get equal distribution
            } else if (totalPoolValue >= 50_000_000_000) { // >= 500 ICP
                #proportional // Large pools use proportional distribution
            } else {
                #proportional // Default to proportional
            }
        };
        
        // ==================== DISTRIBUTION ANALYTICS ====================
        
        // Analyze distribution fairness
        public func analyzeDistributionFairness(
            distribution: YieldDistribution,
            members: [Types.Member]
        ) : {
            giniCoefficient: Float;
            averageDistribution: Types.Amount;
            standardDeviation: Float;
            fairnessScore: Float;
        } {
            let distributions = distribution.distributions;
            
            if (distributions.size() <= 1) {
                return {
                    giniCoefficient = 0.0;
                    averageDistribution = distribution.totalYield;
                    standardDeviation = 0.0;
                    fairnessScore = 1.0;
                };
            };
            
            // Calculate average
            let total = Array.foldLeft<(Principal, Types.Amount), Types.Amount>(
                distributions, 0, func(acc, (_, amount)) = acc + amount
            );
            let average = total / Nat64.fromNat(distributions.size());
            
            // Calculate variance for standard deviation
            let variance = Array.foldLeft<(Principal, Types.Amount), Float>(
                distributions, 0.0, func(acc, (_, amount)) = {
                    let diff = Float.fromInt64(Int64.fromNat64(amount)) - Float.fromInt64(Int64.fromNat64(average));
                    acc + (diff * diff)
                }
            ) / Float.fromInt(distributions.size());
            
            let stdDev = Float.sqrt(variance);
            
            // Simple fairness score (1.0 = perfectly fair, 0.0 = very unfair)
            let fairnessScore = if (average > 0) {
                Float.max(0.0, 1.0 - (stdDev / Float.fromInt64(Int64.fromNat64(average))))
            } else {
                1.0
            };
            
            {
                giniCoefficient = 0.0; // Simplified - would need more complex calculation
                averageDistribution = average;
                standardDeviation = stdDev;
                fairnessScore = fairnessScore;
            }
        };
    }
}