interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly VITE_APP_TITLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';
