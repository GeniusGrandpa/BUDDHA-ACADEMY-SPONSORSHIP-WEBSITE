import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import { PassThrough } from 'stream'
import { routeDefinitions } from './routes'
import { createQueryClient } from './lib/query-client'
import { LanguageProvider } from './context/LanguageProvider'
import { TranslationProvider } from './context/TranslationProvider'
import { AuthProvider } from './features/auth/providers/AuthProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { CmsStringsProvider } from './context/CmsStringsProvider'
import { ConfirmProvider } from './context/ConfirmProvider'
import { SiteBranding } from './components/SiteBranding'
import { parseLanguageCookie } from './lib/locale'
import './index.css'

export interface SsrResult {
  html: string
  status: number
}

const handler = createStaticHandler(routeDefinitions)

export async function render(_url: string, template: string, cookieHeader?: string): Promise<SsrResult> {
  const initialLanguage = parseLanguageCookie(cookieHeader)
  const fetchRequest = new Request(_url)
  const context = await handler.query(fetchRequest)

  if (context === null) {
    return { html: template, status: 404 }
  }

  if (context instanceof Response) {
    return { html: template, status: context.status }
  }

  const isNotFound = Array.isArray(context.matches) && context.matches.some((match) => match.route.path === '*')

  const router = createStaticRouter(handler.dataRoutes, context)

  const helmetContext: Record<string, unknown> = {}

  const queryClient = createQueryClient()

  const app = (
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <LanguageProvider initialLanguage={initialLanguage}>
          <TranslationProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ThemeProvider>
                <SiteBranding />
                <CmsStringsProvider>
                  <ConfirmProvider>
                    <StaticRouterProvider router={router} context={context} />
                  </ConfirmProvider>
                </CmsStringsProvider>
              </ThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
          </TranslationProvider>
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

      resolve({ html, status: isNotFound ? 404 : 200 })
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
