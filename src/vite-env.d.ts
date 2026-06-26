declare module '*.jpg' { const src: string; export default src }
declare module '*.jpeg' { const src: string; export default src }
declare module '*.png' { const src: string; export default src }
declare module '*.svg' { const src: string; export default src }
declare module '*.gif' { const src: string; export default src }
declare module '*.webp' { const src: string; export default src }
declare module '*.ico' { const src: string; export default src }

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PUBLIC_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
