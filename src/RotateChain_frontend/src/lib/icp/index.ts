// ICP integration utilities
export * from './canisterService'
export * from './userService'

// Re-export common ICP types and utilities
export { Principal } from '@dfinity/principal'
export { Actor, HttpAgent } from '@dfinity/agent'
export type { Identity } from '@dfinity/agent'