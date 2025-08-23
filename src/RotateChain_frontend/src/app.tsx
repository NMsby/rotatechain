
import React,{ useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import "./globals.css"
import LandingPage from "./components/landing_new_latest";
import SmartOnboarding from "./components/onboarding_new";
import Dashboard, { Chain, SingleChain } from "./components/rotate_dashboard_graph_payment";
import AppIdentityIntegrated from "./components/internetIdentity"
import { BrowserRouter as Router, Routes,Route} from "react-router-dom";
import { NotificationProvider } from "./components/notificationContext";
import MetapoolLiquidityDashboard from './components/rotate_metapool_dashboard'
import JoinGroupPage from "./components/joinGroup_parameters";

import { CreateChainParams,_SERVICE } from '../../declarations/chain_management/chain_management.did';


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

function App(){
  
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}/>
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
