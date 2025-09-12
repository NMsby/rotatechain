export const canisterIds = {
  rotatechain_backend: import.meta.env.DFX_NETWORK === "ic" 
    ? "trmuc-riaaa-aaaan-qz6dq-cai"
    : "u6s2n-gx777-77774-qaaba-cai", // Your actual local canister ID from deployment
  internet_identity: "rdmx6-jaaaa-aaaaa-aaadq-cai",
  icp_ledger: import.meta.env.DFX_NETWORK === "ic"
    ? "ryjl3-tyaaa-aaaaa-aaaba-cai"
    : "uxrrr-q7777-77774-qaaaq-cai",
};

export const host = import.meta.env.DFX_NETWORK === "ic" 
  ? "https://ic0.app" 
  : "http://localhost:4943";

export const isDevelopment = import.meta.env.MODE === 'development';
export const useInternetIdentity = import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true';

// Debug logging
console.log('🔧 ICP Configuration:');
console.log('- Network:', import.meta.env.DFX_NETWORK);
console.log('- Host:', host);
console.log('- Backend Canister:', canisterIds.rotatechain_backend);
console.log('- Use Internet Identity:', useInternetIdentity);