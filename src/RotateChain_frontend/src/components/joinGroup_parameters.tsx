import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chain } from './rotate_dashboard_graph_payment';
import { Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { AccountIdentifier} from "@dfinity/ledger-icp"
import {Principal} from "@dfinity/principal"
import { DateTime } from 'luxon';
import { useNotification } from './notificationContext';
import { SplashScreen } from './sassySplash';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { roundUpdate } from '../state/slice';

//This is the onboarding that I intend to use as the redirect url whenever someone clicks on the join link incorporate with the email directory files for joining the group before one is finally admitted into the group.

// Mock group data - you'll replace this with real data later
type Group = {
  id: string;
  name: string;
  description: string;
  members: number;
  image: string;
  tags: string[];
  location: string;
  organizer: string;
};

// Mock function to fetch group data by invite code
const fetchGroupByInviteCode = (inviteCode: string): Promise<Group> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockGroups: Record<string, Group> = {
        "Crypto Investors Group": {
          id: "svvjab374b38784b3hbh",
          name: "Crypto Investors Group",
          description: "A crypto investor group dedicated to helping local communities through volunteer work and donations. We organize weekly events and monthly fundraising activities.",
          members: 245,
          image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
          tags: ["Volunteering", "Charity", "Local Support","crypto"],
          location: "purely online",
          organizer: "Rogetz"
        },
        "green-warriors": {
          id: "2",
          name: "Green Warriors",
          description: "Environmental activists focused on urban sustainability. We organize tree planting, recycling drives, and educational workshops on eco-friendly living.",
          members: 187,
          image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
          tags: ["Environment", "Sustainability", "Eco-friendly"],
          location: "City Park Pavilion",
          organizer: "Michael Chen"
        },
        "food-angels": {
          id: "3",
          name: "Food Angels",
          description: "Distributing food to those in need. We partner with local restaurants and supermarkets to reduce waste and feed the hungry.",
          members: 312,
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
          tags: ["Food Security", "Hunger Relief", "Community Support"],
          location: "Central Food Bank",
          organizer: "David Martinez"
        }
      };
      
      const group = mockGroups[inviteCode] || mockGroups["Crypto Investors Group"];
      resolve(group);
    }, 800);
  });
};

const JoinGroupPage = () => {
  const reduxDispatch = useAppDispatch()
  const roundChainRedux = useAppSelector(state => state.roundReducer)
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const notification = useNotification()
  const [userNameReceived,setUserNameReceived] = useState<string>("")
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        if (!inviteCode) {
          throw new Error("Invalid invitation link");
        }
        
        //fetch the chainData using the id
        /*if(chainActor && authClient){
          let chain = await chainActor.getChain(inviteCode.split("//")[1].split("/")[2])

          let now = DateTime.now()
          let startDate = String(chain.StartDate)
          let diff = now.diff(startDate,"days").days
          let currentRound = Number(diff)/Number(chain.roundDuration)
          let ceiledRound = Math.ceil(currentRound)


          let userIdentity = authClient.getIdentity()
          //userNameReceived should be a state
          let userName = userNameReceived
          //by default here the walletaddress should be empty or it can use the accounts address
          let principal = userIdentity.getPrincipal()
          //once he/she adds the plug wallet address can be used only for withdrawal
          const userAccountId = AccountIdentifier.fromPrincipal({
            principal: Principal.fromText(principal.toText()),
            subAccount:undefined
          }).toHex()
          let walletAddress = userAccountId 
          let contributionAmount = 0.0
          let isLender = true

          //add him as a member then retrieve the userName
          let addResult = await chainActor.addMember(
            userIdentity,
            userName,
            walletAddress,
            contributionAmount,
            isLender
          )

          //just used the principal, both as the userId and the borrowerId in this case. 
          //funny thing is it gets the loan of a single user
          let loan = await chainActor.getMemberLoans(principal,principal)

          //the chain to join
          let newChain:Chain = {
            currency:chain.currency,
            currentFunds:chain.creatorContributionAmount,
            currentRound:ceiledRound,
            fineRate:Math.floor(chain.fineRate),
            //this is the group's id I don't need the userId but I mispelt it as so.
            id:chain.userId,
            interestRate:chain.interestRate,
            //fetch loans data and match the values that match
            loans:[loan],
            members:chain,
            name:chain.name,
            roundDuration:chain.roundDuration,
            startDate:chain.startDate,
            totalFunds:chain.totalFunds,
            totalRounds:chain.totalRounds,
            type:chain.chainType,
            //this to be fetched from the member's userId or principal
            userId:principal.toString(),
            //it's saved to backend as well so no worries
            userName: userNameReceived
          }

          let newGroupData:Group = {
            description:"chain group in ICP currency",
            id:chain.userId,
            image:"",
            location:"",
            members:2,
            name:userNameReceived,
            organizer:'rotatechain',
            tags:["rotatechain"]
          }
          const groupData = await fetchGroupByInviteCode(inviteCode);
          setGroup(groupData);
          setLoading(false);


        }*/

        const groupData = await fetchGroupByInviteCode(inviteCode);
        setGroup(groupData);
        setLoading(false);

      } catch (err) {
        notification.error("Failed to load group information. The invitation may be invalid.");
        setLoading(false);
      }
    };

    loadGroupData();
  }, [inviteCode]);

  const handleJoinGroup = () => {
    if(userNameReceived == ""){
      notification.error("key in your userName first")
    }
    else{

        /* //uncomment later in production
        if(chainActor && authClient){
          let chain = await chainActor.getChain(inviteCode.split("//")[1].split("/")[2])

          let now = DateTime.now()
          let startDate = chain.StartDate
          let diff = now.diff(startDate,"days").days
          let currentRound = Number(diff)/Number(chain.roundDuration)
          let ceiledRound = Math.ceil(currentRound)


          let userIdentity = authClient.getIdentity()
          //userNameReceived should be a state
          let userName = userNameReceived
          //by default here the walletaddress should be empty or it can use the accounts address
          let principal = userIdentity.getPrincipal()
          //once he/she adds the plug wallet address can be used only for withdrawal
          const userAccountId = AccountIdentifier.fromPrincipal({
            principal: Principal.fromText(principal.toText()),
            subAccount:undefined
          }).toHex()
          let walletAddress = userAccountId 
          let contributionAmount = 0.0
          let isLender = true

          //add him as a member then retrieve the userName
          let addResult = await chainActor.addMember(
            userIdentity,
            userName,
            walletAddress,
            contributionAmount,
            isLender
          )

          //just used the principal, both as the userId and the borrowerId in this case. 
          //funny thing is it gets the loan of a single user
          let loan = await chainActor.getMemberLoans(principal,principal)

          //the chain to join
          let newChain:Chain = {
            currency:chain.currency,
            currentFunds:chain.creatorContributionAmount,
            currentRound:ceiledRound,
            fineRate:Math.floor(chain.fineRate),
            //this is the group's id I don't need the userId but I mispelt it as so.
            id:chain.userId,
            interestRate:chain.interestRate,
            //fetch loans data and match the values that match
            loans:[loan],
            members:chain,
            name:chain.name,
            roundDuration:chain.roundDuration,
            startDate:chain.startDate,
            totalFunds:chain.totalFunds,
            totalRounds:chain.totalRounds,
            type:chain.chainType,
            //this to be fetched from the member's userId or principal
            userId:principal.toString(),
            //it's saved to backend as well so no worries
            userName: userNameReceived
          }

          const groupData = await fetchGroupByInviteCode(inviteCode);
          setGroup(groupData);
          setLoading(false);

          setChainData(newChain)

        }*/

      //add the chain data to be passed
      //take him/her to the dashboard immediately
      const roundChainData = roundChainRedux
      if(userNameReceived && roundChainData){
        let stringifiedUserName:string | undefined = userNameReceived.toString()
        let newRoundChain = {...roundChainData,userName:stringifiedUserName}
        //reduxDispatch(roundUpdate(newRoundChain))
        notification.success(`welcome ${userNameReceived}`)
        navigate(`/dashboard`);
      }
    }
  };

  if (loading) {
    return (
      <SplashScreen onFinish={() => setLoading(false)} />
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">
            {error || "The group invitation link is invalid or has expired."}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">You've Been Invited!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You're about to join an amazing community making a difference
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Group Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-48 sm:h-56">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${group.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-3xl font-bold text-white">{group.name}</h2>
                  <div className="flex items-center mt-2">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {group.members} members
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6">{group.description}</p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Group Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="text-gray-600">{group.location}</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span className="text-gray-600">Organized by {group.organizer}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Group Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Join Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to Join?</h2>
              <p className="text-indigo-100">Become part of this amazing community</p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-indigo-100">Access to all group activities</p>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-indigo-100">Connect with like-minded people</p>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-indigo-100">Make a difference in your community</p>
              </div>
            </div>
            <input type="text" onChange={(e:any) => setUserNameReceived(e.target.value.toLowerCase())} placeholder="enter your userName"   className="w-full mb-4 bg-white text-indigo-600 font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors" />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinGroup}
              className="w-full bg-white text-indigo-600 font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors"
            >
              Join {group.name}
            </motion.button>
            
            <p className="text-center text-indigo-200 mt-4 text-sm">
              By joining, you agree to our Terms and Privacy Policy
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions? <a href="#" className="text-indigo-600 hover:underline">Contact the group organizer</a> or read our <a href="#" className="text-indigo-600 hover:underline">FAQs</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default JoinGroupPage;