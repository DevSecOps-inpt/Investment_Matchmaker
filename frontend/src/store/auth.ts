import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  role: 'FOUNDER' | 'INVESTOR' | 'ADMIN'
  isVerified: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  login: (user: User) => void
  logout: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      theme: 'system',

      login: (user: User) => set({ user, isAuthenticated: true }),
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme })
        // Apply theme to document
        const root = document.documentElement
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          root.classList.toggle('dark', systemTheme === 'dark')
        } else {
          root.classList.toggle('dark', theme === 'dark')
        }
      },

      toggleTheme: () => {
        const current = get().theme
        const newTheme = current === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        theme: state.theme 
      }),
    }
  )
)

// Initialize theme on app start
if (typeof window !== 'undefined') {
  const { theme } = useAuthStore.getState()
  useAuthStore.getState().setTheme(theme)
}
