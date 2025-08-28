import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export const useChat = () => {
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch conversations
  const fetchConversations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_activity', { ascending: false })
    
    if (!error) setConversations(data)
    setLoading(false)
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (!error) setMessages(data)
  }

  // Send a message
  const sendMessage = async (conversationId, content, type = 'text') => {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          content,
          type,
          user_id: (await supabase.auth.getUser()).data.user.id,
        }
      ])
      .select()
    
    if (!error) {
      setMessages(prev => [...prev, data[0]])
      return data[0]
    }
    throw error
  }

  // Real-time subscription for new messages
  useEffect(() => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
  }
}
