/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_NETWORK_SIMULATION: string
  readonly VITE_SHOW_FPS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 