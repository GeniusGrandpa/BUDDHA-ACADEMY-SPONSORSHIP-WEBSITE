import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import { PassThrough } from 'stream'
import { routeDefinitions } from './routes'
import { createQueryClient } from './lib/query-client'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { CmsStringsProvider } from './context/CmsStringsContext'
import { SiteBranding } from './components/SiteBranding'
import './index.css'

export interface SsrResult {
  html: string
}

const handler = createStaticHandler(routeDefinitions)

export async function render(_url: string, template: string): Promise<SsrResult> {
  const fetchRequest = new Request(_url)
  const context = await handler.query(fetchRequest)

  if (context instanceof Response) {
    return { html: template }
  }

  const router = createStaticRouter(handler.dataRoutes, context)

  const helmetContext: Record<string, unknown> = {}

  // A fresh QueryClient per request prevents cache/data leakage across
  // requests and unbounded memory growth on the server.
  const queryClient = createQueryClient()

  const app = (
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ThemeProvider>
                <SiteBranding />
                <CmsStringsProvider>
                  <StaticRouterProvider router={router} context={context} />
                </CmsStringsProvider>
              </ThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </HelmetProvider>
    </React.StrictMode>
  )

  return new Promise<SsrResult>((resolve, reject) => {
    let didError = false
    const chunks: string[] = []
    const writable = new PassThrough()

    writable.on('data', (chunk: Buffer) => {
      chunks.push(chunk.toString('utf-8'))
    })

    writable.on('end', () => {
      const appHtml = chunks.join('')

      const helmet = (helmetContext as { helmet?: { title: { toString: () => string }; meta: { toString: () => string }; link: { toString: () => string } } }).helmet
      let headHtml = ''
      if (helmet) {
        headHtml = [
          helmet.title.toString(),
          helmet.meta.toString(),
          helmet.link.toString(),
        ].join('')
      }

      const html = template
        .replace('<!--ssr-outlet-->', () => appHtml)
        .replace('</head>', (match) => `${headHtml}${match}`)

      resolve({ html })
    })

    writable.on('error', (err: Error) => {
      if (!didError) {
        didError = true
        reject(err)
      }
    })

    const { pipe } = renderToPipeableStream(app, {
      bootstrapScripts: [],
      onShellReady() {
        pipe(writable)
      },
      onShellError(err: unknown) {
        if (!didError) {
          didError = true
          reject(err instanceof Error ? err : new Error(String(err)))
        }
      },
      onError(err: unknown) {
        if (!didError) {
          didError = true
          reject(err instanceof Error ? err : new Error(String(err)))
        }
      },
    })
  })
}
