import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Usuario } from '../types'

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  isAutenticado: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem('admin_usuario')
    return raw ? (JSON.parse(raw) as Usuario) : null
  })
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('admin_token')
  )

  function login(newToken: string, newUsuario: Usuario) {
    localStorage.setItem('admin_token', newToken)
    localStorage.setItem('admin_usuario', JSON.stringify(newUsuario))
    setToken(newToken)
    setUsuario(newUsuario)
  }

  function logout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAutenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
