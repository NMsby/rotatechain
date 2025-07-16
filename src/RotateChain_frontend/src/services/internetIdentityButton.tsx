/*import { AuthClient } from "@dfinity/auth-client";
import { useState } from "react";

const InternetIdentityButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: import.meta.env.DFX_NETWORK === "ic" 
          ? "https://identity.ic0.app" 
          : `http://localhost:4943?canisterId=${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}`,
        onSuccess: () => {
          const identity = authClient.getIdentity();
          // Store identity in AuthContext
        },
      });
    } catch (e) {
      console.error("Login failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogin} 
      disabled={isLoading}
      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
    >
      {isLoading ? "Connecting..." : "Internet Identity Login"}
    </button>
  );
};*/