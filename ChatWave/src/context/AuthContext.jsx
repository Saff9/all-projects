import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null)
        setLoading(false)
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
  }

  const signInAsGuest = async () => {
    const guestEmail = `guest_${Date.now()}@chatwave.demo`
    const guestPassword = Math.random().toString(36).slice(-12)

    const { data, error } = await supabase.auth.signUp({
      email: guestEmail,
      password: guestPassword,
      options: {
        data: {
          is_guest: true,
          display_name: 'Guest User',
        }
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
