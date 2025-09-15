import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useBackend = () => {
    const { isAuthenticated, callBackend } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generic backend call wrapper
    const makeBackendCall = async <T>(
        method: string,
        args: any[] = []
    ): Promise<T | null> => {
        if (!isAuthenticated) {
            setError('Authentication required');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log(`🔄 Backend call: ${method}`, args.length > 0 ? `with ${args.length} args` : '');
      
            // Use the hybrid auth context's callBackend method
            const result = await callBackend<T>(method, args);
      
            if (result === null) {
                throw new Error(`Backend call ${method} returned null`);
            }
      
            console.log(`✅ Backend call successful: ${method}`);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown backend error';
            setError(errorMessage);
            console.error(`❌ Backend call failed for ${method}:`, err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Specific backend methods  
    // Health check function
    const checkHealth = async (): Promise<boolean> => {
        try {
            const result = await makeBackendCall<boolean>('healthCheck');
            return result === true;
        } catch {
            return false;
        }
    };

    // Get platform stats
    const getPlatformStats = async () => {
        return makeBackendCall('getSystemStats');
    };

    // Get user balance
    const getUserBalance = async () => {
        return makeBackendCall('getMyBalance');
    };

    // R Token methods
    const getRTokenBalance = async (groupId?: number) => {
        if (groupId) {
        return makeBackendCall('getRTokenBalance', [groupId]);
        }
        return makeBackendCall('getAllRTokenBalances');
    };

    const getMyRTokens = async () => {
        return makeBackendCall('getMyRTokens');
    };

    // Group methods
    const getUserGroups = async () => {
        return makeBackendCall('getUserGroups');
    };

    const getAllGroups = async () => {
        return makeBackendCall('getAllGroups');
    };

    // System methods
    const runSystemTests = async () => {
        return makeBackendCall('runSystemTests');
    };

    const getPlatformAnalytics = async () => {
        return makeBackendCall('getPlatformAnalytics');
    };


    return {
    // Core functionality
    makeBackendCall,
    isLoading,
    error,
    setError,
    
    // Specific methods
    checkHealth,
    getPlatformStats,
    getUserBalance,
    getRTokenBalance,
    getMyRTokens,
    getUserGroups,
    getAllGroups,
    runSystemTests,
    getPlatformAnalytics,
  };
};

export default useBackend;