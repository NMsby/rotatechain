/*import React, { useState, useEffect } from 'react';

interface PlugConnectProps {
  onConnect: (principal: string) => void;
}

const PlugConnect: React.FC<PlugConnectProps> = ({ onConnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ic?.plug) {
        const connected = await window.ic.plug.isConnected();
        if (connected) {
          const principal = await window.ic.plug.agent.getPrincipal();
          setPrincipal(principal.toString());
          setIsConnected(true);
          onConnect(principal.toString());
        }
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      if (!window.ic?.plug) {
        window.open("https://plugwallet.ooo/", "_blank");
        return;
      }

      await window.ic.plug.requestConnect({
        whitelist: [process.env.REACT_APP_BITCOIN_WALLET_CANISTER_ID!],
      });

      const principal = await window.ic.plug.agent.getPrincipal();
      setPrincipal(principal.toString());
      setIsConnected(true);
      onConnect(principal.toString());
    } catch (err) {
      console.error("Plug connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {isConnected ? (
        <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="font-medium">Connected: {principal?.slice(0, 8)}...{principal?.slice(-4)}</span>
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

export default PlugConnect;*/