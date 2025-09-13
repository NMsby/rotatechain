// Canister-specific type definitions
// TODO: Generate from Candid files

export interface BackendCanister {
  healthCheck: () => Promise<boolean>;
  // Add other canister methods as needed
}

// Placeholder for future canister integration
export type CanisterConfig = {
  canisterId: string;
  host: string;
};