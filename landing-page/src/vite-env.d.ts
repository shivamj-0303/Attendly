/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_PANEL_URL: string
  readonly VITE_IS_PREVIEW: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
