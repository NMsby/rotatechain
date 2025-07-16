// src/App.tsx
import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import LoginPage from './loginpage';
import Dashboard from './mockDashboard';
import { UserData } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700">Initializing Internet Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {isLoggedIn && userData ? (
        <Dashboard userData={userData} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} authClient={authClient} />
      )}
    </div>
  );
}

export default App;