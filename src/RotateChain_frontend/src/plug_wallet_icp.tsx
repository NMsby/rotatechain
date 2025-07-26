import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';


interface PlugConnectProps {
  onConnect: (principal: string, accountId: string) => void;
  network: 'mainnet' | 'testnet';
  setIsWalletConnected:Dispatch<SetStateAction<boolean>> ;
}

const PlugConnect: React.FC<PlugConnectProps> = ({setIsWalletConnected, onConnect, network }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState<string | undefined>();
  const [accountId, setAccountId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ic?.plug) {
        const connected = window.ic.plug.isConnected();
        
        if (connected) {
          const innerPrincipal = window.ic.plug.principalId;
          const innerAccountId = window.ic.plug.accountId;
          setIsWalletConnected(true)
          
          if(innerPrincipal && innerAccountId){
            setPrincipal(innerPrincipal.toString());
            setIsConnected(true);
            onConnect(innerPrincipal.toString(), toHexString(innerAccountId));
          }
        }
      }
    };

    checkConnection();
  }, [onConnect]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      if (!window.ic?.plug) {
        window.open("https://plugwallet.ooo/", "_blank");
        return;
      }

      let identity = await window.ic.plug.requestConnect({
        whitelist: [import.meta.env.VITE_REACT_APP_PAYMENT_CANISTER_ID],
        host: network === 'testnet' 
          ? 'https://ic0.app' 
          : 'https://mainnet.ic0.app'
        
        /*whitelist:["ulvla-h7777-77774-qaacq-cai"],
        host: network === 'testnet' 
          ? 'https://ic0.app' 
          : 'https://mainnet.ic0.app'*/
      })

      if(identity && window.ic.plug.isConnected){

        const innerPrincipalId = window.ic.plug.principalId;
        const innerAccountId = window.ic.plug.accountId;
    
          
        setPrincipal(innerPrincipalId)
        setAccountId(innerAccountId)


        setPrincipal(innerPrincipalId.toString());
        setIsConnected(true);
        setIsWalletConnected(true)

        onConnect(innerPrincipalId.toString(), toHexString(innerAccountId));

      }


    } catch (err) {
      console.error("Plug connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toHexString = (bytes: Uint8Array) => {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  };

  return (
    <div className="flex flex-col items-center">
      {isConnected ? (
        <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="font-medium">{principal?.slice(0, 8)}...{principal?.slice(-4)}</span>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className={`flex items-center px-6 py-3 rounded-full font-medium text-white ${
            loading ? 'bg-gray-500' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
          } transition-all duration-200 shadow-lg`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Connect Plug Wallet
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default PlugConnect;