import { useEffect, useState } from 'react'
import { getSiteSettings } from '../../../services/settings'
import type { Currency } from '../../../utils/currency'

let cached: Currency | null = null
let inFlight: Promise<Currency> | null = null

export async function getDefaultCurrency(): Promise<Currency> {
  if (cached) return cached
  if (!inFlight) {
    inFlight = getSiteSettings()
      .then((s) => (s?.donation_default_currency === 'USD' ? 'USD' : 'NPR') as Currency)
      .then((c) => {
        cached = c
        return c
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}

export function useSiteCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>(cached || 'NPR')

  useEffect(() => {
    let active = true
    getDefaultCurrency().then((c) => {
      if (active) setCurrency(c)
    })
    return () => {
      active = false
    }
  }, [])

  return currency
}