// yield_manager.mo - Advanced yield calculation and management system
import Time "mo:base/Time";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";

import Types "./types";
import Utils "./utils";

module YieldManager {
    
    // ==================== YIELD STRATEGY TYPES ====================
    
    public type YieldStrategy = Types.YieldStrategy;
    public type YieldCalculation = Types.YieldCalculation;
    
    // ==================== YIELD MANAGER CLASS ====================
    
    public class YieldManager() {
        
        // Market conditions simulation (in production, would fetch from oracles)
        private var marketVolatility: Float = 1.0; // 1.0 = normal conditions
        private var liquidityMultiplier: Float = 1.0; // Pool liquidity factor
        private var platformRiskFactor: Float = 0.95; // Platform risk adjustment
        
        // ==================== CORE YIELD CALCULATIONS ====================
        
        // Enhanced yield calculation with multiple strategies
        public func calculateYield(
            principal: Types.Amount,
            strategy: YieldStrategy,
            durationDays: Nat,
            poolSize: ?Types.Amount,
            marketConditions: ?Float
        ) : Result.Result<YieldCalculation, Types.Error> {
            
            if (not Utils.validateAmount(principal)) {
                return #err(#InvalidAmount);
            };
            
            if (durationDays == 0) {
                return #err(#InvalidAmount);
            };
            
            // Apply market conditions if provided
            let marketFactor = switch (marketConditions) {
                case (?factor) { factor };
                case null { marketVolatility };
            };
            
            let calculation = switch (strategy) {
                case (#fixed(annualRate)) {
                    calculateFixedYield(principal, annualRate, durationDays, marketFactor)
                };
                case (#variable(config)) {
                    calculateVariableYield(principal, config, durationDays, marketFactor)
                };
                case (#tiered(config)) {
                    calculateTieredYield(principal, config, durationDays, poolSize, marketFactor)
                };
                case (#compound(config)) {
                    calculateCompoundYield(principal, config, durationDays, marketFactor)
                };
            };
            
            #ok(calculation)
        };
        
        // Fixed rate calculation with market adjustments
        private func calculateFixedYield(
            principal: Types.Amount,
            annualRate: Nat,
            durationDays: Nat,
            marketFactor: Float
        ) : YieldCalculation {
            let dailyRate = Float.fromInt(annualRate) / 10_000.0 / 365.0;
            let adjustedRate = dailyRate * marketFactor * platformRiskFactor;
            let yieldFloat = Float.fromInt64(Int64.fromNat64(principal)) * adjustedRate * Float.fromInt(durationDays);
            let yieldAmount = Nat64.fromNat(Int.abs(Float.toInt(yieldFloat)));
            
            {
                baseAmount = principal;
                yieldAmount = yieldAmount;
                effectiveRate = adjustedRate * 365.0 * 100.0; // Annualized percentage
                calculationMethod = "Fixed Rate with Market Adjustment";
                timestamp = Time.now();
                durationDays = durationDays;
            }
        };
        
        // Variable rate calculation
        private func calculateVariableYield(
            principal: Types.Amount,
            config: {baseRate: Nat; minRate: Nat; maxRate: Nat; marketFactor: Float},
            durationDays: Nat,
            marketFactor: Float
        ) : YieldCalculation {
            let baseRateFloat = Float.fromInt(config.baseRate) / 10_000.0;
            let adjustedRate = baseRateFloat * config.marketFactor * marketFactor * platformRiskFactor;
            
            // Apply bounds
            let minRateFloat = Float.fromInt(config.minRate) / 10_000.0;
            let maxRateFloat = Float.fromInt(config.maxRate) / 10_000.0;
            let boundedRate = Float.max(minRateFloat, Float.min(maxRateFloat, adjustedRate));
            
            let dailyRate = boundedRate / 365.0;
            let yieldFloat = Float.fromInt64(Int64.fromNat64(principal)) * dailyRate * Float.fromInt(durationDays);
            let yieldAmount = Nat64.fromNat(Int.abs(Float.toInt(yieldFloat)));
            
            {
                baseAmount = principal;
                yieldAmount = yieldAmount;
                effectiveRate = boundedRate * 100.0; // Annual percentage
                calculationMethod = "Variable Rate with Bounds";
                timestamp = Time.now();
                durationDays = durationDays;
            }
        };
        
        // Tiered rate calculation based on pool size
        private func calculateTieredYield(
            principal: Types.Amount,
            config: {tiers: [(Types.Amount, Nat)]},
            durationDays: Nat,
            poolSize: ?Types.Amount,
            marketFactor: Float
        ) : YieldCalculation {
            let effectivePoolSize = switch (poolSize) {
                case (?size) { size };
                case null { principal }; // Use principal if no pool size provided
            };
            
            // Find applicable tier
            var applicableRate = Types.DEFAULT_YIELD_RATE; // Fallback
            for ((threshold, rate) in config.tiers.vals()) {
                if (effectivePoolSize >= threshold) {
                    applicableRate := rate;
                };
            };
            
            let rateFloat = Float.fromInt(applicableRate) / 10_000.0;
            let adjustedRate = rateFloat * marketFactor * platformRiskFactor;
            let dailyRate = adjustedRate / 365.0;
            let yieldFloat = Float.fromInt64(Int64.fromNat64(principal)) * dailyRate * Float.fromInt(durationDays);
            let yieldAmount = Nat64.fromNat(Int.abs(Float.toInt(yieldFloat)));
            
            {
                baseAmount = principal;
                yieldAmount = yieldAmount;
                effectiveRate = adjustedRate * 100.0;
                calculationMethod = "Tiered Rate (Pool Size: " # Nat64.toText(effectivePoolSize) # ")";
                timestamp = Time.now();
                durationDays = durationDays;
            }
        };
        
        // Compound interest calculation
        private func calculateCompoundYield(
            principal: Types.Amount,
            config: {rate: Nat; compoundFrequency: Nat},
            durationDays: Nat,
            marketFactor: Float
        ) : YieldCalculation {
            let annualRate = Float.fromInt(config.rate) / 10_000.0 * marketFactor * platformRiskFactor;
            let periodsPerYear = Float.fromInt(config.compoundFrequency);
            let totalPeriods = periodsPerYear * (Float.fromInt(durationDays) / 365.0);
            let ratePerPeriod = annualRate / periodsPerYear;
            
            let compoundFactor = Float.pow(1.0 + ratePerPeriod, totalPeriods);
            let finalAmount = Float.fromInt64(Int64.fromNat64(principal)) * compoundFactor;
            let yieldAmount = Nat64.fromNat(Int.abs(Float.toInt(finalAmount - Float.fromInt64(Int64.fromNat64(principal)))));
            
            {
                baseAmount = principal;
                yieldAmount = yieldAmount;
                effectiveRate = (compoundFactor - 1.0) * 100.0 * (365.0 / Float.fromInt(durationDays));
                calculationMethod = "Compound Interest (" # Nat.toText(config.compoundFrequency) # "x/year)";
                timestamp = Time.now();
                durationDays = durationDays;
            }
        };
        
        // ==================== R TOKEN YIELD UPDATES ====================
        
        // Calculate yield for R Token since last update
        public func calculateRTokenYieldUpdate(
            token: Types.RToken,
            currentStrategy: YieldStrategy
        ) : Result.Result<Types.Amount, Types.Error> {
            let daysSinceUpdate = (Time.now() - token.lastYieldUpdate) / (24 * 60 * 60 * 1_000_000_000);
            let durationDays = Int.abs(daysSinceUpdate);
            
            if (durationDays == 0) {
                return #ok(0); // No time elapsed
            };
            
            switch (calculateYield(token.currentAmount, currentStrategy, durationDays, null, null)) {
                case (#ok(calculation)) {
                    Debug.print("R Token yield calculated: " # Nat64.toText(calculation.yieldAmount) # " e8s");
                    #ok(calculation.yieldAmount)
                };
                case (#err(error)) { #err(error) };
            }
        };
        
        // ==================== GROUP YIELD STRATEGIES ====================
        
        // Create default yield strategy for new groups
        public func createDefaultStrategy(groupSize: Nat, contributionAmount: Types.Amount) : YieldStrategy {
            let totalPoolSize = contributionAmount * Nat64.fromNat(groupSize);
            
            // Use tiered strategy based on pool size for better incentives
            if (totalPoolSize >= 10_000_000_000) { // >= 100 ICP
                #tiered({
                    tiers = [
                        (0, 400),                    // 4% for small pools
                        (5_000_000_000, 500),       // 5% for 50+ ICP pools  
                        (10_000_000_000, 600),      // 6% for 100+ ICP pools
                        (50_000_000_000, 750),      // 7.5% for 500+ ICP pools
                    ];
                })
            } else if (groupSize >= 10) {
                // Large groups get compound interest
                #compound({
                    rate = 550; // 5.5% annually
                    compoundFrequency = 12; // Monthly compounding
                })
            } else {
                // Small groups get variable rate
                #variable({
                    baseRate = 500; // 5% base
                    minRate = 300;  // 3% minimum
                    maxRate = 800;  // 8% maximum
                    marketFactor = 1.1; // Slight boost for smaller pools
                })
            }
        };
        
        // ==================== MARKET CONDITIONS ====================
        
        // Update market conditions (would integrate with price oracles in production)
        public func updateMarketConditions(volatility: Float, liquidity: Float) {
            marketVolatility := volatility;
            liquidityMultiplier := liquidity;
            
            Debug.print("Market conditions updated - Volatility: " # Float.toText(volatility) # 
                       ", Liquidity: " # Float.toText(liquidity));
        };
        
        // Get current market conditions
        public func getCurrentMarketConditions() : {volatility: Float; liquidity: Float; riskFactor: Float} {
            {
                volatility = marketVolatility;
                liquidity = liquidityMultiplier;
                riskFactor = platformRiskFactor;
            }
        };
        
        // ==================== YIELD ANALYTICS ====================
        
        // Calculate projected annual return
        public func projectAnnualReturn(
            principal: Types.Amount,
            strategy: YieldStrategy,
            marketConditions: ?Float
        ) : Result.Result<{projectedYield: Types.Amount; effectiveRate: Float}, Types.Error> {
            switch (calculateYield(principal, strategy, 365, null, marketConditions)) {
                case (#ok(calculation)) {
                    #ok({
                        projectedYield = calculation.yieldAmount;
                        effectiveRate = calculation.effectiveRate;
                    })
                };
                case (#err(error)) { #err(error) };
            }
        };
        
        // Calculate yield comparison between strategies
        public func compareStrategies(
            principal: Types.Amount,
            strategies: [YieldStrategy],
            durationDays: Nat
        ) : [(YieldStrategy, YieldCalculation)] {
            Array.map<YieldStrategy, (YieldStrategy, YieldCalculation)>(
                strategies,
                func(strategy: YieldStrategy) : (YieldStrategy, YieldCalculation) {
                    let calculation = switch (calculateYield(principal, strategy, durationDays, null, null)) {
                        case (#ok(calc)) { calc };
                        case (#err(_)) {
                            {
                                baseAmount = principal;
                                yieldAmount = 0;
                                effectiveRate = 0.0;
                                calculationMethod = "Error";
                                timestamp = Time.now();
                                durationDays = durationDays;
                            } : YieldCalculation
                        };
                    };
                    (strategy, calculation)
                }
            )
        };
    }
}