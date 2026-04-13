import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
  initializeTheme: () => void
}

// Get initial theme from system preferences
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: getInitialTheme(),
      toggleTheme: () => set((state) => {
        const newDarkMode = !state.isDarkMode
        applyTheme(newDarkMode)
        return { isDarkMode: newDarkMode }
      }),
      setTheme: (isDark) => {
        applyTheme(isDark)
        set({ isDarkMode: isDark })
      },
      initializeTheme: () => {
        const isDark = getInitialTheme()
        applyTheme(isDark)
        set({ isDarkMode: isDark })
      },
    }),
    {
      name: 'pocket-flow-theme',
    }
  )
)

// Helper function to apply theme to DOM
const applyTheme = (isDark: boolean) => {
  if (typeof window === 'undefined') return
  
  const htmlElement = document.documentElement
  
  if (isDark) {
    htmlElement.classList.add('dark')
  } else {
    htmlElement.classList.remove('dark')
  }
}
