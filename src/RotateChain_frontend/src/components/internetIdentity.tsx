import React, { useState, useEffect, Dispatch, SetStateAction, useReducer } from 'react';
import { AuthClient} from '@dfinity/auth-client';
import LoginPage from './loginpage';
import { UserData } from './../types';
import SmartOnboarding from './onboarding_new';
import { Chain } from './rotate_dashboard_graph_payment';
import { Actor, ActorSubclass } from '@dfinity/agent';
import { SplashScreen } from './sassySplash';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './../state/hooks';
import { update } from './../state/slice';
import { createActor,canisterId} from "../../../declarations/chain_management"
import { CreateChainParams,_SERVICE } from '../../../declarations/chain_management/chain_management.did';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';

const identityProvider = 'https://identity.ic0.app'

function App() {
  const reducer = useAppDispatch()
  const [chainActorState,setChainActorState] = useState<ActorSubclass<_SERVICE> | null >(null)
  const [authClient,setAuthClient] = useState<AuthClient | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chainData,setChainData] = useState<Chain>()
  const navigate = useNavigate()
  


  const updateActor = async () => {

    /*const authClient = await AuthClient.create();
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

    setChainActorState(actor)
    setAuthClient(authClient)
    //setPrincipal(tempPrincipal)
    */
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

  useEffect(() => {
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
  }, []);
  
  const handleLoginInside = (principal: string) => {
    setUserData({
      principal,
      username: `user_${principal.substring(0, 8)}`,
      lastLogin: new Date().toLocaleString()
    });
    setIsLoggedIn(true);

    handleLogin()
  };
  
  const handleLogoutInside = async () => {
    if (authClient) {
      await authClient.logout();
    }
    setIsLoggedIn(false);
    setUserData(null);

    handleLogout()
  };

  if (isLoading) {
    return (
      <SplashScreen onFinish={() => setIsLoading(false)}/>
    );
  }
  if(isLoggedIn && userData){
    //navigate("/join")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {isLoggedIn && userData ? (
        
        <SmartOnboarding />
        /*<Dashboard userData={userData} onLogout={handleLogout} />*/
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App;