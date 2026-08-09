import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', '@supabase/supabase-js', 'framer-motion', 'clsx', 'tailwind-merge'],
      exclude: [],
    },
    build: {
          outDir: 'dist',
          modulePreload: {
            polyfill: true,
            resolveDependencies: (_filename, deps) =>
              deps.filter((dep) => !/\/pdf-|\/animation-|\/charts-|\/editor-|\/dnd-/.test(dep.replace(/\\/g, '/'))),
          },
          rollupOptions: {
            output: {
              manualChunks(id: string) {
                const normalized = id.replace(/\\/g, '/')
                if (normalized.includes('node_modules/react/') || normalized.includes('node_modules/react-dom/') || normalized.includes('node_modules/react-router-dom/')) return 'vendor';
                if (normalized.includes('node_modules/@tanstack/react-query')) return 'query';
                if (normalized.includes('node_modules/framer-motion')) return 'animation';
                if (normalized.includes('node_modules/recharts')) return 'charts';
                if (normalized.includes('node_modules/@tiptap')) return 'editor';
                if (normalized.includes('node_modules/html2canvas/') || normalized.includes('node_modules/jspdf')) return 'pdf';
                if (normalized.includes('node_modules/@hello-pangea/dnd')) return 'dnd';
                if (normalized.includes('node_modules/lucide-react')) return 'icons';
              },
            },
          },
          chunkSizeWarningLimit: 650,
          sourcemap: false,
          reportCompressedSize: false,
    },
    server: {
      host: true,
      port: 5174,
      strictPort: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  }
});
