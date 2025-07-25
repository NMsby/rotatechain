// src/App.tsx
import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { AuthClient} from '@dfinity/auth-client';
import LoginPage from './loginpage';
import Dashboard from './mockDashboard';
import { UserData } from './types';
import SmartOnboarding from './onboarding_new';
import { Chain } from './rotate_dashboard_graph_payment';
import { Actor } from '@dfinity/agent';
import { SplashScreen } from './sassySplash';
import { useNavigate } from 'react-router-dom';

function App({chainActor,setChainData}:{chainActor:Actor | undefined | null,setChainData:Dispatch<SetStateAction<Chain | undefined>>}) {
  const [authClient,setAuthClient] = useState<AuthClient | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate()
  
  useEffect(() => {
    const initAuthClient = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        if (await client.isAuthenticated()) {
          const identity = client.getIdentity();
          const principal = identity.getPrincipal().toString();
          setUserData({
            principal,
            username: `user_${principal.substring(0, 8)}`,
            lastLogin: new Date().toLocaleString()
          });
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to initialize auth client:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuthClient();
  }, []);
  
  const handleLogin = (principal: string) => {
    setUserData({
      principal,
      username: `user_${principal.substring(0, 8)}`,
      lastLogin: new Date().toLocaleString()
    });
    setIsLoggedIn(true);
  };
  
  const handleLogout = async () => {
    if (authClient) {
      await authClient.logout();
    }
    setIsLoggedIn(false);
    setUserData(null);
  };

  if (isLoading) {
    return (
      <SplashScreen onFinish={() => setIsLoading(false)}/>
    );
  }
  if(isLoggedIn && userData){
    navigate("/join")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {isLoggedIn && userData ? (
        
        <SmartOnboarding chainActor={chainActor} setChainData={setChainData} authClient={authClient} onLogout={handleLogout}/>
        /*<Dashboard userData={userData} onLogout={handleLogout} />*/
      ) : (
        <LoginPage onLogin={handleLogin} authClient={authClient} />
      )}
    </div>
  );
}

export default App;