import { useEffect, useState } from 'react';
/*
import { blockchainService } from '../services/blockchain';
import { Token } from '../types';

export const useStakingData = (tokenId: string, principal: string) => {
  const [stakingData, setStakingData] = useState({
    userStaked: 0,
    totalStaked: 0,
    rewards: 0,
    apy: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!principal) return;
      
      try {
        const [userStaked, totalStaked, rewards, apy] = await Promise.all([
          blockchainService.getUserStake(tokenId, principal),
          blockchainService.getTotalStaked(tokenId),
          blockchainService.getRewards(tokenId, principal),
          blockchainService.getAPY(tokenId)
        ]);
        
        setStakingData({
          userStaked,
          totalStaked,
          rewards,
          apy,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching staking data:', error);
        setStakingData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [tokenId, principal]);

  return stakingData;
};

export const usePoolData = (poolId: string) => {
  const [poolData, setPoolData] = useState({
    tvl: 0,
    volume24h: 0,
    liquidityData: [] as any[],
    isLoading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!poolId) return;
      
      try {
        const [tvl, volume24h, liquidityData] = await Promise.all([
          blockchainService.getPoolTVL(poolId),
          blockchainService.getPoolVolume(poolId),
          blockchainService.getPoolLiquidityData(poolId)
        ]);
        
        setPoolData({
          tvl,
          volume24h,
          liquidityData: liquidityData.data,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching pool data:', error);
        setPoolData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [poolId]);

  return poolData;
};

export const useTokenPrices = (tokenIds: string[]) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const priceResults = await blockchainService.getTokenPrices(tokenIds);
        setPrices(priceResults);
      } catch (error) {
        console.error('Error fetching token prices:', error);
        // Fallback prices
        setPrices({
          'icp': 13.25,
          'eth': 3500,
          'btc': 62000,
          'usdc': 1
        });
      }
    };
    
    fetchPrices();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [tokenIds]);

  return prices;
};*/