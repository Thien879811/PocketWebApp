import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Type definition for AuthState
interface AuthState {
  user: {
    id: string
    name: string
    email: string
    role: string
  } | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  login: (userData: any, token: string) => void
  logout: () => void
  updateProfile: (data: Partial<{ name: string; email: string }>) => void
}

// Store definition with Persistence (Local Storage)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        localStorage.setItem('token', token)
        set({
          user: userData,
          token: token,
          isAuthenticated: true
        })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null
        }))
    }),
    {
      name: 'auth-storage', // Key for LocalStorage
      storage: createJSONStorage(() => localStorage)
    }
  )
)
