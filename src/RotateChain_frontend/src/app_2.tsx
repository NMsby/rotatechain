
import React,{ useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import "./globals.css"
import LandingPage from "./landing_new_latest";
import SmartOnboarding from "./onboarding_new";
import Dashboard, { Chain, SingleChain } from "./rotate_dashboard_graph_payment";
import AppIdentityIntegrated from "./internetIdentity"
import { BrowserRouter as Router, Routes,Route,Link} from "react-router-dom";
import { NotificationProvider } from "./notificationContext";
import MetapoolLiquidityDashboard from './rotate_metapool_dashboard'
import RotateTheme from "./rotateTheme"
import SassySplash from "./sassySplash"
import SassyBurgerMenu from "./hamburgerMenu";
import JoinGroupPage from "./joinGroup_parameters";

import { CreateChainParams,_SERVICE } from '../../declarations/chain_management/chain_management.did';

import { AuthClient, LocalStorage } from '@dfinity/auth-client';
import LoginPage from './loginpage';
import { UserData } from './types';
import { Actor,ActorSubclass } from "@dfinity/agent";
import { canisterId as ledgerCanisterId } from "../../declarations/icp_ledger_canister"
import { canisterId, createActor } from "../../declarations/chain_management";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";

import { useAppDispatch, useAppSelector } from './state/hooks';
import { roundUpdate, update } from './state/slice';


const roundChain: Chain = {
      id: '0xajs273782bsh372837bdh322ba8',
      name: 'Crypto Investors Group',
      userId: "0xvdb253jy352djf564kdbsjy372",
      type: 'social',
      fineRate:5,
      userName:"Rogetz",
      totalRounds: 5,
      currentRound: 3,
      roundDuration: 30,
      startDate: '2025-01-07',
      totalFunds: 50000,
      currentFunds: 35000,
      currency: 'ICP',
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
          dueDate: '2025-02-07'
        },
        { 
          id: 'loan-002', 
          borrowerId: 'm4', 
          lenderId: 'm3', 
          amount: 800, 
          interestRate: 5, 
          status: 'pending',
          dueDate: '2025-03-07'
        }
      ]
    };

const mockChains:SingleChain[] = [
  {
    id:"sbjbsjbdjs823o3nkjn4kkd399403",
    name:"money hunters"
  },
  {
    id:"sbjbsa6287bdjshb287824kkd399403",
    name:"elites"
  }

]

const identityProvider = 'https://identity.ic0.ap'

function App(){
  const reduxDispatch = useAppDispatch()
  const authClientRedux = useAppSelector(state => state.authReducer)
  const roundchainRedux = useAppSelector(state => state.roundReducer)
  const [chainData,setChainData] = useState<Chain | null>(null)

  // the wallet related data
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState('');
  const [accountId, setAccountId] = useState('');
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actor,setActor] = useState<Actor>()


  //for the internet identity
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  //for the splash screen
  const [showSplash, setShowSplash] = useState(true);
  //the chain_management actor
  const [chainActor,setChainActor] = useState<ActorSubclass<_SERVICE> | null>()
  const [chainId,setChainId] = useState("")
  
  useEffect(function(){
    reduxDispatch(roundUpdate(chainData))
  },[chainData])


  //get the accounId from the canisterId
  useEffect(function(){
    const canisterIdText = ledgerCanisterId
    const canisterPrincipal = Principal.fromText(ledgerCanisterId)

    const accountId = AccountIdentifier.fromPrincipal({
      principal: canisterPrincipal
    }).toHex()

    setChainId(accountId)
    setChainData((prevState) => {
      if(prevState){
        return {...prevState,id:accountId}
      }
      else{
        return prevState
      }
    })

  },[])


  //for intializing chainData
  useEffect(function(){
    setChainData(roundChain)
  },[])

  // for initializing the authClient
  /*useEffect(function(){
    let initClient = async function(){
      try {
        if(authClientRedux == null){
          //using a keytype supporting serialization
          const client = await AuthClient.create({keyType:'ECDSA'})
        //const client = await AuthClient.create();
          setAuthClient(client);
          //got an issue with serializing so we'll serialize it before saving
          //reduxDispatch(update(client))
        
    */  
        /*if (await client.isAuthenticated()) {
          const identity = client.getIdentity();
          const principal = identity.getPrincipal().toString();
          setUserData({
            principal,
            username: `user_${principal.substring(0, 8)}`,
            lastLogin: new Date().toLocaleString()
          });
          setIsLoggedIn(true);
        }*/
        /*}
      } catch (error) {
        console.error("Failed to initialize auth client:", error);
      }
    }
    initClient()
  },[])*/
  

  //for the signing in of the chain_management actor
  /* // uncomment it later
  useEffect(function(){

      const updateActor = async () => {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const actor = createActor(canisterId, {
            
        agentOptions: {
            identity
        }
        });
        let tempPrincipal = identity.getPrincipal.toString()

        const isAuthenticated = await authClient.isAuthenticated();
        setAuthenticated(isAuthenticated)

        setActor(actor)
        setAuthClient(authClient)
        setPrincipal(tempPrincipal)
        setUserNameState(tempPrincipal)
      };

  },[])*/



  //for the internet identity still
  /*useEffect(() => {
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
  }, []);*/

  const updateActor = async () => {
    //const authClient = await AuthClient.create();
    /*if(authClientRedux != null){
      const authClient = authClientRedux

      const identity = authClient.getIdentity();
      const actor = createActor(canisterId, {
          
      agentOptions: {
          identity
      }
      });
      let tempPrincipal = identity.getPrincipal().toString()

      let principal = identity.getPrincipal()
      //once he/she adds the plug wallet address can be used only for withdrawal
      const userAccountId = AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(principal.toText()),
        subAccount:undefined
      }).toHex()

      setChainData((prevState) => {
        if(prevState){
          return {...prevState,userId:userAccountId}
        }
      })


      const isAuthenticated = await authClient.isAuthenticated();
      setIsLoggedIn(isAuthenticated)

      setAuthClient(authClient)
      setPrincipal(tempPrincipal)

    }*/

  };

  
  const handleLogin = async () => {

    if(authClient){

      await authClient.login({
        identityProvider,
        onSuccess: updateActor
      });
    }
  };
  
  const handleLogout = async () => {
    if (authClient) {
      await authClient.logout();
    }
    setIsLoggedIn(false);
    setUserData(null);
    //redirect to the landing page

  };
  
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}/>
          <Route path="/splash" element={<SassySplash/>}/>
          <Route path="/rotateTheme" element={<RotateTheme/>}/>
          <Route path="/join" element={<SmartOnboarding />}/>
          <Route path="/dashboard" element={<Dashboard />}/>         
          <Route path="/metaDashboard" element={<MetapoolLiquidityDashboard/>}/>
          <Route path="/login" element={<AppIdentityIntegrated/>}/>
          <Route path={`/join/:inviteCode`} element={<JoinGroupPage />}/>
        </Routes>
      </Router>
    </NotificationProvider>
  )
}




export default App;
