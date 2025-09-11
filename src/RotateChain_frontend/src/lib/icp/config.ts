export const canisterIds = {
  rotatechain_backend: process.env.DFX_NETWORK === "ic" 
    ? "trmuc-riaaa-aaaan-qz6dq-cai"
    : "u6s2n-gx777-77774-qaaba-cai", // Your actual local canister ID from deployment
  internet_identity: "rdmx6-jaaaa-aaaaa-aaadq-cai",
  icp_ledger: process.env.DFX_NETWORK === "ic"
    ? "ryjl3-tyaaa-aaaaa-aaaba-cai"
    : "uxrrr-q7777-77774-qaaaq-cai",
};

export const host = process.env.DFX_NETWORK === "ic" 
  ? "https://ic0.app" 
  : "http://localhost:4943";

export const isDevelopment = process.env.NODE_ENV === 'development';
export const useInternetIdentity = process.env.VITE_USE_INTERNET_IDENTITY === 'true';