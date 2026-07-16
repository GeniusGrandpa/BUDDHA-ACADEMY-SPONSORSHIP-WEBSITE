import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
  const isSsrBuild = mode === 'ssr' || process.env.SSR_BUILD === 'true'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['lucide-react'],
    },
    build: isSsrBuild
      ? {
          outDir: 'dist/server',
          ssr: 'src/entry-server.tsx',
          rollupOptions: {
            input: 'src/entry-server.tsx',
            output: {
              entryFileNames: 'entry-server.mjs',
              format: 'esm',
            },
          },
          sourcemap: false,
          reportCompressedSize: false,
        }
      : {
          outDir: 'dist/client',
          rollupOptions: {
            output: {
              manualChunks(id: string) {
                if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) return 'vendor';
                if (id.includes('node_modules/@tanstack/react-query')) return 'query';
                if (id.includes('node_modules/framer-motion')) return 'animation';
                if (id.includes('node_modules/recharts')) return 'charts';
                if (id.includes('node_modules/@tiptap')) return 'editor';
                if (id.includes('node_modules/html2canvas/') || id.includes('node_modules/jspdf')) return 'pdf';
                if (id.includes('node_modules/@hello-pangea/dnd')) return 'dnd';
                if (id.includes('node_modules/lucide-react')) return 'icons';
              },
            },
          },
          chunkSizeWarningLimit: 650,
          sourcemap: false,
          reportCompressedSize: false,
        },
    ssr: {
      noExternal: ['framer-motion', '@supabase/ssr', 'clsx', 'tailwind-merge'],
    },
    server: {
      host: true,
      port: 5174,
      strictPort: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  }
});
