import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define types for our state objects
type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
type Duration = '3 months' | '6 months' | '9 months' | '1 year';
type ChainType = 'social' | 'global' | null;

interface Member {
  name: string;
  email: string;
  phone: string;
}

interface SocialChainInfo {
  groupName: string;
  contribution: string;
  currency: string;
  frequency: Frequency;
  members: Member[];
  inviteLink?: string;
}

interface GlobalChainInfo {
  groupName: string;
  contribution: string;
  currency: string;
  duration: Duration;
  membersCount: number;
  inviteLink?: string;
}

// Supported currencies and cryptos
const currencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 
  'BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'DAI'
];

// Mock data for existing groups
const mockGroups = [
  { id: 1, name: "Family Savings Group", members: 8, contribution: "100 USD" },
  { id: 2, name: "Tech Professionals", members: 12, contribution: "200 USDC" },
  { id: 3, name: "Global Crypto Enthusiasts", members: 15, contribution: "0.5 ETH" },
  { id: 4, name: "Student Support Chain", members: 6, contribution: "50 USD" },
];

const SmartOnboarding = () => {
  const [step, setStep] = useState<number>(1);
  const [chainType, setChainType] = useState<ChainType>(null);
  const [socialChainInfo, setSocialChainInfo] = useState<SocialChainInfo>({
    groupName: '',
    contribution: '',
    currency: 'USD',
    frequency: 'weekly',
    members: [{ name: '', email: '', phone: '' }]
  });
  
  const [globalChainInfo, setGlobalChainInfo] = useState<GlobalChainInfo>({
    groupName: '',
    contribution: '',
    currency: 'USD',
    duration: '3 months',
    membersCount: 6
  });

  const [inviteLink, setInviteLink] = useState<string>('');
  const [isVettingComplete, setIsVettingComplete] = useState<boolean>(false);
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [joinChainType, setJoinChainType] = useState<ChainType>(null);
  const [joinOption, setJoinOption] = useState<'link' | 'browse' | null>(null);
  const [inviteLinkInput, setInviteLinkInput] = useState<string>('');

  // Generate invite link when chain is created
  useEffect(() => {
    if (step === 3 && chainType) {
      const generateLink = () => {
        const baseUrl = 'https://chainapp.com/join';
        const chainId = Math.random().toString(36).substring(2, 10);
        return `${baseUrl}/${chainType}/${chainId}`;
      };
      
      const link = generateLink();
      setInviteLink(link);
      
      // For social chains, set invite link immediately
      if (chainType === 'social') {
        setSocialChainInfo(prev => ({ ...prev, inviteLink: link }));
      }
      
      // For global chains, simulate vetting process
      if (chainType === 'global') {
        setGlobalChainInfo(prev => ({ ...prev, inviteLink: link }));
        // Simulate vetting process delay
        const timer = setTimeout(() => {
          setIsVettingComplete(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [step, chainType]);

  const handleChainSelect = (type: ChainType) => {
    setChainType(type);
    setStep(2);
  };

  const addMember = () => {
    setSocialChainInfo({
      ...socialChainInfo,
      members: [...socialChainInfo.members, { name: '', email: '', phone: '' }]
    });
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const updatedMembers = [...socialChainInfo.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    
    setSocialChainInfo({
      ...socialChainInfo,
      members: updatedMembers
    });
  };

  const handleSubmit = () => {
    setStep(3);
    setIsVettingComplete(false);
  };

  // Share functionality
  const shareLink = (platform: string) => {
    const message = `Join my ${chainType === 'social' ? 'SocialChain' : 'GlobalChain'} group: ${inviteLink}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`, '_blank');
        break;
      case 'gmail':
        window.open(`mailto:?subject=Join my chain group&body=${encodeURIComponent(message)}`, '_blank');
        break;
      default:
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(inviteLink);
        alert('Link copied to clipboard!');
    }
  };

  // Handle join flow
  const openJoinFlow = (type: ChainType) => {
    setJoinChainType(type);
    setJoinModalOpen(true);
    if (type === 'social') {
      setJoinOption('link');
    } else {
      setJoinOption(null);
    }
  };

  const handleJoinWithLink = () => {
    if (inviteLinkInput) {
      alert(`Redirecting to ${joinChainType} group...`);
      // In a real app: window.location.href = inviteLinkInput;
      setJoinModalOpen(false);
      setInviteLinkInput('');
    } else {
      alert("Please enter a valid invite link");
    }
  };

  const handleJoinGroup = (groupId: number) => {
    alert(`Joining group: ${mockGroups.find(g => g.id === groupId)?.name}`);
    // In a real app: redirect to group page or show join confirmation
    setJoinModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <motion.div 
            className="h-full bg-cyan-500"
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="p-6 md:p-10">
          {/* Step 1: Chain Type Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create or Join a Chain</h2>
              <p className="text-gray-600 text-center mb-8 max-w-md mx-auto">
                Select the chain type that best fits your group's relationship
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* SocialChain Card */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-white transition-all hover:border-cyan-400 hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">TRUSTED GROUP</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">SocialChain</h3>
                  <p className="text-gray-600 mb-4">
                    For groups where members know each other personally and can arrange offline solutions for defaults.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-1 mt-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Members know each other personally</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-1 mt-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Rotational funds distribution</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-1 mt-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Offline default resolution</span>
                    </li>
                  </ul>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => handleChainSelect('social')}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Create SocialChain
                    </button>
                    <button 
                      onClick={() => openJoinFlow('social')}
                      className="w-full py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Join Existing Group
                    </button>
                  </div>
                </motion.div>
                
                {/* GlobalChain Card */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="border-2 border-indigo-200 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-white transition-all hover:border-purple-400 hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">GLOBAL MEMBERS</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">GlobalChain</h3>
                  <p className="text-gray-600 mb-4">
                    For groups where members are unfamiliar. Funds are secured until the end of the chain season.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <div className="bg-purple-100 rounded-full p-1 mt-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Members are anonymous/unfamiliar</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-100 rounded-full p-1 mt-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Liquid tokens during rotation</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-100 rounded-full p-1 mt-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Funds released at season end</span>
                    </li>
                  </ul>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => handleChainSelect('global')}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Create GlobalChain
                    </button>
                    <button 
                      onClick={() => openJoinFlow('global')}
                      className="w-full py-3 bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Join Existing Group
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Form based on chain type */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setStep(1)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-800 ml-4">
                  Create Your {chainType === 'social' ? 'SocialChain' : 'GlobalChain'}
                </h2>
              </div>
              
              {/* ... rest of step 2 remains unchanged ... */}
            </motion.div>
          )}
          
          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-10"
            >
              {/* ... rest of step 3 remains unchanged ... */}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Join Group Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {joinChainType === 'social' ? 'Join SocialChain' : 'Join GlobalChain'}
                </h3>
                <button 
                  onClick={() => {
                    setJoinModalOpen(false);
                    setJoinOption(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* SocialChain Join Flow */}
              {joinChainType === 'social' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Enter the invite link provided by the group admin to join an existing SocialChain.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 font-medium">Invite Link</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://chainapp.com/join/social/abc123"
                      value={inviteLinkInput}
                      onChange={(e) => setInviteLinkInput(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleJoinWithLink}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold mt-4 hover:opacity-90 transition-opacity"
                  >
                    Join Group
                  </button>
                </div>
              )}
              
              {/* GlobalChain Join Flow */}
              {joinChainType === 'global' && (
                <div>
                  {joinOption === null ? (
                    <div className="space-y-6">
                      <p className="text-gray-600">
                        Choose how you want to join an existing GlobalChain group:
                      </p>
                      
                      <div className="space-y-4">
                        <div 
                          className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors"
                          onClick={() => setJoinOption('link')}
                        >
                          <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">Use Invite Link</h4>
                              <p className="text-gray-600 text-sm">Join with a direct link provided by a group member</p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors"
                          onClick={() => setJoinOption('browse')}
                        >
                          <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">Browse Groups</h4>
                              <p className="text-gray-600 text-sm">Explore and join public GlobalChain groups</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : joinOption === 'link' ? (
                    <div className="space-y-4">
                      <div className="flex items-center mb-2">
                        <button 
                          onClick={() => setJoinOption(null)}
                          className="text-gray-500 hover:text-gray-700 mr-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </button>
                        <h4 className="font-semibold text-gray-800">Join with Invite Link</h4>
                      </div>
                      
                      <p className="text-gray-600">
                        Enter the invite link provided by the group admin to join an existing GlobalChain.
                      </p>
                      <div className="flex flex-col gap-2">
                        <label className="text-gray-700 font-medium">Invite Link</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://chainapp.com/join/global/xyz789"
                          value={inviteLinkInput}
                          onChange={(e) => setInviteLinkInput(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={handleJoinWithLink}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold mt-4 hover:opacity-90 transition-opacity"
                      >
                        Join Group
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center mb-4">
                        <button 
                          onClick={() => setJoinOption(null)}
                          className="text-gray-500 hover:text-gray-700 mr-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </button>
                        <h4 className="font-semibold text-gray-800">Browse Public Groups</h4>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        Explore and join public GlobalChain groups. These groups are open for anyone to join.
                      </p>
                      
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {mockGroups.map(group => (
                          <div key={group.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-gray-800">{group.name}</h5>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{group.members} members</span>
                                </div>
                              </div>
                              <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded">
                                {group.contribution}
                              </div>
                            </div>
                            <button
                              onClick={() => handleJoinGroup(group.id)}
                              className="w-full mt-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                              Join Group
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* ... rest of the component (Info Section) remains unchanged ... */}
    </div>
  );
};

export default SmartOnboarding;