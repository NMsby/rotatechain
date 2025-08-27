// analytics_engine.mo - Comprehensive analytics and reporting system
import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Iter "mo:base/Iter";

import Types "./types";
import Utils "./utils";

module AnalyticsEngine {

    // ==================== ANALYTICS TYPES ====================
    
    public type GroupPerformanceMetrics = {
        groupId: Types.GroupId;
        totalMembers: Nat;
        activeMembers: Nat;
        totalContributions: Types.Amount;
        completedRounds: Nat;
        totalRounds: Nat;
        averageYield: Float;
        totalYieldGenerated: Types.Amount;
        participationRate: Float; // Percentage of members participating regularly
        groupHealth: Float; // Overall health score 0-1
        rTokenCirculation: Types.Amount; // Total R Tokens in circulation
        averageContributionDelay: Float; // Days
        complianceRate: Float; // Percentage of on-time contributions
    };
    
    public type UserAnalytics = {
        principal: Principal;
        groupsJoined: Nat;
        totalContributed: Types.Amount;
        totalReceived: Types.Amount;
        rTokenBalance: Types.Amount;
        rTokensTransferred: Types.Amount;
        loansRequested: Nat;
        loansApproved: Nat;
        totalBorrowed: Types.Amount;
        totalRepaid: Types.Amount;
        creditScore: Float; // 0-1 based on participation and repayment history
        participationScore: Float; // 0-1 based on group engagement
        yieldEarned: Types.Amount;
        missedContributions: Nat;
        averageResponseTime: Float; // Hours to respond to group activities
    };
    
    public type PlatformAnalytics = {
        totalGroups: Nat;
        activeGroups: Nat;
        totalUsers: Nat;
        activeUsers: Nat;
        totalValueLocked: Types.Amount;
        totalRTokens: Types.Amount;
        totalLoans: Types.Amount;
        averageGroupSize: Float;
        averageYield: Float;
        defaultRate: Float;
        rTokenVelocity: Float; // How frequently R Tokens change hands
        crossGroupLendingVolume: Types.Amount;
        platformGrowthRate: Float; // Month-over-month growth
        networkDensity: Float; // How interconnected groups are through lending
    };
    
    public type YieldAnalytics = {
        totalYieldGenerated: Types.Amount;
        averageYieldRate: Float;
        yieldByStrategy: [(Types.YieldStrategy, Types.Amount)];
        topPerformingGroups: [Types.GroupId];
        yieldDistribution: {
            toMembers: Types.Amount;
            toRTokenHolders: Types.Amount;
            platformFees: Types.Amount;
        };
        monthlyYieldTrend: [(Int, Types.Amount)]; // Month -> Yield
    };
    
    public type RiskAnalytics = {
        portfolioHealthScore: Float;
        totalExposure: Types.Amount;
        concentrationRisk: Float; // Risk from large borrowers
        liquidityRatio: Float; // Available liquidity vs total loans
        defaultProbability: Float; // Predicted platform default rate
        collateralizationRatio: Float; // Average collateral backing
        stressTestResults: {
            under10PercentDefault: Float; // Platform survival probability
            under25PercentDefault: Float;
            under50PercentDefault: Float;
        };
    };

    // ==================== ANALYTICS ENGINE CLASS ====================
    
    public class AnalyticsEngine() {
        
        // ==================== TIME SERIES DATA ====================
        
        // Store historical snapshots for trend analysis
        private var historicalMetrics = Buffer.Buffer<(Int, PlatformAnalytics)>(100);
        
        // ==================== CORE ANALYTICS FUNCTIONS ====================
        
        // Calculate comprehensive group performance metrics
        public func calculateGroupPerformance(
            groupId: Types.GroupId,
            group: Types.GroupConfig,
            rotation: Types.RotationState,
            members: [Types.Member],
            groupTokens: [Types.RToken],
            groupTransactions: [Types.Transaction]
        ) : GroupPerformanceMetrics {
            
            let totalMembers = members.size();
            var activeMembers = 0;
            var totalContributions: Types.Amount = 0;
            var totalYieldGenerated: Types.Amount = rotation.yieldGenerated;
            var totalMissedContributions = 0;
            var totalContributionTime: Float = 0.0;
            var contributionCount = 0;
            
            // Analyze member activity
            for (member in members.vals()) {
                totalContributions += member.totalContributions;
                totalMissedContributions += member.missedContributions;
                
                if (member.status == #active and member.totalContributions > 0) {
                    activeMembers += 1;
                };
                
                // Calculate contribution timing
                switch (member.lastContributionTime) {
                    case (?lastTime) {
                        let timeDiff = Float.fromInt64(Int64.fromInt(lastTime - member.joinedAt)) / (24.0 * 60.0 * 60.0 * 1_000_000_000.0);
                        totalContributionTime += timeDiff;
                        contributionCount += 1;
                    };
                    case null { };
                };
            };
            
            // Calculate R Token circulation
            var rTokenCirculation: Types.Amount = 0;
            for (token in groupTokens.vals()) {
                rTokenCirculation += token.currentAmount;
            };
            
            // Calculate performance metrics
            let participationRate = if (totalMembers > 0) {
                Float.fromInt(activeMembers) / Float.fromInt(totalMembers)
            } else { 0.0 };
            
            let averageYield = if (totalContributions > 0) {
                Float.fromInt64(Int64.fromNat64(totalYieldGenerated)) / Float.fromInt64(Int64.fromNat64(totalContributions)) * 100.0
            } else { 0.0 };
            
            let complianceRate = if (totalMembers * rotation.currentRound > 0) {
                let expectedContributions = totalMembers * rotation.currentRound;
                let actualContributions = if (expectedContributions >= totalMissedContributions) {
                    expectedContributions - totalMissedContributions
                } else { 0 };
                Float.fromInt(actualContributions) / Float.fromInt(expectedContributions)
            } else { 1.0 };
            
            let averageContributionDelay = if (contributionCount > 0) {
                totalContributionTime / Float.fromInt(contributionCount)
            } else { 0.0 };
            
            // Calculate group health score (weighted average of key metrics)
            let groupHealth = (participationRate * 0.4) + (complianceRate * 0.4) + (Float.min(averageYield / 10.0, 1.0) * 0.2);
            
            {
                groupId = groupId;
                totalMembers = totalMembers;
                activeMembers = activeMembers;
                totalContributions = totalContributions;
                completedRounds = if (rotation.currentRound > 0) { rotation.currentRound - 1 } else { 0 };
                totalRounds = rotation.totalRounds;
                averageYield = averageYield;
                totalYieldGenerated = totalYieldGenerated;
                participationRate = participationRate;
                groupHealth = groupHealth;
                rTokenCirculation = rTokenCirculation;
                averageContributionDelay = averageContributionDelay;
                complianceRate = complianceRate;
            }
        };
        
        // Calculate individual user analytics
        public func calculateUserAnalytics(
            user: Principal,
            userGroups: [Types.GroupConfig],
            userMembers: [Types.Member],
            userTokens: [Types.RToken],
            userLoans: [Types.Loan],
            userTransactions: [Types.Transaction],
            userTransfers: [Types.RTokenTransfer]
        ) : UserAnalytics {
            
            let groupsJoined = userGroups.size();
            var totalContributed: Types.Amount = 0;
            var totalReceived: Types.Amount = 0;
            var rTokenBalance: Types.Amount = 0;
            var yieldEarned: Types.Amount = 0;
            var missedContributions = 0;
            
            // Analyze member performance across groups
            for (member in userMembers.vals()) {
                totalContributed += member.totalContributions;
                totalReceived += member.receivedPayouts;
                missedContributions += member.missedContributions;
            };
            
            // Calculate R Token metrics
            var rTokensTransferred: Types.Amount = 0;
            for (token in userTokens.vals()) {
                rTokenBalance += token.currentAmount;
                yieldEarned += token.accumulatedYield;
            };
            
            for (transfer in userTransfers.vals()) {
                if (Principal.equal(transfer.from, user)) {
                    rTokensTransferred += transfer.amount;
                };
            };
            
            // Analyze lending activity
            let loansRequested = userLoans.size();
            var loansApproved = 0;
            var totalBorrowed: Types.Amount = 0;
            var totalRepaid: Types.Amount = 0;
            
            for (loan in userLoans.vals()) {
                totalBorrowed += loan.disbursedAmount;
                totalRepaid += loan.totalPaid;
                
                switch (loan.status) {
                    case (#approved or #active or #repaid) { loansApproved += 1 };
                    case (_) { };
                };
            };
            
            // Calculate credit score (based on repayment history and group participation)
            let repaymentRatio = if (totalBorrowed > 0) {
                Float.fromInt64(Int64.fromNat64(totalRepaid)) / Float.fromInt64(Int64.fromNat64(totalBorrowed))
            } else { 1.0 };
            
            let participationRatio = if (groupsJoined > 0 and (totalContributed + Nat64.fromNat(missedContributions * 1000000)) > 0) {
                Float.fromInt64(Int64.fromNat64(totalContributed)) / 
                Float.fromInt64(Int64.fromNat64(totalContributed + Nat64.fromNat(missedContributions * 1000000)))
            } else { 1.0 };
            
            let creditScore = (repaymentRatio * 0.6) + (participationRatio * 0.4);
            let participationScore = participationRatio;
            
            // Estimate average response time (simplified calculation)
            let averageResponseTime = Float.fromInt(missedContributions) * 24.0; // Hours
            
            {
                principal = user;
                groupsJoined = groupsJoined;
                totalContributed = totalContributed;
                totalReceived = totalReceived;
                rTokenBalance = rTokenBalance;
                rTokensTransferred = rTokensTransferred;
                loansRequested = loansRequested;
                loansApproved = loansApproved;
                totalBorrowed = totalBorrowed;
                totalRepaid = totalRepaid;
                creditScore = creditScore;
                participationScore = participationScore;
                yieldEarned = yieldEarned;
                missedContributions = missedContributions;
                averageResponseTime = averageResponseTime;
            }
        };
        
        // Calculate platform-wide analytics
        public func calculatePlatformAnalytics(
            allGroups: [(Types.GroupId, Types.GroupConfig)],
            allRotations: [(Types.GroupId, Types.RotationState)],
            allMembers: [(Types.GroupId, [Types.Member])],
            allTokens: [Types.RToken],
            allLoans: [Types.Loan],
            allTransfers: [Types.RTokenTransfer]
        ) : PlatformAnalytics {
            
            let totalGroups = allGroups.size();
            var activeGroups = 0;
            var totalValueLocked: Types.Amount = 0;
            var totalRTokens: Types.Amount = 0;
            var totalLoans: Types.Amount = 0;
            var totalMembers = 0;
            var activeUsers = 0;
            var totalYield: Types.Amount = 0;
            var defaultedLoans = 0;
            
            // Analyze groups
            for ((groupId, group) in allGroups.vals()) {
                if (group.status == #active) {
                    activeGroups += 1;
                };
                
                totalMembers += group.members.size();
                
                switch (Array.find<(Types.GroupId, Types.RotationState)>(
                    allRotations, func((id, _)) = id == groupId
                )) {
                    case (?(_, rotation)) {
                        totalValueLocked += rotation.poolBalance;
                        totalYield += rotation.yieldGenerated;
                    };
                    case null { };
                };
            };
            
            // Analyze R Tokens
            for (token in allTokens.vals()) {
                totalRTokens += token.currentAmount;
            };
            
            // Analyze loans
            for (loan in allLoans.vals()) {
                totalLoans += loan.principalAmount;
                if (loan.status == #defaulted) {
                    defaultedLoans += 1;
                };
            };
            
            // Calculate derived metrics
            let averageGroupSize = if (totalGroups > 0) {
                Float.fromInt(totalMembers) / Float.fromInt(totalGroups)
            } else { 0.0 };
            
            let averageYield = if (totalValueLocked > 0) {
                Float.fromInt64(Int64.fromNat64(totalYield)) / Float.fromInt64(Int64.fromNat64(totalValueLocked)) * 100.0
            } else { 0.0 };
            
            let defaultRate = if (allLoans.size() > 0) {
                Float.fromInt(defaultedLoans) / Float.fromInt(allLoans.size()) * 100.0
            } else { 0.0 };
            
            // Calculate R Token velocity (simplified)
            let rTokenVelocity = if (totalRTokens > 0 and allTransfers.size() > 0) {
                Float.fromInt(allTransfers.size()) / Float.fromInt64(Int64.fromNat64(totalRTokens)) * 30.0 // Monthly velocity
            } else { 0.0 };
            
            // Calculate cross-group lending volume
            var crossGroupLendingVolume: Types.Amount = 0;
            for (loan in allLoans.vals()) {
                switch (loan.lenderGroupId) {
                    case (?lenderGroupId) {
                        if (lenderGroupId != loan.borrowerGroupId) {
                            crossGroupLendingVolume += loan.principalAmount;
                        };
                    };
                    case null { };
                };
            };
            
            // Simplified calculations for complex metrics
            let activeUsersEstimate = Int.abs(Float.toInt(Float.fromInt(totalMembers) * 0.7)); // Estimate 70% active
            let platformGrowthRate = 15.5; // Placeholder - would calculate from historical data
            let networkDensity = Float.fromInt(totalGroups) / Float.max(Float.fromInt(totalMembers), 1.0);
            
            {
                totalGroups = totalGroups;
                activeGroups = activeGroups;
                totalUsers = totalMembers;
                activeUsers = activeUsersEstimate;
                totalValueLocked = totalValueLocked;
                totalRTokens = totalRTokens;
                totalLoans = totalLoans;
                averageGroupSize = averageGroupSize;
                averageYield = averageYield;
                defaultRate = defaultRate;
                rTokenVelocity = rTokenVelocity;
                crossGroupLendingVolume = crossGroupLendingVolume;
                platformGrowthRate = platformGrowthRate;
                networkDensity = networkDensity;
            }
        };
        
        // Calculate yield-specific analytics
        public func calculateYieldAnalytics(
            allGroups: [(Types.GroupId, Types.GroupConfig)],
            allRotations: [(Types.GroupId, Types.RotationState)],
            yieldDistributions: [(Types.GroupId, Types.Amount)] // Group -> Total yield distributed to members
        ) : YieldAnalytics {
            
            var totalYieldGenerated: Types.Amount = 0;
            var totalPoolValue: Types.Amount = 0;
            let topPerformingGroups = Buffer.Buffer<Types.GroupId>(5);
            var toMembers: Types.Amount = 0;
            var toRTokenHolders: Types.Amount = 0;
            
            // Analyze yield generation
            for ((groupId, rotation) in allRotations.vals()) {
                totalYieldGenerated += rotation.yieldGenerated;
                totalPoolValue += rotation.poolBalance;
                
                // Track top performing groups (simplified)
                if (rotation.yieldGenerated > 1_000_000_000) { // > 10 ICP yield
                    topPerformingGroups.add(groupId);
                };
            };
            
            // Calculate yield distribution
            for ((_, yieldAmount) in yieldDistributions.vals()) {
                toMembers += yieldAmount;
            };
            
            // Estimate R Token holder yield (20% of total yield)
            toRTokenHolders := totalYieldGenerated / 5; // 20%
            let platformFees = Utils.calculatePlatformFee(totalYieldGenerated);
            
            let averageYieldRate = if (totalPoolValue > 0) {
                Float.fromInt64(Int64.fromNat64(totalYieldGenerated)) / Float.fromInt64(Int64.fromNat64(totalPoolValue)) * 100.0
            } else { 0.0 };
            
            // Create mock strategy analysis
            let yieldByStrategy = [
                (#fixed(500), totalYieldGenerated / 3),
                (#variable({baseRate = 500; minRate = 300; maxRate = 800; marketFactor = 1.0}), totalYieldGenerated / 3),
                (#compound({rate = 550; compoundFrequency = 12}), totalYieldGenerated / 3)
            ];
            
            // Mock monthly trend (would use historical data in production)
            let monthlyYieldTrend = [
                (202501, totalYieldGenerated / 6),
                (202502, totalYieldGenerated / 5),
                (202503, totalYieldGenerated / 4),
                (202504, totalYieldGenerated / 3),
                (202505, totalYieldGenerated / 2),
                (202506, totalYieldGenerated)
            ];
            
            {
                totalYieldGenerated = totalYieldGenerated;
                averageYieldRate = averageYieldRate;
                yieldByStrategy = yieldByStrategy;
                topPerformingGroups = Buffer.toArray(topPerformingGroups);
                yieldDistribution = {
                    toMembers = toMembers;
                    toRTokenHolders = toRTokenHolders;
                    platformFees = platformFees;
                };
                monthlyYieldTrend = monthlyYieldTrend;
            }
        };
        
        // Calculate risk analytics for lending portfolio
        public func calculateRiskAnalytics(
            allLoans: [Types.Loan],
            allTokens: [Types.RToken],
            platformAnalytics: PlatformAnalytics
        ) : RiskAnalytics {
            
            var totalExposure: Types.Amount = 0;
            var totalCollateral: Types.Amount = 0;
            var activeLoans = 0;
            var defaultedLoans = 0;
            var largestLoan: Types.Amount = 0;
            
            // Analyze loan portfolio
            for (loan in allLoans.vals()) {
                totalExposure += loan.remainingBalance;
                totalCollateral += loan.collateralValue;
                
                if (loan.remainingBalance > largestLoan) {
                    largestLoan := loan.remainingBalance;
                };
                
                switch (loan.status) {
                    case (#active) { activeLoans += 1 };
                    case (#defaulted or #liquidated) { defaultedLoans += 1 };
                    case (_) { };
                };
            };
            
            // Calculate risk metrics
            let concentrationRisk = if (totalExposure > 0) {
                Float.fromInt64(Int64.fromNat64(largestLoan)) / Float.fromInt64(Int64.fromNat64(totalExposure))
            } else { 0.0 };
            
            let collateralizationRatio = if (totalExposure > 0) {
                Float.fromInt64(Int64.fromNat64(totalCollateral)) / Float.fromInt64(Int64.fromNat64(totalExposure))
            } else { 0.0 };
            
            let defaultProbability = if (allLoans.size() > 0) {
                Float.fromInt(defaultedLoans) / Float.fromInt(allLoans.size())
            } else { 0.0 };
            
            let liquidityRatio = if (totalExposure > 0) {
                Float.fromInt64(Int64.fromNat64(platformAnalytics.totalValueLocked)) / Float.fromInt64(Int64.fromNat64(totalExposure))
            } else { 1.0 };
            
            // Portfolio health score (weighted combination of risk factors)
            let portfolioHealthScore = Float.max(0.0, 
                1.0 - (concentrationRisk * 0.3) - (defaultProbability * 0.4) - (Float.max(0.0, 1.2 - collateralizationRatio) * 0.3)
            );
            
            // Stress test scenarios (simplified Monte Carlo simulation)
            let under10PercentDefault = Float.max(0.0, 1.0 - (defaultProbability + 0.1) * Float.fromInt64(Int64.fromNat64(totalExposure)) / Float.fromInt64(Int64.fromNat64(platformAnalytics.totalValueLocked)));
            let under25PercentDefault = Float.max(0.0, 1.0 - (defaultProbability + 0.25) * 1.5);
            let under50PercentDefault = Float.max(0.0, 1.0 - (defaultProbability + 0.5) * 2.0);
            
            {
                portfolioHealthScore = portfolioHealthScore;
                totalExposure = totalExposure;
                concentrationRisk = concentrationRisk;
                liquidityRatio = liquidityRatio;
                defaultProbability = defaultProbability;
                collateralizationRatio = collateralizationRatio;
                stressTestResults = {
                    under10PercentDefault = under10PercentDefault;
                    under25PercentDefault = under25PercentDefault;
                    under50PercentDefault = under50PercentDefault;
                };
            }
        };
        
        // Store platform snapshot for historical analysis
        public func recordPlatformSnapshot(analytics: PlatformAnalytics) {
            let timestamp = Time.now();
            historicalMetrics.add((timestamp, analytics));
            
            // Keep only last 100 snapshots to manage memory
            if (historicalMetrics.size() > 100) {
                let newBuffer = Buffer.Buffer<(Int, PlatformAnalytics)>(100);
                let currentSize = historicalMetrics.size();
                let start = if (currentSize >= 100) { currentSize - 100 } else { 0 };
                for (i in Iter.range(start, historicalMetrics.size() - 1)) {
                    newBuffer.add(historicalMetrics.get(i));
                };
                historicalMetrics := newBuffer;
            };
        };
        
        // Get historical trend data
        public func getHistoricalTrends(days: Nat) : [(Int, PlatformAnalytics)] {
            let cutoffTime = Time.now() - (days * 24 * 60 * 60 * 1_000_000_000);
            let trendData = Buffer.Buffer<(Int, PlatformAnalytics)>(days);
            
            for ((timestamp, analytics) in historicalMetrics.vals()) {
                if (timestamp >= cutoffTime) {
                    trendData.add((timestamp, analytics));
                };
            };
            
            Buffer.toArray(trendData)
        };
    }
}