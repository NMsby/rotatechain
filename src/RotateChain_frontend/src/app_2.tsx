//import Layout from './components/layout/Layout';
//import Navbar from './components/navbar/Navbar';
import DeFiDashboard from "./landing"
//import Swap from './pages/Swap';
//import { WalletProvider } from './services/walletContext';
//import Pools from './pages/Pools';
import PoolAnalyticsCard from "./services/poolanalyticsCard"
import { useState } from 'react';
import BrutalLayout from './brutalLayout';
import SassyNav from './saasyNav';
import { motion } from 'framer-motion';
import { TestDisplay } from "./testDisplay";
import "./globals.css"
import LandingPage from "./landing_new_latest";
import SmartOnboarding from "./onboarding_new";
import Dashboard from "./rotate_dashboard_graph_payment";
import AppIdentityIntegrated from "./internetIdentity"
import LiquidityPoolDashboard from "./liquidity_pool"
import { BrowserRouter as Router, Routes,Route,Link} from "react-router-dom";
import { NotificationProvider } from "./notificationContext";
import DashboardWithLiquidity from './rotate_dashboard_liquidity_graph'
import MetapoolLiquidityDashboard from './rotate_metapool_dashboard'

/*function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'dashboard' &&
       <DeFiDashboard />}
      {activeTab === 'swap' && <WalletProvider/>}
      {activeTab === 'pools' && <PoolAnalyticsCard />}
      {activeTab === 'staking' && <Staking />}
    </Layout>
  );
}

export default App;*/

/*const App = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <BrutalLayout>
      <SassyNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'dashboard' && <DeFiDashboard />}
      {activeTab === 'swap' && <WalletProvider/>}
      {activeTab === 'pools' && <PoolAnalyticsCard apr={2400} fees24h={25000} tvl={20090} volume24h={23490} />}

      {
      <div className="mt-20 p-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-9xl font-black mb-8"
        >
          Rotate.<span className="text-gray-400">Chain</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto text-xl font-medium"
        >
          Active Tab: <span className="font-bold">{activeTab.toUpperCase()}</span>
        </motion.p>
      </div>}
    </BrutalLayout>
  );
};*/

function App(){
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/onboarding" element={<SmartOnboarding/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/fakeDashboard" element={<DashboardWithLiquidity/>}/>          
          <Route path="/metaDashboard" element={<MetapoolLiquidityDashboard/>}/>
          <Route path="/login" element={<AppIdentityIntegrated/>}/>
          <Route path="/poolAnalytics" element={<LiquidityPoolDashboard/>}/>
        </Routes>
      </Router>
    </NotificationProvider>
  )
}

export default App;