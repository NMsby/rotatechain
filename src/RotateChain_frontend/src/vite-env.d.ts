/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_ROTATECHAIN_BACKEND_CANISTER_ID?: string
  readonly VITE_USE_MOCK_AUTH?: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}