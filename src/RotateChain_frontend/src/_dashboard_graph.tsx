// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface Member {
  id: string;
  name: string;
  walletAddress: string;
  contributed: boolean;
  contributionAmount: number;
  isLender: boolean;
  loans: Loan[];
}

interface Loan {
  id: string;
  borrowerId: string;
  lenderId: string;
  amount: number;
  interestRate: number;
  status: 'pending' | 'approved' | 'repaid' | 'defaulted';
  dueDate: string;
  repaymentDate?: string;
}

interface Chain {
  id: string;
  name: string;
  type: 'social' | 'global';
  totalRounds: number;
  currentRound: number;
  roundDuration: number; // in days
  startDate: string;
  totalFunds: number;
  currentFunds: number;
  currency: string;
  members: Member[];
  loans: Loan[];
  interestRate: number;
}

// Helper function to format time
const formatTime = (time: number) => {
  return time < 10 ? `0${time}` : time;
};

// Color constants for charts
const CHART_COLORS = {
  contributed: '#4ade80',
  pending: '#f87171',
  approved: '#60a5fa',
  repaid: '#34d399',
  defaulted: '#f97316',
  active: '#a78bfa',
  funds: '#38bdf8',
  timeline: '#c084fc'
};

const Dashboard = () => {
  // ... existing state and hooks ... (keep all existing useState and useEffect)

  // Prepare chart data
  const getChartData = () => {
    if (!chain) return { memberData: [], loanData: [], timelineData: [] };

    // Member contribution data
    const memberData = chain.members.map(member => ({
      name: member.name,
      contribution: member.contributionAmount,
      contributed: member.contributed ? 'Yes' : 'No'
    }));

    // Loan status data
    const loanStatusCount = {
      pending: 0,
      approved: 0,
      repaid: 0,
      defaulted: 0
    };
    
    chain.loans.forEach(loan => {
      loanStatusCount[loan.status]++;
    });
    
    const loanData = Object.entries(loanStatusCount).map(([name, value]) => ({
      name,
      value
    }));

    // Timeline data
    const timelineData = [];
    const start = new Date(chain.startDate);
    
    for (let i = 0; i < chain.totalRounds; i++) {
      const roundStart = new Date(start);
      roundStart.setDate(start.getDate() + (i * chain.roundDuration));
      
      const roundEnd = new Date(roundStart);
      roundEnd.setDate(roundStart.getDate() + chain.roundDuration);
      
      timelineData.push({
        round: i + 1,
        start: roundStart.toISOString().split('T')[0],
        end: roundEnd.toISOString().split('T')[0],
        status: i < chain.currentRound ? 'completed' : 
                i === chain.currentRound ? 'current' : 'upcoming'
      });
    }

    return { memberData, loanData, timelineData };
  };

  const { memberData, loanData, timelineData } = getChartData();

  // ... rest of existing code (handleRequestLoan, handlePayContribution, etc.) ...

  if (!chain) return <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">Loading dashboard...</div>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header (unchanged) */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
        {/* ... existing header code ... */}
      </header>
      
      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Chain Info Header (unchanged) */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          {/* ... existing chain info ... */}
        </div>
        
        {/* Stats and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Funds Progress Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Funds Progress</h3>
            <div className="space-y-4">
              {/* Contribution Progress Bar (unchanged) */}
              <div>
                {/* ... progress bar code ... */}
              </div>
              
              {/* Members Contributed - Enhanced with Pie Chart */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Members Contributed</span>
                  <span className="font-medium">{contributedMembers}/{chain.members.length}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-1/2">
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Contributed', value: contributedMembers },
                            { name: 'Pending', value: chain.members.length - contributedMembers }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill={CHART_COLORS.contributed} />
                          <Cell fill={CHART_COLORS.pending} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="w-1/2 pl-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Contributed: {contributedMembers}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">Pending: {chain.members.length - contributedMembers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Your Position Card (unchanged) */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* ... existing your position code ... */}
          </div>
          
          {/* Quick Actions Card (unchanged) */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* ... existing quick actions code ... */}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Tab Navigation (unchanged) */}
          <div className="border-b border-gray-200">
            {/* ... tab navigation buttons ... */}
          </div>
          
          <div className="p-6">
            {/* Overview Tab - Enhanced with Charts */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Group Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Activity (unchanged) */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Recent Activity</h4>
                    {/* ... recent activity code ... */}
                  </div>
                  
                  {/* Rotation Schedule - Enhanced with Timeline Visualization */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Rotation Schedule</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={timelineData}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, chain.totalRounds]} />
                          <YAxis dataKey="round" type="category" />
                          <Tooltip />
                          <Bar dataKey="status" barSize={30}>
                            {timelineData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.status === 'completed' ? CHART_COLORS.contributed : 
                                  entry.status === 'current' ? CHART_COLORS.active : 
                                  CHART_COLORS.timeline
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* New Chart Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Financial Analytics</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Member Contributions Chart */}
                    <div className="bg-white rounded-xl shadow p-4">
                      <h4 className="font-semibold text-lg text-gray-800 mb-4">Member Contributions</h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={memberData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="contribution" name="Contribution Amount">
                              {memberData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.contributed === 'Yes' ? CHART_COLORS.contributed : CHART_COLORS.pending} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Loan Status Chart */}
                    <div className="bg-white rounded-xl shadow p-4">
                      <h4 className="font-semibold text-lg text-gray-800 mb-4">Loan Status Distribution</h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={loanData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {loanData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={
                                    entry.name === 'pending' ? CHART_COLORS.pending :
                                    entry.name === 'approved' ? CHART_COLORS.approved :
                                    entry.name === 'repaid' ? CHART_COLORS.repaid :
                                    CHART_COLORS.defaulted
                                  } 
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loans Tab - Enhanced with Fund Flow Chart */}
            {activeTab === 'loans' && (
              <div>
                {/* ... existing loan management header ... */}
                
                <div className="space-y-6">
                  {/* Loan Request Form (unchanged) */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                    {/* ... loan request form ... */}
                  </div>
                  
                  {/* Active Loans - Enhanced with Fund Flow Visualization */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Active Loans</h4>
                    {chain.loans.filter(loan => loan.status !== 'repaid' && loan.status !== 'defaulted').length > 0 ? (
                      <div className="space-y-6">
                        {chain.loans.map(loan => {
                          if (loan.status === 'repaid' || loan.status === 'defaulted') return null;
                          
                          const borrower = chain.members.find(m => m.id === loan.borrowerId);
                          const lender = chain.members.find(m => m.id === loan.lenderId);
                          
                          return (
                            <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                {/* ... loan details ... */}
                              </div>
                              
                              {/* Fund Flow Visualization */}
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8 mr-2" />
                                    <span>{lender?.name || 'Available Lender'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span>{borrower?.name}</span>
                                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8 ml-2" />
                                  </div>
                                </div>
                                
                                <div className="relative pt-4">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 border-dashed"></div>
                                  </div>
                                  <div className="relative flex justify-between">
                                    <div className="bg-white pr-4">
                                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <span className="text-white text-xs">L</span>
                                      </div>
                                    </div>
                                    <div className="bg-white px-4">
                                      <motion.div
                                        animate={{ x: [0, 20, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                                      >
                                        <span className="text-white text-xs">$</span>
                                      </motion.div>
                                    </div>
                                    <div className="bg-white pl-4">
                                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                        <span className="text-white text-xs">B</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-center mt-2 text-sm text-gray-500">
                                  {loan.amount} {chain.currency} transfer
                                </div>
                              </div>
                              
                              {/* ... action buttons ... */}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">No active loans in your group</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Loan History (unchanged) */}
                  <div>
                    {/* ... loan history table ... */}
                  </div>
                </div>
              </div>
            )}
            
            {/* Members Tab - Enhanced with Contribution Visualization */}
            {activeTab === 'members' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Group Members</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chain.members.map(member => (
                    <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        <div className="ml-4 flex-1">
                          {/* ... member details ... */}
                          
                          {/* Contribution Visualization */}
                          <div className="mt-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Contribution</span>
                              <span className="text-sm font-medium">
                                {member.contributionAmount} {chain.currency}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  member.contributed ? 'bg-green-500' : 'bg-red-500'
                                }`} 
                                style={{ width: member.contributed ? '100%' : '30%' }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Loan Activity Visualization */}
                          {member.loans.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs text-gray-500 uppercase mb-2">Loan Activity</p>
                              <div className="flex space-x-2">
                                {member.loans.slice(0, 4).map(loan => (
                                  <div 
                                    key={loan.id}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                      loan.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                      loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                      loan.status === 'repaid' ? 'bg-green-100 text-green-800' :
                                      'bg-red-100 text-red-800'
                                    }`}
                                    title={`${loan.status} ${loan.amount} ${chain.currency}`}
                                  >
                                    ${loan.amount}
                                  </div>
                                ))}
                                {member.loans.length > 4 && (
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                    +{member.loans.length - 4}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Settings Tab (unchanged) */}
            {activeTab === 'settings' && (
              <div>
                {/* ... settings code ... */}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* ... payment modal and footer ... */}
    </div>
  );
};

export default Dashboard;