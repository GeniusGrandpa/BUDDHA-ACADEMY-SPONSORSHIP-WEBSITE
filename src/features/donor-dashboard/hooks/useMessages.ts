import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { SupportTicket, TicketMessage } from '../../../types/features'
interface MessagesState {
  tickets: SupportTicket[]
  messages: TicketMessage[]
  loading: boolean
}

interface MessagesReturn extends MessagesState {
  createTicket: (subject: string) => Promise<void>
  sendMessage: (ticketId: string, message: string) => Promise<void>
  resolveTicket: (ticketId: string) => Promise<void>
}

export function useMessages(userId: string | undefined): MessagesReturn {
  const [state, setState] = useState<MessagesState>({
    tickets: [],
    messages: [],
    loading: true,
  })

  const fetchTickets = useCallback(async () => {
    if (!userId) {
      setState({ tickets: [], messages: [], loading: false })
      return
    }

    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (ticketsError) throw ticketsError

      const ticketIds = (ticketsData || []).map(t => t.id)
      let messagesData: TicketMessage[] = []

      if (ticketIds.length > 0) {
        const { data: msgs, error: msgsError } = await supabase
          .from('ticket_messages')
          .select('*')
          .in('ticket_id', ticketIds)
          .order('created_at', { ascending: true })

        if (!msgsError) {
          messagesData = (msgs || []) as TicketMessage[]
        }
      }

      setState({
        tickets: (ticketsData || []) as SupportTicket[],
        messages: messagesData,
        loading: false,
      })
    } catch {
      setState({
        tickets: [],
        messages: [],
        loading: false,
      })
    }
  }, [userId])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const createTicket = useCallback(async (subject: string) => {
    if (!userId) return

    const optimistic: SupportTicket = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      subject,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      tickets: [optimistic, ...prev.tickets],
    }))

    try {
      await supabase
        .from('support_tickets')
        .insert({ user_id: userId, subject, status: 'open' })
      await fetchTickets()
    } catch {
      await fetchTickets()
    }
  }, [userId, fetchTickets])

  const sendMessage = useCallback(async (ticketId: string, message: string) => {
    if (!userId) return

    const optimistic: TicketMessage = {
      id: `temp-${Date.now()}`,
      ticket_id: ticketId,
      sender_id: userId,
      message,
      created_at: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, optimistic],
    }))

    try {
      await supabase
        .from('ticket_messages')
        .insert({ ticket_id: ticketId, sender_id: userId, message })

      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId)

      await fetchTickets()
    } catch {
      await fetchTickets()
    }
  }, [userId, fetchTickets])

  const resolveTicket = useCallback(async (ticketId: string) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t =>
        t.id === ticketId ? { ...t, status: 'resolved' as const, updated_at: new Date().toISOString() } : t
      ),
    }))

    try {
      await supabase
        .from('support_tickets')
        .update({ status: 'resolved', updated_at: new Date().toISOString() })
        .eq('id', ticketId)
      await fetchTickets()
    } catch {
      await fetchTickets()
    }
  }, [fetchTickets])

  return {
    tickets: state.tickets,
    messages: state.messages,
    loading: state.loading,
    createTicket,
    sendMessage,
    resolveTicket,
  }
}
