/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_NETWORK_SIMULATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 