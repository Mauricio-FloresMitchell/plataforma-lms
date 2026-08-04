/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del Web App de Apps Script del Generador de Matrículas (termina en /exec). */
  readonly VITE_APPS_SCRIPT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
