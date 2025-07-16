// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
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

// Payment providers
const PAYMENT_PROVIDERS = [
  { id: 'paypal', name: 'PayPal', icon: '🔵' },
  { id: 'stripe', name: 'Stripe', icon: '💳' },
  { id: 'coinbase', name: 'Coinbase', icon: '🟡' },
  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
  { id: 'trustwallet', name: 'Trust Wallet', icon: '🔶' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [chain, setChain] = useState<Chain | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'members' | 'settings'>('overview');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanDuration, setLoanDuration] = useState<number>(30);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paypal'>('wallet');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [roundTimeRemaining, setRoundTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [seasonTimeRemaining, setSeasonTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Initialize and update current time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateDateTime();
    const dateTimeInterval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(dateTimeInterval);
  }, []);

  // Mock data initialization
  useEffect(() => {
    const mockChain: Chain = {
      id: 'chain-12345',
      name: 'Crypto Investors Group',
      type: 'social',
      totalRounds: 12,
      currentRound: 3,
      roundDuration: 30,
      startDate: '2023-10-01',
      totalFunds: 12000,
      currentFunds: 8500,
      currency: 'USDC',
      interestRate: 5,
      members: [
        { id: 'm1', name: 'Alex Johnson', walletAddress: '0x742d35Cc...', contributed: true, contributionAmount: 1000, isLender: true, loans: [] },
        { id: 'm2', name: 'Maria Garcia', walletAddress: '0xab5801a7...', contributed: true, contributionAmount: 1000, isLender: false, loans: [] },
        { id: 'm3', name: 'James Smith', walletAddress: '0x4bb53b92...', contributed: false, contributionAmount: 1000, isLender: true, loans: [] },
        { id: 'm4', name: 'Sarah Williams', walletAddress: '0xda9b1a6c...', contributed: true, contributionAmount: 1000, isLender: false, loans: [] },
        { id: 'm5', name: 'Robert Brown', walletAddress: '0x184f4d2a...', contributed: true, contributionAmount: 1000, isLender: true, loans: [] },
      ],
      loans: [
        { 
          id: 'loan-001', 
          borrowerId: 'm2', 
          lenderId: 'm1', 
          amount: 500, 
          interestRate: 5, 
          status: 'approved',
          dueDate: '2023-12-15'
        },
        { 
          id: 'loan-002', 
          borrowerId: 'm4', 
          lenderId: 'm3', 
          amount: 800, 
          interestRate: 5, 
          status: 'pending',
          dueDate: '2023-12-20'
        }
      ]
    };
    
    // Connect loans to members
    mockChain.loans.forEach(loan => {
      const borrower = mockChain.members.find(m => m.id === loan.borrowerId);
      const lender = mockChain.members.find(m => m.id === loan.lenderId);
      
      if (borrower) borrower.loans.push(loan);
      if (lender && lender.id !== borrower?.id) lender.loans.push(loan);
    });
    
    setChain(mockChain);
  }, []);

  // Calculate and update time remaining
  useEffect(() => {
    if (!chain) return;
    
    const updateTimeRemaining = () => {
      const start = new Date(chain.startDate);
      const now = new Date();
      
      // Calculate round end time (current round start + round duration)
      const roundStart = new Date(start);
      roundStart.setDate(start.getDate() + ((chain.currentRound - 1) * chain.roundDuration));
      
      const roundEnd = new Date(roundStart);
      roundEnd.setDate(roundStart.getDate() + chain.roundDuration);
      
      // Calculate season end time (start + total rounds * duration)
      const seasonEnd = new Date(start);
      seasonEnd.setDate(start.getDate() + (chain.totalRounds * chain.roundDuration));
      
      // Calculate differences
      const roundDiff = roundEnd.getTime() - now.getTime();
      const seasonDiff = seasonEnd.getTime() - now.getTime();
      
      // Calculate round time remaining
      const roundDays = Math.floor(roundDiff / (1000 * 60 * 60 * 24));
      const roundHours = Math.floor((roundDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const roundMinutes = Math.floor((roundDiff % (1000 * 60 * 60)) / (1000 * 60));
      const roundSeconds = Math.floor((roundDiff % (1000 * 60)) / 1000);
      
      // Calculate season time remaining
      const seasonDays = Math.floor(seasonDiff / (1000 * 60 * 60 * 24));
      const seasonHours = Math.floor((seasonDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const seasonMinutes = Math.floor((seasonDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seasonSeconds = Math.floor((seasonDiff % (1000 * 60)) / 1000);
      
      setRoundTimeRemaining({
        days: roundDays,
        hours: roundHours,
        minutes: roundMinutes,
        seconds: roundSeconds
      });
      
      setSeasonTimeRemaining({
        days: seasonDays,
        hours: seasonHours,
        minutes: seasonMinutes,
        seconds: seasonSeconds
      });
    };
    
    updateTimeRemaining();
    const timerInterval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(timerInterval);
  }, [chain]);

  // Calculate contribution progress
  const contributionProgress = chain 
    ? (chain.currentFunds / chain.totalFunds) * 100 
    : 0;
  
  const contributedMembers = chain 
    ? chain.members.filter(m => m.contributed).length 
    : 0;

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
  
  // Handle wallet connection
  const handleConnectWallet = () => {
    if (!isWalletConnected) {
      // In a real app, this would trigger wallet connection flow
      const mockAddress = '0x742d35Cc6634C893292...';
      setWalletAddress(mockAddress);
      setIsWalletConnected(true);
      alert('Wallet connected successfully!');
    } else {
      setIsWalletConnected(false);
      setWalletAddress('');
      alert('Wallet disconnected');
    }
  };

  // Handle payment processing
  const handlePaymentProcessing = (provider: string) => {
    setIsProcessingPayment(true);
    setSelectedPaymentProvider(provider);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      // Reset success after 3 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
        handleCompletePayment();
      }, 3000);
    }, 2000);
  };
  
  const handleRequestLoan = () => {
    if (!loanAmount) return;
    // In real app, this would create a loan request
    alert(`Loan request for ${loanAmount} ${chain?.currency} submitted to the group!`);
    setLoanAmount('');
  };
  
  const handlePayContribution = () => {
    if (!chain) return;
    setPaymentAmount(chain.members[0].contributionAmount);
    setIsPaymentModalOpen(true);
  };
  
  const handleCompletePayment = () => {
    // In real app, this would process payment
    setIsPaymentModalOpen(false);
    
    // Update chain state
    if (chain) {
      const updatedMembers = [...chain.members];
      updatedMembers[0].contributed = true;
      
      setChain({
        ...chain,
        currentFunds: chain.currentFunds + updatedMembers[0].contributionAmount,
        members: updatedMembers
      });
    }
  };
  
  if (!chain) return <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">Loading dashboard...</div>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">RotateChain</h1>
              <p className="text-indigo-200 mt-1">Rotational Savings & Trading Platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-indigo-200">{currentDateTime}</div>
                {isWalletConnected && (
                  <div className="text-xs text-indigo-300 truncate max-w-xs mt-1" title={walletAddress}>
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </div>
                )}
              </div>
              <button 
                onClick={handleConnectWallet}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isWalletConnected
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-indigo-700 hover:bg-indigo-800'
                }`}
              >
                {isWalletConnected ? 'Connected' : 'Connect Wallet'}
              </button>
              <button 
                className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition-colors"
                onClick={() => navigate('/')}
              >
                Back to Groups
              </button>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* Left Content Area */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          {/* Chain Info Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{chain.name}</h2>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    chain.type === 'social' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {chain.type === 'social' ? 'SocialChain' : 'GlobalChain'}
                  </span>
                  <span className="ml-3 text-gray-600">
                    Round {chain.currentRound} of {chain.totalRounds}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <p className="text-sm text-indigo-700 font-medium">Current Round Ends In</p>
                  <p className="text-xl font-bold text-indigo-900">
                    {roundTimeRemaining.days}d {roundTimeRemaining.hours}h {roundTimeRemaining.minutes}m {roundTimeRemaining.seconds}s
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-purple-700 font-medium">Season Ends In</p>
                  <p className="text-xl font-bold text-purple-900">
                    {seasonTimeRemaining.days}d {seasonTimeRemaining.hours}h {seasonTimeRemaining.minutes}m {seasonTimeRemaining.seconds}s
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Funds Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Current Funds</span>
                    <span className="font-medium">{chain.currentFunds} {chain.currency}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <motion.div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${contributionProgress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {contributionProgress.toFixed(1)}% of {chain.totalFunds} {chain.currency}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Members Contributed</span>
                    <span className="font-medium">{contributedMembers}/{chain.members.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full" 
                      style={{ width: `${(contributedMembers / chain.members.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Position</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-sm text-indigo-700 font-medium">Your Next Rotation</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">Round {chain.currentRound + 4}</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Estimated payout: {chain.members[0].contributionAmount * 1.05} {chain.currency}
                  </p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-gray-600">Your Contribution</p>
                    <p className="font-bold text-lg">{chain.members[0].contributionAmount} {chain.currency}</p>
                  </div>
                  <button 
                    onClick={handlePayContribution}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      chain.members[0].contributed 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                    }`}
                    disabled={chain.members[0].contributed}
                  >
                    {chain.members[0].contributed ? 'Paid' : 'Pay Now'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  onClick={() => setActiveTab('loans')}
                >
                  Request Loan
                </button>
                
                <button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Invite Members
                </button>
                
                <button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  onClick={() => setActiveTab('settings')}
                >
                  Group Settings
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {(['overview', 'loans', 'members', 'settings'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`py-4 px-6 text-center font-medium text-sm ${
                      activeTab === tab
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Group Overview</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Recent Activity</h4>
                      <div className="space-y-4">
                        {chain.loans.slice(0, 3).map(loan => {
                          const borrower = chain.members.find(m => m.id === loan.borrowerId);
                          const lender = chain.members.find(m => m.id === loan.lenderId);
                          
                          return (
                            <div key={loan.id} className="border border-gray-200 rounded-xl p-4">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">
                                    {borrower?.name} requested a loan of {loan.amount} {chain.currency}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Interest: {loan.interestRate}% • Due: {new Date(loan.dueDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  loan.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                  loan.status === 'repaid' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {loan.status}
                                </span>
                              </div>
                              {lender && loan.status !== 'pending' && (
                                <p className="text-sm text-gray-600 mt-2">
                                  Lender: {lender.name}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Rotation Schedule</h4>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="relative pt-4">
                          {[...Array(chain.totalRounds)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`flex items-center pb-8 ${
                                i < chain.totalRounds - 1 ? 'border-l-2 border-gray-300 border-dashed' : ''
                              } pl-6 relative`}
                            >
                              <div className={`absolute -left-1.5 w-6 h-6 rounded-full flex items-center justify-center ${
                                i < chain.currentRound 
                                  ? 'bg-green-500 text-white' 
                                  : i === chain.currentRound
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300'
                              }`}>
                                {i + 1}
                              </div>
                              <div className="ml-4">
                                <p className="font-medium">
                                  Round {i + 1} {i < chain.currentRound ? '(Completed)' : i === chain.currentRound ? '(Current)' : ''}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {i === chain.currentRound ? `Ends in ${roundTimeRemaining.days} days` : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loans Tab */}
              {activeTab === 'loans' && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Loan Management</h3>
                    <button 
                      className="mt-4 md:mt-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90"
                    >
                      Request New Loan
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Loan Request Form */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                      <h4 className="font-semibold text-indigo-800 mb-4">Request a Loan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">Amount ({chain.currency})</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            placeholder="e.g. 500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">Duration (days)</label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={loanDuration}
                            onChange={(e) => setLoanDuration(Number(e.target.value))}
                          >
                            <option value={15}>15 days</option>
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">Interest Rate</label>
                          <div className="flex items-center">
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              value={`${chain.interestRate}%`}
                              readOnly
                            />
                            <span className="ml-2 text-sm text-gray-500">Fixed</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRequestLoan}
                        className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
                      >
                        Submit Loan Request
                      </button>
                    </div>
                    
                    {/* Active Loans */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-4">Active Loans</h4>
                      {chain.loans.filter(loan => loan.status !== 'repaid' && loan.status !== 'defaulted').length > 0 ? (
                        <div className="space-y-4">
                          {chain.loans.map(loan => {
                            if (loan.status === 'repaid' || loan.status === 'defaulted') return null;
                            
                            const borrower = chain.members.find(m => m.id === loan.borrowerId);
                            const lender = chain.members.find(m => m.id === loan.lenderId);
                            
                            return (
                              <div key={loan.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">
                                      {borrower?.name} borrowed {loan.amount} {chain.currency}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Interest: {loan.interestRate}% • Due: {new Date(loan.dueDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    loan.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {loan.status}
                                  </span>
                                </div>
                                
                                {lender && loan.status !== 'pending' && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    Lender: {lender.name}
                                  </p>
                                )}
                                
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
                                
                                {loan.borrowerId === chain.members[0].id && loan.status === 'approved' && (
                                  <div className="mt-4 flex justify-end">
                                    <button className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                                      Repay Loan
                                    </button>
                                  </div>
                                )}
                                
                                {loan.status === 'pending' && loan.lenderId !== chain.members[0].id && (
                                  <div className="mt-4 flex space-x-3 justify-end">
                                    <button className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                                      Decline
                                    </button>
                                    <button className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                                      Approve & Fund
                                    </button>
                                  </div>
                                )}
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
                    
                    {/* Loan History */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-4">Loan History</h4>
                      {chain.loans.filter(loan => loan.status === 'repaid' || loan.status === 'defaulted').length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {chain.loans.map(loan => {
                                if (loan.status !== 'repaid' && loan.status !== 'defaulted') return null;
                                
                                const borrower = chain.members.find(m => m.id === loan.borrowerId);
                                const lender = chain.members.find(m => m.id === loan.lenderId);
                                
                                return (
                                  <tr key={loan.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{borrower?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lender?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {loan.amount} {chain.currency}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        loan.status === 'repaid' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {loan.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {loan.repaymentDate 
                                        ? new Date(loan.repaymentDate).toLocaleDateString() 
                                        : new Date(loan.dueDate).toLocaleDateString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-gray-500">No loan history available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Members Tab */}
              {activeTab === 'members' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Group Members</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chain.members.map(member => (
                      <div key={member.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-semibold text-gray-800">{member.name}</h4>
                              {member.isLender && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  Lender
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1 truncate" title={member.walletAddress}>
                              {member.walletAddress}
                            </p>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <span className={`text-sm ${
                                member.contributed 
                                  ? 'text-green-600' 
                                  : 'text-amber-600'
                              }`}>
                                {member.contributed ? 'Contributed' : 'Pending'}
                              </span>
                              <span className="font-medium">
                                {member.contributionAmount} {chain.currency}
                              </span>
                            </div>
                            
                            {/* Contribution Visualization */}
                            <div className="mt-3">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Contribution Status</span>
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
                            
                            {member.loans.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 uppercase mb-1">Loan Activity</p>
                                <div className="flex flex-wrap gap-2">
                                  {member.loans.slice(0, 4).map(loan => (
                                    <div 
                                      key={loan.id}
                                      className={`px-2 py-1 rounded text-xs ${
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
                                    <div className="px-2 py-1 rounded text-xs bg-gray-100">
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
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Group Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Chain Configuration</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">Group Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={chain.name}
                            onChange={(e) => setChain({ ...chain, name: e.target.value })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">Contribution Amount</label>
                          <div className="flex">
                            <input
                              type="number"
                              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              value={chain.members[0].contributionAmount}
                              onChange={(e) => {
                                const updatedMembers = [...chain.members];
                                updatedMembers[0].contributionAmount = Number(e.target.value);
                                setChain({ ...chain, members: updatedMembers });
                              }}
                            />
                            <div className="bg-gray-100 px-4 py-2 border-t border-b border-r border-gray-300 rounded-r-lg">
                              {chain.currency}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">Interest Rate</label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              value={chain.interestRate}
                              onChange={(e) => setChain({ ...chain, interestRate: Number(e.target.value) })}
                            />
                            <span className="ml-2 text-gray-500">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Danger Zone</h4>
                      
                      <div className="space-y-4">
                        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                          <h5 className="font-medium text-red-800">Leave Group</h5>
                          <p className="text-sm text-red-600 mt-1">
                            You will lose access to the group and any funds already contributed
                          </p>
                          <button className="mt-3 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
                            Leave Group
                          </button>
                        </div>
                        
                        {chain.members[0].isLender && (
                          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                            <h5 className="font-medium text-amber-800">Transfer Ownership</h5>
                            <p className="text-sm text-amber-700 mt-1">
                              Transfer admin rights to another group member
                            </p>
                            <select className="mt-2 w-full px-4 py-2 border border-amber-300 rounded-lg bg-white">
                              <option>Select a member</option>
                              {chain.members.slice(1).map(member => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))}
                            </select>
                            <button className="mt-3 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">
                              Transfer Ownership
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Fixed Graph Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Group Analytics</h3>
              
              {/* Funds Summary */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Funds Overview</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Current Funds</span>
                      <span className="text-sm font-medium">{chain.currentFunds} {chain.currency}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" 
                        style={{ width: `${contributionProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Members Contributed</span>
                      <span className="text-sm font-medium">{contributedMembers}/{chain.members.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" 
                        style={{ width: `${(contributedMembers / chain.members.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Member Contributions Chart */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-700 mb-3">Member Contributions</h4>
                <div className="h-64">
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
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Loan Status Distribution</h4>
                <div className="h-64">
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
            
            {/* Rotation Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Rotation Timeline</h3>
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
        </div>
      </main>
      
      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Complete Payment</h3>
                <button 
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setIsProcessingPayment(false);
                    setPaymentSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isProcessingPayment}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Amount Due</span>
                  <span className="font-bold text-lg">{paymentAmount} {chain?.currency}</span>
                </div>
                <p className="text-sm text-gray-500">Round {chain?.currentRound} Contribution</p>
              </div>
              
              {!isProcessingPayment && !paymentSuccess && (
                <>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Select Payment Method</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        className={`border-2 rounded-xl p-4 flex flex-col items-center ${
                          paymentMethod === 'wallet' 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setPaymentMethod('wallet')}
                      >
                        <div className="text-2xl mb-2">💰</div>
                        <span className="font-medium">Crypto Wallet</span>
                      </button>
                      
                      <button
                        className={`border-2 rounded-xl p-4 flex flex-col items-center ${
                          paymentMethod === 'paypal' 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setPaymentMethod('paypal')}
                      >
                        <div className="text-2xl mb-2">🔵</div>
                        <span className="font-medium">PayPal</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Payment Providers */}
                  {paymentMethod === 'paypal' && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">Select Payment Provider</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {PAYMENT_PROVIDERS.map(provider => (
                          <button
                            key={provider.id}
                            className="border border-gray-300 rounded-lg p-3 flex flex-col items-center hover:bg-gray-50 transition-colors"
                            onClick={() => handlePaymentProcessing(provider.id)}
                          >
                            <div className="text-2xl mb-1">{provider.icon}</div>
                            <span className="text-sm">{provider.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Wallet Payment */}
                  {paymentMethod === 'wallet' && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">Connect Wallet</h4>
                      <div className="space-y-3">
                        <button
                          className="w-full flex items-center justify-center border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
                          onClick={() => handlePaymentProcessing('metamask')}
                        >
                          <span className="text-2xl mr-2">🦊</span>
                          <span>Pay with MetaMask</span>
                        </button>
                        <button
                          className="w-full flex items-center justify-center border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
                          onClick={() => handlePaymentProcessing('coinbase')}
                        >
                          <span className="text-2xl mr-2">🟡</span>
                          <span>Pay with Coinbase Wallet</span>
                        </button>
                        {isWalletConnected && (
                          <button
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:opacity-90"
                            onClick={() => handlePaymentProcessing('connected')}
                          >
                            Pay with Connected Wallet
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Payment Processing State */}
              {isProcessingPayment && (
                <div className="flex flex-col items-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-700">Processing payment via {PAYMENT_PROVIDERS.find(p => p.id === selectedPaymentProvider)?.name || 'wallet'}...</p>
                </div>
              )}
              
              {/* Payment Success State */}
              {paymentSuccess && (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 text-center">
                    Your payment of {paymentAmount} {chain?.currency} has been processed
                  </p>
                </div>
              )}
              
              {/* Direct Payment Button */}
              {!isProcessingPayment && !paymentSuccess && paymentMethod === 'wallet' && !selectedPaymentProvider && (
                <button
                  onClick={handleCompletePayment}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 mt-4"
                >
                  Confirm Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} RotateChain. All rights reserved. The future of rotational savings and trading.
      </footer>
    </div>
  );
};

export default Dashboard;