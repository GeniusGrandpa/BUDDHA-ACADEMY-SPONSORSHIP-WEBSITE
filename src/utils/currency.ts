export type Currency = 'NPR' | 'USD'

export function formatCurrency(amount: number, currency: Currency = 'NPR'): string {
  return `${currency} ${amount.toLocaleString('en-US')}`
}

export function formatNPR(amount: number): string {
  return formatCurrency(amount, 'NPR')
}
