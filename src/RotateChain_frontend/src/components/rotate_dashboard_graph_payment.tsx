// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useRevalidator } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import  {DateTime} from "luxon"; 

import { ChainType, Frequency } from './onboarding_new';
import { FaBars, FaCoins, FaRegWindowClose } from 'react-icons/fa';
import { useNotification } from './notificationContext';
import SassyBurgerMenu from "./hamburgerMenu";
import { SplashScreen } from './sassySplash';
import ICPShoppingPopup from '../instructions/icp_buying-instructions';
import PlugConnect from './plug_wallet_icp';
import PaymentForm from './Icp_payment_form';
import { getICPBalance, getPaymentCanister } from '../services/icp_canister';
import { AuthClient, LocalStorage } from '@dfinity/auth-client';
import { Actor ,ActorSubclass, Identity} from '@dfinity/agent';
import {canisterId, chain_management, createActor } from '../../../declarations/chain_management'
import { _SERVICE, CreateChainParams } from '../../../declarations/chain_management/chain_management.did';
import {_SERVICE as _LEDGER_SERVICE,AccountIdentifier} from "../../../declarations/icp_ledger_canister/icp_ledger_canister.did"
import {canisterId as ledgerCanisterId,createActor as createActorLedger } from "../../../declarations/icp_ledger_canister";
import { useAppSelector } from '../state/hooks';
import { useInternetIdentity } from 'ic-use-internet-identity';


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

export interface Chain {
  id: string;
  name: string;
  userId:string | undefined , 
  userName:string | undefined,
  fineRate:number,
  type: 'social' | 'global';
  totalRounds: number;
  currentRound: number;
  roundDuration: number;
  startDate: string;
  totalFunds: number;
  currentFunds: number;
  currency: string;
  members: Member[];
  loans: Loan[];
  interestRate: number;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ChartColors {
  contributed: string;
  pending: string;
  approved: string;
  repaid: string;
  defaulted: string;
  active: string;
  funds: string;
  timeline: string;
}

interface PaymentProvider {
  id: string;
  name: string;
  icon: string;
}

interface ChartData {
  memberData: MemberChartData[];
  loanData: LoanChartData[];
  timelineData: TimelineData[];
}

interface MemberChartData {
  name: string;
  contribution: number;
  contributed: string;
}

interface LoanChartData {
  name: string;
  value: number;
}

interface TimelineData {
  round: number;
  start: string;
  end: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface LoanStatusCount {
  pending: number;
  approved: number;
  repaid: number;
  defaulted: number;
}

const formatTime = (time: number): string => {
  return time < 10 ? `0${time}` : time.toString();
};

const CHART_COLORS: ChartColors = {
  contributed: '#4ade80',
  pending: '#f87171',
  approved: '#60a5fa',
  repaid: '#34d399',
  defaulted: '#f97316',
  active: '#a78bfa',
  funds: '#38bdf8',
  timeline: '#c084fc'
};

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  { id: 'paypal', name: 'PayPal', icon: '🔵' },
  { id: 'stripe', name: 'Stripe', icon: '💳' },
  { id: 'coinbase', name: 'Coinbase', icon: '🟡' },
  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
  { id: 'trustwallet', name: 'Trust Wallet', icon: '🔶' },
];

//a miniversion of a single chain group needing only the identifier and the name for the menu items.
export type SingleChain ={
  // the id of the chain
  id:string,
  // name of the chain
  name:string
}

type Props = {
  chainName:string,
  userName:string,
  userId:string,
  interestRate:number,
  fineRate:number,
  contribution:number,
  frequency:Frequency | number,
  chainType:ChainType,
  members:Member[],
  currency:number,
  loans:Loan[],
      totalRounds: number,
      currentRound: number,
      roundDuration: number,
      startDate: string,
      totalFunds: number,
      currentFunds: number,
}

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


export function frequencyMatcher({frequency}:{frequency:Frequency | number}):number{
  if(frequency == 'bi-weekly'){
    return 14
  }
  else if(frequency == 'monthly'){
    return 31
  }
  else if(frequency == 'quarterly'){
    return Number(31 * 3)
  }
  else if(frequency == 'weekly'){
    return 7
  }
  else if(typeof(frequency) == 'number'){
    return Number(frequency)
  }
  else{
    return 31
  }
}

const  fakeMembers:Member[] = [
  { id: 'm1', name: 'Alex Johnson', walletAddress: '0x742d35Cc...', contributed: true, contributionAmount: 1000, isLender: true, loans: [] },
  { id: 'm2', name: 'Maria Garcia', walletAddress: '0xab5801a7...', contributed: true, contributionAmount: 1000, isLender: false, loans: [] },
  { id: 'm3', name: 'James Smith', walletAddress: '0x4bb53b92...', contributed: false, contributionAmount: 1000, isLender: true, loans: [] },
  { id: 'm4', name: 'Sarah Williams', walletAddress: '0xda9b1a6c...', contributed: true, contributionAmount: 1000, isLender: false, loans: [] },
  { id: 'm5', name: 'Robert Brown', walletAddress: '0x184f4d2a...', contributed: true, contributionAmount: 1000, isLender: true, loans: [] },
]

const fakeLoans:Loan[] = [
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

type onLogout = () => void 


export function Dashboard(){
  const navigate = useNavigate();  
  const {status,identity} = useInternetIdentity()
  //const [chainActor,setChainActor] = useState<ActorSubclass<_SERVICE> | null>(null)
  const authClientRedux = useAppSelector(state => state.authReducer)
  const roundChainRedux = useAppSelector(state => state.roundReducer)
  const [chainActor,setChainActor] = useState<ActorSubclass<_SERVICE> | null>(null)
  const [authClient,setAuthClient] = useState<AuthClient | null>(null) 
  const [roundChain,setRoundChain] = useState<Chain | null>(null)
  const notification = useNotification()
  const [chain, setChain] = useState<Chain | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'members' | 'settings'>('overview');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanDuration, setLoanDuration] = useState<number>(30);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paypal'>('wallet');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [sliderHidden,setSliderHidden] = useState<boolean>(true)
  const [sliderStyle,setSliderStyle] = useState({})
  const [isBalanceEligible,setIsBalanceEligible] = useState<boolean>(false)
  const [eligibleBalance,setEligibleBalance] = useState<number>(0)
  const [inviteLink, setInviteLink] = useState<string>('absjnjn253782bjdj238kde3n2');
  const [myLoanHistory,setMyLoanHistory] = useState<Loan[]>([])
  const [chainGroups,setChainGroups] = useState<SingleChain[]>([])
  const [isLoggedIn,setIsLoggedIn] = useState<boolean>(false)
  const [showSplash, setShowSplash] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [payStyle,setPayStyle] = useState({})
  const [payHidden,setPayHidden] = useState(true)
  const [roundTimeRemaining, setRoundTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [seasonTimeRemaining, setSeasonTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  //for the wallet
  const [walletBalance,setWalletBalance] = useState(0)
  const [isConnected, setIsConnected] = useState(false);
  const [liquidityBalance,setLiquidityBalance] = useState(0);
  const [principal, setPrincipal] = useState('');
  const [accountId, setAccountId] = useState('');
  const [balance, setBalance] = useState(0);
  //set the network here
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbLiquidityBalance,setDbLiquidityBalance] = useState(0);
  const [actorState,setActorState] = useState<ActorSubclass<_SERVICE>>()
  const [ledgerActorState,setLedgerActorState] = useState<ActorSubclass<_LEDGER_SERVICE>>()


  useEffect(function(){

    if(status == 'success' && identity != undefined){

        const actor:ActorSubclass<_SERVICE> = createActor(canisterId,{
          agentOptions:{
            identity
          }
        })

        const ledgerActor:ActorSubclass<_LEDGER_SERVICE> = createActorLedger(ledgerCanisterId,{
          agentOptions:{
            identity
          }
        })


        setLedgerActorState(ledgerActor)

        setActorState(actor)
        setIsLoggedIn(true)

    }
  },[status])

  useEffect(function(){
    /*if(actorState){
      //fetch the chain from the db.
      //actorState.getChain({})

      //get the chainData
      //here get the groupId from redux since it's set there as its been set

      let newChain:CreateChainParams = {
        chainType:{social:null},
        creatorContributionAmount:100,
        creatorIsLender:true,
        creatorWallet:"svjdbj892nbkjndnjd389n3jbd993nj3bd",
        currency:"ICP",
        fineRate:10.00,
        interestRate:10.00,
        name:"Elite Group",
        roundDuration:BigInt(3600),
        startDate:"22-05-2025",
        totalRounds:BigInt(1),
        userId:"bjdnjdn93u93nd83983njbdbhfjn",
        userName:"Tobina"
      }

      if(isLoggedIn){
        //get the reduxId from the reduxChain

        let chainId = roundChainRedux.id
        actorState.getChain(chainId).then(function(result:any){
          if(result.ok){
            let newChain:Chain = {
              currency:result.ok.currency,
              currentFunds:result.ok.currency,
              currentRound:result.ok.currentRound,
              fineRate:result.ok.fineRate,
              id:result.ok.id,
              interestRate:result.ok.interestRate,
              loans:result.ok.loans,
              members:result.ok.members,
              name:result.ok.name,
              roundDuration:result.ok.roundDuration,
              startDate:result.ok.startDate,
              totalFunds:result.ok.totalFunds,
              totalRounds:result.ok.totalRounds,
              type:result.ok.type,
              userId:result.ok.userId,
              userName:result.ok.userName,
            }
          }else{
            notification.error("error fetching chaindata")
          }
        })

      }
      else{
        navigate("/login")
        notification.error("user not logged in")
      }

    }*/

  },[actorState,isLoggedIn,roundChainRedux])

  useEffect(function(){
    setRoundChain(roundChainRedux)
  },[roundChainRedux])

  useEffect(function(){
    if(authClientRedux){
      setAuthClient(authClientRedux)
    }
  },[authClientRedux])
  
  useEffect(() => {
    /*if (isConnected) {
      fetchBalance();
      fetchPayments();
    }*/
  }, [isConnected, network]);

  //for gettingthe other user's chain groups
  useEffect(function(){
    //set the chain groups of the userId from the actor
    

    let mockChains:SingleChain[] = [
      {
        id:"abjsbjhb73947nbdjb37384b4373",
        name:"go-getters"
      },
      {
        id:"ab37434bhbrhf8479302803ndfhbj3",
        name:"moneyhunters"
      },
      {
        id:"abjdnjdhhf73947nbdjb37384b4373",
        name:"elites"
      }
    ]

    if(actorState){
      //fetch the chain from the db.
      //actorState.getChain({})

      //get the chainData
      //here get the groupId from redux since it's set there as its been se

      if(isLoggedIn){
        actorState.getAllChains().then(function(result:any){
          if(result.ok){

            let filteredChains:SingleChain[] = result.ok.filter((function(group,index){
              //search for details of the member from the list of members in chains
              // then return the chains themselves after maping them
              let userPrincipal = identity?.getPrincipal().toString()
              return group.members.indexOf(group.members.find((function(member,index){
                member.id == userPrincipal
              }))) != -1  
            })).map(function(group,index){
              //map the group to ChainGroup type, so slice it in a way
              let newChainGroup:SingleChain = {
                id:group.id,
                name:group.name,
              }
              return newChainGroup
            })

            setChainGroups(filteredChains)

          }else{
            notification.error("error fetching chaindata")
          }
        })

      }
      else{
        navigate("/login")
        notification.error("user not logged in")
      }

    }
  },[actorState,isLoggedIn])

  useEffect(function(){
    let myFilteredHistory:Array<any> = []
    if(roundChain){
      if(actorState){
        if(isLoggedIn){
          if (identity != undefined){
            actorState.getMemberLoans(identity.getPrincipal().toString(),roundChain.id).then(function(result:any){
              if(result.ok){
                //no filter needed, brings only the user's data
                //myFilteredHistory = result.ok.filter((loan,index) => loan.borrowerId == roundChain.userId || loan.lenderId == roundChain.userId )

                setMyLoanHistory(result.ok)
              }else{
                notification.error("error fetching loans")
              }
            })
            
          }
        }
        else{
          navigate("/login")
          notification.error("user not logged in")
        }
      }      
    }
  },[chain,actorState,isLoggedIn])

  useEffect(function(){
    //check balance from the ledger
    if(walletBalance > eligibleBalance){
      setIsBalanceEligible(true)
    }
    else{
      setIsBalanceEligible(false)
    }
  },[walletBalance,eligibleBalance])

  useEffect(function(){
    if(sliderHidden == false){
      setSliderStyle({
        visibllity:"visible",
        display:"flex"
      })
    }else{
      setSliderStyle({
        visibllity:"hidden",
        display:"none"
      })
    }
  },[sliderHidden])

  useEffect(function(){
    if(payHidden == false){
      setPayStyle({
        visibllity:"visible",
        display:"flex"
      })
    }else{
      setPayStyle({
        visibllity:"hidden",
        display:"none"
      })
    }
  },[payHidden])


  useEffect(() => {
    const updateDateTime = (): void => {
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

  useEffect(() => {
    if(roundChain && identity != undefined){
      roundChain.loans.forEach(loan => {
        const borrower = roundChain.members.find(m => m.id === loan.borrowerId);
        const lender = roundChain.members.find(m => m.id === loan.lenderId);
        
        if (borrower) borrower.loans.push(loan);
        if (lender && lender.id !== borrower?.id) lender.loans.push(loan);
      });
      
      setChain({...roundChain,userId:identity.getPrincipal().toString()});
    }

  }, [roundChain]);

  useEffect(() => {
    if (!chain) return;
    
    const updateTimeRemaining = (): void => {
      const luxonStart = DateTime.fromISO(chain.startDate)
      const luxonNow = DateTime.now()
      const start = new Date(chain.startDate);
      const now = new Date();

      /*(chain.currentRound - 1) * chain.roundDuration
      let luxonRoundStart = DateTime*/
      const roundStart = new Date(start);
      roundStart.setDate(start.getDate() + ((chain.currentRound - 1) * chain.roundDuration));
      
      const roundEnd = new Date(start);
      roundEnd.setDate(roundStart.getDate() + chain.roundDuration);

      let totalDuration = (Number(chain.roundDuration) * Number(chain.members.length))
      let luxonEnd = luxonStart.plus({seconds:totalDuration})
      const seasonEnd = new Date(luxonStart.plus({seconds:totalDuration}).toJSDate());

      /*let nowDifferenceToEnd = luxonEnd.diff(luxonNow, 'seconds').seconds;
      let calcDiv = nowDifferenceToEnd / Number(chain.roundDuration)*/
      //how to find roundDate end
      //luxonEnd  = remove the Date object of javascript and use luxonStart directly.
      // luxonEnd subtract the luxonStart and get the value in seconds.
      //divide the difference with the roundDuration and get the remainder value.
      //use that remainder to subtract now from the remainderDuration date
      
      seasonEnd.setDate(start.getDate() + (chain.totalRounds * chain.roundDuration));
      
      const roundDiff = roundEnd.getTime() - now.getTime();
      const seasonDiff = seasonEnd.getTime() - now.getTime();
      
      const roundDays = Math.floor(roundDiff / (1000 * 60 * 60 * 24));
      const roundHours = Math.floor((roundDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const roundMinutes = Math.floor((roundDiff % (1000 * 60 * 60)) / (1000 * 60));
      const roundSeconds = Math.floor((roundDiff % (1000 * 60)) / 1000);
      
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

  const onLogout = async () => {
    const authClient = authClientRedux
    if (authClient) {
      await authClient.logout();
    }
    //redirect to the landing page
    navigate("/")
  };

  let depositFunds = function(){
    let chainAccountIdentifier = ledgerActorState.AccountIdentifier(canisterId,chain.walletAddress)
    //funds deposited to chain group and funds remitted from user plug account 
    let result = ledgerActorState.icrc1_transfer(accountId,chainAccountIdentifier)
  }

  let withrawFunds = function(chainPrincipal:Principal,userPrincipal:Principal){
    //send the funds to user's plug wallet
    let chainAccountIdentifier = ledgerActorState.AccountIdentifier(canisterId,chain.walletAddress)
    //has the from and the to properties
    // from chain wallet to user plug wallet account id
    let result = ledgerActorState.icrc1_transfer(chainAccountIdentifier,accountId)
  }

  let liquidityStake = function(){
    //transfer funds from the plug wallet to the liquidity wallet
    let userPrincipal = identity.getPrincipal()
    let member = actorState.getChainMember(chain.id,userPrincipal)
    let liquidityWallet = member.walletAddress
    let liquidityAccouuntIdentifier = ledgerActorState.AccountIdentifier(userPrincipal,liquidityWallet) 
    //has the from and the to properties
    // from plug wallet account id to the liqudity wallet
    let result = ledgerActorState.icrc1_transfer(accountId,liquidityAccouuntIdentifier)

  }

  //for the liquid wallet
  let liquidityAutomatedDeposit = function(){
    let userPrincipal = identity.
  }

  // this is the one called immediately a user connects his or her wallet. the balance is checked first and then the funds automatically remmited to the chain group
  // for the plug wallet
  let automatedDeposit = function(){
    //should check liquid wallet first before remitting directly from the plug wallet
    if(liquidityWallet > chain.contributionAmount){
      liquidityAutomatedDeposit()
    }
    else{
      let balance = ledgerActorState.icrc1_balance_of(accountId)
      let icpUnits = 1000000000
      
      if(walletBalance > chain.contributionAmount){
          let chainAccountIdentifier = ledgerActorState.AccountIdentifier(canisterId,chain.walletAddress)
          //funds deposited to chain group and funds remitted from user plug account 
          let result = ledgerActorState.icrc1_transfer(accountId,chainAccountIdentifier,chain.contributionAmount)

      }
      else{
        notification.error("insufficient tokens to deposit")
      }
    }
  }


  const handleConnect = (principal: string, accountId: string) => {
    // plug wallet interactions
    if(ledgerActorState != undefined){
      //balance of the plug wallet
      let walletBalance = ledgerActorState.icrc1_balance_of(principal)
      setWalletBalance(walletBalance)
      //setWalletAdress as it is for use in transactions
      //divide the balance by a 1000,000,000 to get the actual human readable tokens
      setBalance(walletBalance/1000000000)
      //get the user liquidity wallet balance
      let liqudityAccount = actorState.getChainMember(chain.id,identity.getPrincipal().toString())
      
      let liquidityBalance = ledgerActorState.icrc1_balance_of(principal,liquidityAccount)
      //for visibility
      setLiquidityBalance(liquidityBalance/1000000000)
      //for transactions
      setDbLiquidityBalance(liquidityBalance)
    }
    //update the user balance in the frontend.
    setPrincipal(principal);
    setAccountId(accountId);
    setIsConnected(true);
    fetchBalance();
    fetchPayments();
  };
  
  const fetchBalance = async () => {
    if (!isConnected) return;
    try {
      if(ledgerActorState != undefined){
        //balance of the plug wallet
        let walletBalance = ledgerActorState.icrc1_balance_of(principal)
        setWalletBalance(walletBalance)
        //setWalletAdress as it is for use in transactions
        //divide the balance by a 1000,000,000 to get the actual human readable tokens
        setBalance(walletBalance/1000000000)
        let userBalance = getICPBalance('testnet')
        setBalance(userBalance)
        //get the user liquidity wallet balance
        let liqudityAccount = actorState.getChainMember(chain.id,identity.getPrincipal().toString())
        
        let liquidityBalance = ledgerActorState.icrc1_balance_of(principal,liquidityAccount)
        //for visibility
        setLiquidityBalance(liquidityBalance/1000000000)
        //for transactions
        setDbLiquidityBalance(liquidityBalance)
      }



      const balance = await getICPBalance(network);
      setBalance(balance);

      
      // Store balance in backend
      const paymentCanister = await getPaymentCanister();
      await paymentCanister.storeBalance(BigInt(balance * 100000000));
    } catch (err) {
      notfication.error("Failed to fetch user wallet balance:", err);
    }
  };

  const fetchPayments = async () => {
    if (!isConnected) return;
    try {
      const paymentCanister = await getPaymentCanister();
      const payments = await paymentCanister.getPayments();
      setPayments(payments);
    } catch (err) {
      notification.error("Failed to fetch payments:", err);
    }
  };

  const handlePaymentSent = () => {
    fetchBalance();
    fetchPayments();
  };

  const handleBalanceUpdate = (newBalance: number) => {
    setBalance(newBalance);
  };

  const contributionProgress = chain 
    ? (chain.currentFunds / chain.totalFunds) * 100 
    : 0;
  
  const contributedMembers = chain 
    ? chain.members.filter(m => m.contributed).length 
    : 0;

  const getChartData = (): ChartData => {
    if (!chain) return { memberData: [], loanData: [], timelineData: [] };

    const memberData: MemberChartData[] = chain.members.map(member => ({
      name: member.name,
      contribution: member.contributionAmount,
      contributed: member.contributed ? 'Yes' : 'No'
    }));

    const loanStatusCount: LoanStatusCount = {
      pending: 0,
      approved: 0,
      repaid: 0,
      defaulted: 0
    };
    
    chain.loans.forEach(loan => {
      loanStatusCount[loan.status]++;
    });
    
    const loanData: LoanChartData[] = Object.entries(loanStatusCount).map(([name, value]) => ({
      name,
      value
    }));

    const timelineData: TimelineData[] = [];
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
  
  const handleConnectWallet = (): void => {
    if (!isWalletConnected) {
      //change the mock address to point to a real address 
      const address = '0x742d35Cc6634C893292...';
      setWalletAddress(address);
      setIsWalletConnected(true);

      //update the member with the id, userName and the wallet address as the third parameter
      //chainActor.updateMember(useId,userName,walletAddress)

      notification.success('Wallet connected successfully!');
    } else {
      setIsWalletConnected(false);
      setWalletAddress('');
      notification.error("wallet disconnected")
    }
  };

  const handlePaymentProcessing = (provider: string): void => {
    setIsProcessingPayment(true);
    setSelectedPaymentProvider(provider);
    
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        setPaymentSuccess(false);
        handleCompletePayment();
      }, 3000);
    }, 2000);
  };
  
  const handleRequestLoan = (): void => {
    //save it to the db first.
    //might use userId or chainId as first parameter
    /*chainActor.createLoan(chainId,{
      status:,
      borrowerId:,
      dueDate:,
      lenderId:,
      interestRate:,
      amount:,
    })*/


    /*
    if (!loanAmount) return;

    alert(`Loan request for ${loanAmount} ${chain?.currency} submitted to the group!`);

    setLoanAmount('');*/
    notification.success("loan request submitted successfully")
  };
  
  const handlePayContribution = (): void => {
    if (!chain) return;
    //this method will be useful once I incorporate the direct payment procedure
    //setPaymentAmount(chain.members[0].contributionAmount);
    //setIsPaymentModalOpen(true);
    setPayHidden(false)
    //use ledger for that then simply update the chain with the relevant data.
  };
  
  const handleCompletePayment = (): void => {
    setIsPaymentModalOpen(false);
    
    if (chain) {
      const updatedMembers = [...chain.members];
      updatedMembers[0].contributed = true;
      
      setChain({
        ...chain,
        currentFunds: chain.currentFunds + updatedMembers[0].contributionAmount,
        members: updatedMembers
      });
    }
    //use ledger, then update the management canister
  };

  let loanHandler = function(e:any){
    e.preventDefault()    
    if (!loanAmount) return;
      notification.success("loan request received succesfuly, track progress in the loans tab")

    //might use userId or chainId as first parameter
    //confirm whether thiis function is meant to create or update
    /*chainActor.createLoan(chainId,{
      status:,
      borrowerId:,
      dueDate:,
      lenderId:,
      interestRate:,
      amount:,
    })*/

  }

  let inviteSlider = function(e:any){
    setSliderHidden(false)
  }

  //share functionality for payment
  const paymentLink = () => {
    navigator.clipboard.writeText(inviteLink);
    notification.success('payment address copied to clipboard!');
  }

  // Share functionality
  const shareLink = (platform: string) => {
    const message = `Join my ${chain?.type === 'social' ? 'SocialChain' : 'GlobalChain'} group: ${inviteLink}`;
    
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
        notification.success('Link copied to clipboard!');
    }
  };

  let approveHandler = function(loan:Loan){
    setEligibleBalance(loan.amount)
    // isBalanceEligible determines whether the balance in the user's wallet can loan another
    if(isBalanceEligible){
      notification.info("approval request received please wait as we process your request")
      //ledger request,then update the management as well.
      //after ledger
      //chainActor.updateLoanStatus(userId,chainId,approved)

      //send the address that's to pay the loab to the backend.

      //after the cash has been released to the chain member, it's updated in the backend and sent back to the system in the loan history      
    }
    else{
      notification.error("you have insufficient funds to loan the rotatechain member")
    }
  }

  let repayHandler = function(loan:Loan){
    //for processing the loaning logic
    //ledger then management
  }
  
  if (!chain) return <SplashScreen onFinish={() => setShowSplash(false) } />;

  // The JSX portion remains exactly the same as in your original file
  // I've omitted it here for brevity, but it should be included in your actual file
  // ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 relative">
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
              <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3 lg:px-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold flex gap-2"><FaCoins className="text-2xl text-blue-600"/><span className="hidden lg:flex">RotateChain</span> </h1>
                    <p className="text-indigo-200 mt-1 hidden lg:flex">Rotational Savings & Trading Platform</p>
                  </div>
                  
                  <PlugConnect 
                    setIsWalletConnected={setIsWalletConnected}
                    onConnect={handleConnect} 
                    network={network} 
                  />
                  
                  <div className="flex items-center space-x-4">
                    <div 
                      className="bg-transoarent flex items-center gap-4 px-4 py-2 rounded-lg "
                    > 
                      <span className='hidden md:flex text-xl font-bold text-white'>
                        my chains  
                      </span>
                      <SassyBurgerMenu onLogout={onLogout} chainGroups={mockChains}/>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            
            {/* Main Dashboard */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              {/* Chain Info Header */}
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center">
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
                  
                  <div className="bg-blue-100 p-4 rounded-xl">
                    <p className="text-sm text-indigo-700 font-medium">iiquidity wallet balance</p>
                    <p className="text-xl font-bold text-indigo-900">
                      {liquidityBalance}
                    </p>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                      <p className="text-sm text-indigo-700 font-medium">Your Rotation</p>
                      <p className="text-2xl font-bold text-indigo-900 mt-1">Round {chain.currentRound}</p>
                      <p className="text-gray-600 text-sm mt-2">
                        Estimated payout: {chain.totalFunds} {chain.currency}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-gray-600">Your current Contribution</p>
                        <p className="font-bold text-lg">{/*chain.members[2].contributionAmount*/} 0 {chain.currency}</p>
                      </div>
                      <button 
                        onClick={handlePayContribution}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          chain.members[0].contributed 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                        }`}
                        disabled={chain.members[2].contributed}
                      >
                        {chain.members[2].contributed ? 'Paid' : 'Pay Now'}
                      </button>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-blue-100">
                      <div>
                        <p className="text-blue-600">Your current loan</p>
                        <p className="font-bold text-lg">{/*chain.members[0].contributionAmount*/} {/*chain.currency*/}0</p>
                      </div>
                      <button 
                        onClick={handlePayContribution}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          chain.members[0].contributed 
                            ? 'bg-slate-200 text-blue-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:opacity-90'
                        }`}
                        disabled={chain.members[0].contributed}
                      >
                        {chain.members[0].contributed ? 'Paid' : 'Pay Now'}
                      </button>
                    </div>
                    <div style={payStyle} className="flex-col relative mt-6">
                      <h3 className=" font-medium text-blue-800 mb-3 flex justify-between "> <span>pay via address</span><FaRegWindowClose onClick={(e:any) => {return setSliderHidden(true)}} className='text-red-600 text-2xl' /></h3>
                      <div   className=" items-center justify-between bg-white p-3 rounded-lg border border-blue-200 mb-4">
                        <div className="truncate text-sm text-gray-600 mr-2">
                          {chain.id}
                        </div>
                        <button 
                          onClick={() => paymentLink()}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                      
                    </div>


                  </div>
                </div>
                
                <div className="h-auto bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-4">
                    <button 
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                      onClick={() => setActiveTab('loans')}
                    >
                      Request Loan
                    </button>
                    
                    <button onClick={inviteSlider}  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                      Invite Members
                    </button>
                    <div style={sliderStyle} className="flex-col relative mt-6">
                      <h3 className=" font-medium text-blue-800 mb-3 flex justify-between "> <span>Invite Members</span><FaRegWindowClose onClick={(e:any) => {return setSliderHidden(true)}} className='text-red-600 text-2xl' /></h3>
                      <div   className=" items-center justify-between bg-white p-3 rounded-lg border border-blue-200 mb-4">
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
                    <div className="w-full h-auto mx-auto relative">
                      <button
                        onClick={() => setShowPopup(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                      >
                        Show Me How to Buy ICP!
                      </button>
                
                      {showPopup && <ICPShoppingPopup onClose={() => setShowPopup(false)} />}                    
                    </div>
                    <button onClick={(e:any) => {
                      if(isWalletConnected){
                        notification.success("withrawal being processed to your wallet")
                      }
                      else{
                        notification.error("wallet not connected")
                      }
                    }}  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                      withdraw funds
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
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
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
                                      {i === chain.currentRound ? `Ends in ${seasonTimeRemaining.days} days` : ''}
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
                        <form onSubmit={loanHandler} className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
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
                              <div
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                {chain.roundDuration}
                              </div>
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
                            onClick={handleRequestLoan} type='submit'
                            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
                          >
                            Submit Loan Request
                          </button>
                        </form>
                        
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
                                    
                                    {loan.borrowerId === chain.members[0].id && loan.status === 'approved' && (
                                      <div className="mt-4 flex justify-end">
                                        <button onClick={(e:any) => repayHandler(loan)}  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                                          Repay Loan
                                        </button>
                                      </div>
                                    )}
                                    
                                    {loan.status === 'pending' && loan.lenderId !== chain.members[0].id && (
                                      <div className="mt-4 flex space-x-3 justify-end">
                                        <button onClick={(e:any) => approveHandler(loan)} className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
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
                          {chain.loans.filter(loan => loan.borrowerId === chain.userId || loan.lenderId === chain.userId).length > 0 ? (
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
                                  {myLoanHistory.map(loan => {
                                    //all of them to be displayed
                                    //if (loan.status !== 'repaid' && loan.status !== 'defaulted') return null;
                                    
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
                                
                                {member.loans.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Loans</p>
                                    {member.loans.map(loan => (
                                      <div key={loan.id} className="text-sm text-gray-700">
                                        {loan.status === 'pending' ? 'Requested' : loan.status} {loan.amount} {chain.currency}
                                      </div>
                                    ))}
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
                          <h4 className="font-semibold text-gray-800 mb-4">user configuration</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-700 text-sm font-medium mb-1">User Name</label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={chain.userName}
                                onChange={(e) => setRoundChain({ ...chain, userName: e.target.value })}
                              />
                            </div>
                                                        
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h4 className="font-semibold text-gray-800 mb-4">Danger Zone</h4>
                          
                          <div className="space-y-4">
                            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                              <h5 className="font-medium text-red-800">Leave Group</h5>
                              <p className="text-sm text-red-600 mt-1">
                                You will lose access to the group and any funds already contributed for this round. Note that you can't leave if you have any pending loans.
                              </p>
                              <button className="mt-3 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
                                Leave Group
                              </button>
                            </div>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Amount Due</span>
                        <span className="font-bold text-lg">{paymentAmount} {chain.currency}</span>
                      </div>
                      <p className="text-sm text-gray-500">Round {chain.currentRound} Contribution</p>
                    </div>
                    
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
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mb-2" />
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
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mb-2" />
                          <span className="font-medium">PayPal</span>
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCompletePayment}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              </div>
            )}         

            <button
              onClick={(e:any) => {
                notification.success("earn with liquidity pools")
                navigate("/metaDashboard")
              }}
              className="fixed bottom-1 right-2 z-30 cursor-pointer mt-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-2 md:px-6 md:py-4 w-20 h-20 md:w-auto md:h-auto flex items-end justify-end shadow-lg hover:scale-110 transition-all focus:outline-none"
            >
              <span className="text-sm md:text-2xl font-medium text-center">liduidify</span>
            </button>


            <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} RotateChain. All rights reserved. The future of rotational savings and trading.
            </footer>
          </div>
    </div>
  );
};

export default Dashboard;

export function ChainGroupsMenu({menuItems}:{menuItems:SingleChain[]}){
  return(
    <div className="w-full sm:w-4/5 md:w-3/5 lg:w-2/5 h-screen">
      {menuItems.map((item,index) => {return <div>{item.name}</div>})}
    </div>
  )
}
