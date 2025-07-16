// src/components/LoginPage.tsx
import React, { useState } from 'react';
import InternetIdentityLogin from './internetidentitylogin';
import { AuthClient } from '@dfinity/auth-client';
import { LoginPageProps } from './types';

const LoginPage: React.FC<{ onLogin: (principal: string) => void; authClient: AuthClient | null }> = ({ 
  onLogin, 
  authClient 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInternetIdentityLogin = async () => {
    if (!authClient) {
      setError("Authentication client not initialized");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: process.env.REACT_APP_II_URL || "https://identity.ic0.app",
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000) // 1 week
        });
      });
      
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal().toString();
      onLogin(principal);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome to ICP</h1>
            <p className="mt-2 text-indigo-200">Secure login with Internet Identity</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium">
                  <span className="px-4 bg-white text-gray-500">Authenticate with</span>
                </div>
              </div>
              
              <InternetIdentityLogin 
                onClick={handleInternetIdentityLogin} 
                isLoading={isLoading}
              />
              
              <div className="mt-6 bg-indigo-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-indigo-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  What is Internet Identity?
                </h3>
                <p className="mt-2 text-xs text-indigo-600">
                  Internet Identity is a secure authentication system for the Internet Computer blockchain that uses WebAuthn and allows you to authenticate without usernames or passwords.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Powered by <span className="font-medium text-indigo-600">Internet Computer Protocol</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;