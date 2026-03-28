import { create } from 'zustand'
import { supabase } from '@/utils/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  setSession: (session: Session | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isInitialized: false,

  initialize: async () => {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
      isInitialized: true
    })

    // Setup listener
    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({
        session: newSession,
        user: newSession?.user || null,
        isAuthenticated: !!newSession
      })
    })
  },

  setSession: (session) => {
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({
      user: null,
      session: null,
      isAuthenticated: false
    })
  }
}))
