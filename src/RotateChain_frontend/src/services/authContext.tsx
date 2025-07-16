/*import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

interface AuthContextType {
  isAuthenticated: boolean;
  principal: Principal | null;
  login: () => void;
  logout: () => void;
  authLoading: boolean;
  identity: any;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  principal: null,
  login: () => {},
  logout: () => {},
  authLoading: true,
  identity: null,
});


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [identity, setIdentity] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        const isAuthenticated = await client.isAuthenticated();
        setIsAuthenticated(isAuthenticated);
        
        if (isAuthenticated) {
          const identity = client.getIdentity();
          setIdentity(identity);
          setPrincipal(identity.getPrincipal());
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;
    
    await authClient.login({
      identityProvider: import.meta.env.DFX_NETWORK === 'ic' 
        ? 'https://identity.ic0.app' 
        : `http://localhost:4943?canisterId=${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}`,
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        setIdentity(identity);
        setPrincipal(identity.getPrincipal());
        setIsAuthenticated(true);
      },
      windowOpenerFeatures: `
        left=${window.screen.width / 2 - 250},
        top=${window.screen.height / 2 - 300},
        width=500,height=600
      `,
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setIdentity(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      principal, 
      login, 
      logout,
      authLoading,
      identity
    }}>
      {children}
    </AuthContext.Provider>
  );
};*/