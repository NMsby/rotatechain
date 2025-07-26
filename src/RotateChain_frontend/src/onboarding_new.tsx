import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from './notificationContext';
import { AuthClient } from '@dfinity/auth-client';
import { Actor } from '@dfinity/agent';
import { Chain } from './rotate_dashboard_graph_payment';

// Define types for our state objects
export type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
type Duration = '3 months' | '6 months' | '9 months' | '1 year';
export type ChainType = 'social' | 'global' | null;
type JoinStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

interface Member {
  userName: string;
  email: string;
  phone: string;
}

interface SocialChainInfo {
  groupName: string;
  contribution: string;
  currency: string;
  frequency: Frequency;
  members: Member[];
  // interest rate
  loanInterest: number;
  // fine rate
  fine:number;
  inviteLink?: string;
}

interface GlobalChainInfo {
  groupName: string;
  contribution: string;
  customFrequency?:number;
  currency: string;
  frequency: Frequency;
  members: Member[];
  // interest rate
  loanInterest: number;
  // fine rate
  fine:number;
  inviteLink?: string;
}

// Supported currencies and cryptos
const currencies = [
  'ICP','USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 
  'BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'DAI'
];

const mockGroups = [
  { id: 1, name: "Family Savings Group", members: 8, contribution: "100 USD" },
  { id: 2, name: "Tech Professionals", members: 12, contribution: "200 USDC" },
  { id: 3, name: "Crypto Investors Group", members: 5, contribution: "10000 ICP" },
  { id: 4, name: "Student Support Chain", members: 6, contribution: "50 USD" },
];


const SmartOnboarding = ({chainActor,onLogout,authClient,setChainData}:{setChainData:Dispatch<SetStateAction<Chain | undefined>>,chainActor:Actor | null | undefined,authClient:AuthClient | null,onLogout:() => Promise<void>}) => {
  const [step, setStep] = useState<number>(1);
  const [currentChainId,setCurrentChainId] = useState<string>("")
  const [chainType, setChainType] = useState<ChainType>(null);
  //notification
  const notification = useNotification()
  //navigation
  const navigate = useNavigate()
  const [socialChainInfo, setSocialChainInfo] = useState<SocialChainInfo>({
    groupName: '',
    contribution: '',
    currency: 'ICP',
    frequency: 'weekly',
    fine:5,
    loanInterest:5,
    members: [{userName: '', email: '', phone: '' }]
  });
  
  const [globalChainInfo, setGlobalChainInfo] = useState<GlobalChainInfo>({
    groupName: '',
    contribution: '',
    currency: 'ICP',
    fine:5,
    frequency:'monthly',
    customFrequency:2,
    loanInterest:5,
    members: []
  });

  const [inviteLink, setInviteLink] = useState<string>('');
  const [isVettingComplete, setIsVettingComplete] = useState<boolean>(false);
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [joinStatus, setJoinStatus] = useState<JoinStatus>('not_started');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinChainType, setJoinChainType] = useState<ChainType>(null);
  const [joinOption, setJoinOption] = useState<'link' | 'browse' | null>(null);
  const [inviteLinkInput, setInviteLinkInput] = useState<string>('');
  


  useEffect(function(){
    setCurrentChainId("svvjab374b38784b3hbh")
  },[])

  // Generate invite link when chain is created
  useEffect(() => {
    if (step === 3 && chainType) {
      const generateLink = (currentChainId:string) => {
        //get the chain id that will be used to generate the link

        const baseUrl = window.location.origin

        const chainId = currentChainId
        if(baseUrl.includes("join")){
          return `${baseUrl}/${chainId}`;

        }
        else{
          return `${baseUrl}/join/${chainId}`;
        }
      };
      
      const link = generateLink(currentChainId);
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
    //isLender is a boolean
    //contribution to be in float64 format
    //chainActor.addMember(userId,userName,walletAddress,contribution,isLender)
    setSocialChainInfo({
      ...socialChainInfo,
      members: [...socialChainInfo.members, { userName: '', email: '', phone: '' }]
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
    //create the chain onchain

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
        notification.success('Link copied to clipboard for user-defined sharing');
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
    let actualUrl = ""
    if (inviteLinkInput) {
      if(inviteLink.includes("cai")){
        actualUrl = inviteLinkInput.split(":")[2].split("/")[2]
      }
      else{
        actualUrl = inviteLinkInput.split("//")[1].split("/")[2]

      }

      //first check the chains// if available then if available get the details of a user.

      notification.success(`${joinChainType} group welcomes you`)
      // In a real app: window.location.href = inviteLinkInput;
      setJoinModalOpen(false);

      setInviteLinkInput('');

      navigate(`/join/${actualUrl}`)
    } else {
      notification.error("Please enter a valid invite link")
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    //first check the chains// if available then if available get the details of a user.
    //let chains = await chainActor.getChain()
    
    /*let newChain:Chain = {
      currency:,
      currentFunds:,
      currentRound:,
      fineRate:,
      id:,
      interestRate:,
      loans:,
      members:,
      name:,
      roundDuration:,
      startDate:,
      totalFunds:,
      totalRounds:,
      type:,
      userId:,
      userName:
    }*/
    
    //set chain data 
    //setChainData()

    notification.success(`${mockGroups.find(g => g.id === groupId)?.name} welcomes you`)
    // In a real app: redirect to group page or show join confirmation
    setJoinModalOpen(false);
    //use a general dashboard for the time being
    navigate("/dashboard")
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
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create or join your Chain</h2>
              <p className="text-gray-600 text-center mb-8 max-w-md mx-auto">
                Select the chain type that best fits your group's relationship
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* SocialChain Card */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-white cursor-pointer transition-all hover:border-cyan-400 hover:shadow-lg"
                  onClick={() => {/*handleChainSelect('social')*/}}
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
                  <div className='flex flex-col gap-3'>
                    <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity" onClick={() => handleChainSelect('social')}>
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
                  className="border-2 border-indigo-200 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-white cursor-pointer transition-all hover:border-purple-400 hover:shadow-lg"
                  onClick={() => {/*handleChainSelect('global')*/}}
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
                    <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity" onClick={() => handleChainSelect('global')} >
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
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. 100"
                            value={socialChainInfo.contribution}
                            onChange={(e) => setSocialChainInfo({...socialChainInfo, contribution: e.target.value})}
                          />
                        </div>
                        <div className="w-32">
                          <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={socialChainInfo.currency}
                            onChange={(e) => setSocialChainInfo({...socialChainInfo, currency: e.target.value})}
                          >
                            {currencies.map(currency => (
                              <option key={currency} value={currency}>{currency}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">loan-interest %</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 10"
                        value={socialChainInfo.loanInterest}
                        onChange={(e) => setSocialChainInfo({...socialChainInfo, loanInterest: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">loan-fine %</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 5"
                        value={socialChainInfo.fine}
                        onChange={(e) => setSocialChainInfo({...socialChainInfo, fine: Number(e.target.value)})}
                      />
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
                  
                  {/*<div>
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
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <label className="block text-gray-700 text-sm mb-1">Email</label>
                            <input
                              type="email"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              placeholder="Email address"
                              value={member.email}
                              onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm mb-1">Phone (with country code)</label>
                            <input
                              type="tel"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              placeholder="+1234567890"
                              value={member.phone}
                              onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>*/}
                  
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
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g. 100"
                            value={globalChainInfo.contribution}
                            onChange={(e) => setGlobalChainInfo({...globalChainInfo, contribution: e.target.value})}
                          />
                        </div>
                        <div className="w-32">
                          <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={globalChainInfo.currency}
                            onChange={(e) => setGlobalChainInfo({...globalChainInfo, currency: e.target.value})}
                          >
                            {currencies.map(currency => (
                              <option key={currency} value={currency}>{currency}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">   
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">loan-interest %</label>
                      <input
                        type="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. 10"
                        value={globalChainInfo.loanInterest}
                        onChange={(e) => setGlobalChainInfo({...globalChainInfo, loanInterest: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">fine %</label>
                      <input
                        type="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. 13"
                        value={globalChainInfo.fine}
                        onChange={(e) => setGlobalChainInfo({...globalChainInfo, fine: Number(e.target.value)})}
                      />
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
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-600 font-medium'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => setSocialChainInfo({...socialChainInfo, frequency: freq})}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">custom frequency(d)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. 1 day"
                        value={globalChainInfo.customFrequency}
                        onChange={(e) => setGlobalChainInfo({...globalChainInfo, customFrequency: Number(e.target.value)})}
                      />
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
                          <br /><br />
                          <span className="font-medium">Vetting Process:</span> All joining members will be vetted by our system to verify their ability to pay.
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
                <button 
                  onClick={() => setStep(1)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>

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
                    <h3 className="font-medium text-blue-800 mb-3">Share Invite Link:</h3>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 mb-4">
                      <div className="truncate text-sm text-gray-600 mr-2">
                        {inviteLink}
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(inviteLink)}
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
              ) : (
                <div>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Your GlobalChain <span className="font-semibold text-indigo-600">{globalChainInfo.groupName}</span> has been created for {globalChainInfo.members.length} members.
                  </p>
                  
                  <div className="bg-indigo-50 p-6 rounded-xl max-w-md mx-auto mb-8">
                    {!isVettingComplete ? (
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                        </div>
                        <h3 className="font-medium text-indigo-800 mb-2">Vetting Members</h3>
                        <p className="text-indigo-700 text-sm">
                          We're verifying members' ability to pay. This usually takes a few seconds.
                          Admins will approve members once verification is complete.
                        </p>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-indigo-800 mb-3">Share Group Application Link:</h3>
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200 mb-4">
                          <div className="truncate text-sm text-gray-600 mr-2">
                            {inviteLink}
                          </div>
                          <button 
                            onClick={() => navigator.clipboard.writeText(inviteLink)}
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
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <button className="py-3 px-6 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                  <Link className="w-full h-full text-inherit "  to="/dashboard">
                      View Dashboard
                  </Link>
                </button>
                {chainType === 'social' ? (
                  <button 
                    onClick={() => shareLink('copy')}
                    className="py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium"
                  >
                    Share Invite Link
                  </button>
                ) : (
                  <button 
                    onClick={() => shareLink('copy')}
                    className="py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium"
                  >
                    {isVettingComplete ? 'Share Application Link' : 'Copy Application Link'}
                  </button>
                )}
              </div>
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