// ICP-specific type definitions
// TODO: Add Internet Identity and canister types

export interface Principal {
  toString(): string;
}

export interface ICPTransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Placeholder for future ICP integration
export type CanisterMethods = Record<string, any>;