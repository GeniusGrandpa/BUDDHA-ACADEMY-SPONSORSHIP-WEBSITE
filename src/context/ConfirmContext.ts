import { createContext, useContext } from 'react'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmContextValue {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>
}

export const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: async () => false,
})

export function useConfirm() {
  const { confirm } = useContext(ConfirmContext)
  return { confirm }
}