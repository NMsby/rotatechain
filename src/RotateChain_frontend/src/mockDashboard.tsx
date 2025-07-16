// src/components/Dashboard.tsx
import React from 'react';
import { DashboardProps } from '../types';

const Dashboard: React.FC<DashboardProps> = ({ 
  userData, 
  onLogout 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
              {userData.username.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome, {userData.username}</h1>
            <p className="mt-2 text-indigo-200">You're authenticated with Internet Identity</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Principal ID
                </h3>
                <p className="mt-1 text-sm font-mono text-gray-900 break-all">{userData.principal}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Last Login
                </h3>
                <p className="mt-1 text-sm text-gray-900">{userData.lastLogin}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button className="py-3 px-4 rounded-lg bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Profile
                </button>
                <button 
                  onClick={onLogout}
                  className="py-3 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></div>
            Connected to Internet Computer
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;