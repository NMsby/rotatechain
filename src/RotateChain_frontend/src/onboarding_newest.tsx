import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define types for our state objects
type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
type Duration = '3 months' | '6 months' | '9 months' | '1 year';
type ChainType = 'social' | 'global' | null;
type JoinStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

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
  const [joinStatus, setJoinStatus] = useState<JoinStatus>('not_started');
  const [isJoining, setIsJoining] = useState<boolean>(false);

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
      
      if (chainType === 'social') {
        setSocialChainInfo(prev => ({ ...prev, inviteLink: link }));
      }
      
      if (chainType === 'global') {
        setGlobalChainInfo(prev => ({ ...prev, inviteLink: link }));
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
    setJoinStatus('not_started');
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
        navigator.clipboard.writeText(inviteLink);
        alert('Link copied to clipboard!');
    }
  };

  // Handle join action
  const handleJoin = () => {
    setIsJoining(true);
    
    // Simulate join process
    setTimeout(() => {
      setIsJoining(false);
      
      if (chainType === 'social') {
        setJoinStatus('approved');
      } else {
        setJoinStatus('pending');
        
        // Simulate admin approval
        setTimeout(() => {
          setJoinStatus('approved');
        }, 2000);
      }
    }, 1500);
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
                  {/* ... (existing SocialChain card content) ... */}
                </motion.div>
                
                {/* GlobalChain Card */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="border-2 border-indigo-200 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-white cursor-pointer transition-all hover:border-purple-400 hover:shadow-lg"
                  onClick={() => handleChainSelect('global')}
                >
                  {/* ... (existing GlobalChain card content) ... */}
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
              {/* ... (existing step 2 form content) ... */}
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
                  
                  {/* Join Section for SocialChain */}
                  <div className="bg-blue-50 p-6 rounded-xl max-w-md mx-auto mb-8">
                    <h3 className="font-medium text-blue-800 mb-3">Join Your SocialChain</h3>
                    
                    {joinStatus === 'not_started' ? (
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          As the creator, you're automatically a member. Invite others to join using the link below.
                        </p>
                        <button 
                          onClick={handleJoin}
                          disabled={isJoining}
                          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium flex items-center justify-center"
                        >
                          {isJoining ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Joining...
                            </>
                          ) : 'Join SocialChain as Member'}
                        </button>
                      </div>
                    ) : joinStatus === 'approved' ? (
                      <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
                        <div className="flex justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-green-800 mb-1">Successfully Joined!</h4>
                        <p className="text-green-700">You're now a member of this SocialChain group.</p>
                      </div>
                    ) : null}
                    
                    <div className="mt-6">
                      <h3 className="font-medium text-blue-800 mb-3">Invite Members</h3>
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 mb-4">
                        <div className="truncate text-sm text-gray-600 mr-2">
                          {inviteLink}
                        </div>
                        <button 
                          onClick={() => shareLink('copy')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <button onClick={() => shareLink('whatsapp')} className="p-2 rounded-full bg-green-100 hover:bg-green-200">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </button>
                        <button onClick={() => shareLink('telegram')} className="p-2 rounded-full bg-blue-100 hover:bg-blue-200">
                          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.14.141-.259.259-.374.264l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.136-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                          </svg>
                        </button>
                        <button onClick={() => shareLink('facebook')} className="p-2 rounded-full bg-blue-100 hover:bg-blue-200">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                          </svg>
                        </button>
                        <button onClick={() => shareLink('gmail')} className="p-2 rounded-full bg-red-100 hover:bg-red-200">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Your GlobalChain <span className="font-semibold text-indigo-600">{globalChainInfo.groupName}</span> has been created for {globalChainInfo.membersCount} members.
                  </p>
                  
                  {/* Join Section for GlobalChain */}
                  <div className="bg-indigo-50 p-6 rounded-xl max-w-md mx-auto mb-8">
                    <h3 className="font-medium text-indigo-800 mb-3">Join Process</h3>
                    
                    {!isVettingComplete ? (
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                        </div>
                        <p className="text-indigo-700">
                          We're verifying members' ability to pay. This usually takes a few seconds.
                        </p>
                      </div>
                    ) : joinStatus === 'not_started' ? (
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          As the creator, you need to apply to join this GlobalChain. Your application will be reviewed by the system.
                        </p>
                        <button 
                          onClick={handleJoin}
                          disabled={isJoining}
                          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium flex items-center justify-center"
                        >
                          {isJoining ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Applying...
                            </>
                          ) : 'Apply to Join GlobalChain'}
                        </button>
                      </div>
                    ) : joinStatus === 'pending' ? (
                      <div className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-200">
                        <div className="flex justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-yellow-800 mb-1">Application Pending</h4>
                        <p className="text-yellow-700">
                          Your application is being reviewed by the system. This usually takes a few seconds.
                        </p>
                      </div>
                    ) : joinStatus === 'approved' ? (
                      <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
                        <div className="flex justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-green-800 mb-1">Application Approved!</h4>
                        <p className="text-green-700">
                          You're now a member of this GlobalChain. Funds will be secured until the end of the season.
                        </p>
                      </div>
                    ) : null}
                    
                    {isVettingComplete && joinStatus !== 'approved' && (
                      <div className="mt-6">
                        <h3 className="font-medium text-indigo-800 mb-3">Share Application Link</h3>
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200 mb-4">
                          <div className="truncate text-sm text-gray-600 mr-2">
                            {inviteLink}
                          </div>
                          <button 
                            onClick={() => shareLink('copy')}
                            className="text-indigo-500 hover:text-indigo-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex justify-center space-x-4">
                          <button onClick={() => shareLink('whatsapp')} className="p-2 rounded-full bg-green-100 hover:bg-green-200">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                          <button onClick={() => shareLink('telegram')} className="p-2 rounded-full bg-blue-100 hover:bg-blue-200">
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.14.141-.259.259-.374.264l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.136-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                            </svg>
                          </button>
                          <button onClick={() => shareLink('facebook')} className="p-2 rounded-full bg-blue-100 hover:bg-blue-200">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                            </svg>
                          </button>
                          <button onClick={() => shareLink('gmail')} className="p-2 rounded-full bg-red-100 hover:bg-red-200">
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <button className="py-3 px-6 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                  View Dashboard
                </button>
                {chainType === 'social' ? (
                  <button 
                    onClick={() => shareLink('copy')}
                    className="py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium"
                  >
                    Copy Invite Link
                  </button>
                ) : (
                  <button 
                    onClick={() => shareLink('copy')}
                    className="py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium"
                  >
                    Copy Application Link
                  </button>
                )}
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
                <span className="text-gray-700">Members join via invite links</span>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mt-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Immediate group access after joining</span>
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
                <span className="text-gray-700">Members apply to join via application link</span>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-1 mt-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">System vets ability to pay before approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartOnboarding;