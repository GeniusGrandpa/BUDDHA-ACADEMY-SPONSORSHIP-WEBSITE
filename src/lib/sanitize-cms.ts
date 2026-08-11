export function sanitizeCmsText(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  let out = value
  out = out.replace(/^```[^\n]*\n?/, '')
  out = out.replace(/\n?```\s*$/, '')
  out = out.replace(/```/g, '')
  return out
}

export function sanitizeCmsTextOptional(value: string | null | undefined): string | null {
  if (!value) return value ?? null
  return sanitizeCmsText(value)
}