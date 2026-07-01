import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
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
  build: {
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
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    reportCompressedSize: false,
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
});
