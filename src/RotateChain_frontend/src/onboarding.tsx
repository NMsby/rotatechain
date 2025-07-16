import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define types for our state objects
type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
type Duration = '3 months' | '6 months' | '9 months' | '1 year';
type ChainType = 'social' | 'global' | null;

interface Member {
  name: string;
  contact: string;
}

interface SocialChainInfo {
  groupName: string;
  contribution: string;
  frequency: Frequency;
  members: Member[];
}

interface GlobalChainInfo {
  groupName: string;
  contribution: string;
  duration: Duration;
  membersCount: number;
}

const SmartOnboarding = () => {
  const [step, setStep] = useState<number>(1);
  const [chainType, setChainType] = useState<ChainType>(null);
  const [socialChainInfo, setSocialChainInfo] = useState<SocialChainInfo>({
    groupName: '',
    contribution: '',
    frequency: 'weekly',
    members: [{ name: '', contact: '' }]
  });
  
  const [globalChainInfo, setGlobalChainInfo] = useState<GlobalChainInfo>({
    groupName: '',
    contribution: '',
    duration: '3 months',
    membersCount: 6
  });

  const handleChainSelect = (type: ChainType) => {
    setChainType(type);
    setStep(2);
  };

  const addMember = () => {
    setSocialChainInfo({
      ...socialChainInfo,
      members: [...socialChainInfo.members, { name: '', contact: '' }]
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
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Your Chain</h2>
              <p className="text-gray-600 text-center mb-8 max-w-md mx-auto">
                Select the chain type that best fits your group's relationship
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* SocialChain Card */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-white cursor-pointer transition-all hover:border-cyan-400 hover:shadow-lg"
                  onClick={() => handleChainSelect('social')}
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
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Create SocialChain
                  </button>
                </motion.div>
                
                {/* GlobalChain Card */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="border-2 border-indigo-200 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-white cursor-pointer transition-all hover:border-purple-400 hover:shadow-lg"
                  onClick={() => handleChainSelect('global')}
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
                  <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Create GlobalChain
                  </button>
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
              
              {chainType === 'social' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Group Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Family Savings Group"
                        value={socialChainInfo.groupName}
                        onChange={(e) => setSocialChainInfo({...socialChainInfo, groupName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Contribution Amount</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. 100"
                          value={socialChainInfo.contribution}
                          onChange={(e) => setSocialChainInfo({...socialChainInfo, contribution: e.target.value})}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <span className="text-gray-500">USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Contribution Frequency</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['weekly', 'bi-weekly', 'monthly', 'quarterly'] as Frequency[]).map((freq) => (
                        <button
                          key={freq}
                          className={`py-3 px-4 rounded-lg border transition-colors ${
                            socialChainInfo.frequency === freq
                              ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => setSocialChainInfo({...socialChainInfo, frequency: freq})}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-700 font-medium">Group Members</label>
                      <button 
                        onClick={addMember}
                        className="text-sm text-blue-500 font-medium hover:text-blue-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Member
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Add at least 3 members including yourself</p>
                    
                    <div className="space-y-4">
                      {socialChainInfo.members.map((member, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 text-sm mb-1">Member {index + 1} Name</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              placeholder="Full name"
                              value={member.name}
                              onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm mb-1">Contact Info</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              placeholder="Email or phone"
                              value={member.contact}
                              onChange={(e) => handleMemberChange(index, 'contact', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={handleSubmit}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                    >
                      Create SocialChain
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Group Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Global Savings #1"
                        value={globalChainInfo.groupName}
                        onChange={(e) => setGlobalChainInfo({...globalChainInfo, groupName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Contribution Amount</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g. 100"
                          value={globalChainInfo.contribution}
                          onChange={(e) => setGlobalChainInfo({...globalChainInfo, contribution: e.target.value})}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <span className="text-gray-500">USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Chain Duration</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['3 months', '6 months', '9 months', '1 year'] as Duration[]).map((duration) => (
                          <button
                            key={duration}
                            className={`py-3 px-4 rounded-lg border transition-colors ${
                              globalChainInfo.duration === duration
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-600 font-medium'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => setGlobalChainInfo({...globalChainInfo, duration})}
                          >
                            {duration}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Number of Members</label>
                      <div className="flex items-center">
                        <button 
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                          onClick={() => setGlobalChainInfo({...globalChainInfo, membersCount: Math.max(3, globalChainInfo.membersCount - 1)})}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="mx-4 text-xl font-medium">{globalChainInfo.membersCount}</div>
                        <button 
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                          onClick={() => setGlobalChainInfo({...globalChainInfo, membersCount: globalChainInfo.membersCount + 1})}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Minimum 3 members, maximum 12 members</p>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-indigo-700">
                          <span className="font-medium">How GlobalChains work:</span> Your funds will be secured in a smart contract. 
                          During your rotation, you'll receive liquid tokens equivalent to your contribution. 
                          At the end of the chain season, all members will receive their funds simultaneously.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={handleSubmit}
                      className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                    >
                      Create GlobalChain
                    </button>
                  </div>
                </div>
              )}
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
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {chainType === 'social' ? 'SocialChain' : 'GlobalChain'} Created!
              </h2>
              
              {chainType === 'social' ? (
                <div>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Your SocialChain <span className="font-semibold text-blue-600">{socialChainInfo.groupName}</span> has been created with {socialChainInfo.members.length} members.
                  </p>
                  <div className="bg-blue-50 p-6 rounded-xl max-w-md mx-auto mb-8">
                    <h3 className="font-medium text-blue-800 mb-3">Next Steps:</h3>
                    <ul className="space-y-2 text-left text-gray-700">
                      <li className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mt-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Invitations sent to all members</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mt-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>First contribution due in 3 days</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mt-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Alice will receive the first rotation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Your GlobalChain <span className="font-semibold text-indigo-600">{globalChainInfo.groupName}</span> has been created with {globalChainInfo.membersCount} members.
                  </p>
                  <div className="bg-indigo-50 p-6 rounded-xl max-w-md mx-auto mb-8">
                    <h3 className="font-medium text-indigo-800 mb-3">Security Features:</h3>
                    <ul className="space-y-2 text-left text-gray-700">
                      <li className="flex items-start">
                        <div className="bg-indigo-100 rounded-full p-1 mt-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Funds secured in smart contract</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-indigo-100 rounded-full p-1 mt-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Liquid tokens issued during your rotation</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-indigo-100 rounded-full p-1 mt-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Full funds released on {globalChainInfo.duration}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <button className="py-3 px-6 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                  View Dashboard
                </button>
                <button className="py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium">
                  Invite Members
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Info Section */}
      <div className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Understanding Chain Types</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-blue-200 rounded-xl p-5">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">SocialChain</h4>
            </div>
            <p className="text-gray-600 mb-4">
              Ideal for friends, family, or colleagues who know each other personally. Members can resolve payment defaults through personal arrangements.
            </p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mt-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Members know each other personally</span>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mt-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Rotational funds distribution</span>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mt-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Offline default resolution</span>
              </div>
            </div>
          </div>
          
          <div className="border border-indigo-200 rounded-xl p-5">
            <div className="flex items-center mb-3">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">GlobalChain</h4>
            </div>
            <p className="text-gray-600 mb-4">
              For global participants who don't know each other. Funds are secured until the end of the chain season, with liquid tokens issued during rotations.
            </p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-1 mt-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Members are anonymous/unfamiliar</span>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-1 mt-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Liquid tokens during rotation</span>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-1 mt-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Funds released at season end</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartOnboarding;