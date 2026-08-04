const IS_PROD = import.meta.env.PROD

export const logger = {
  debug(...args: unknown[]) {
    if (!IS_PROD) console.debug('[debug]', ...args)
  },
  info(...args: unknown[]) {
    if (!IS_PROD) console.info('[info]', ...args)
  },
  warn(...args: unknown[]) {
    if (!IS_PROD) console.warn('[warn]', ...args)
  },
  error(...args: unknown[]) {
    console.error('[error]', ...args)
  },
}
