import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function devSsrMiddleware(): Plugin {
  return {
    name: 'dev-ssr',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '/').split('?')[0]
        if (req.method !== 'GET') return next()
        if (url !== '/' && (url.includes('.') || url.startsWith('/@') || url.startsWith('/src/') || url.startsWith('/node_modules/'))) {
          return next()
        }

        try {
          const { render } = await server.ssrLoadModule('/src/entry-server.tsx')
          let template = readFileSync(new URL('./index.html', import.meta.url), 'utf-8')
          template = await server.transformIndexHtml(url, template)
          const appUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host || `localhost:${server.config.server.port}`}${url}`
          const result = await render(appUrl, template)
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(result.html)
        } catch (err) {
          server.ssrFixStacktrace(err as Error)
          console.error('Dev SSR render error:', err)
          next(err)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const isSsrBuild = mode === 'ssr' || process.env.SSR_BUILD === 'true'

  return {
    plugins: [react(), devSsrMiddleware()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', '@supabase/supabase-js', 'framer-motion', 'clsx', 'tailwind-merge'],
      exclude: [],
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
          modulePreload: {
            polyfill: true,
            resolveDependencies: (_filename, deps) =>
              deps.filter((dep) => !/\/pdf-|\/animation-|\/charts-|\/editor-|\/dnd-/.test(dep)),
          },
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
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  }
});
