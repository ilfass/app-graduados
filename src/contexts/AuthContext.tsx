import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  isAuthenticated: boolean
  userType: 'admin' | 'graduado' | null
  login: (token: string, type: 'admin' | 'graduado') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState<'admin' | 'graduado' | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const type = localStorage.getItem('userType') as 'admin' | 'graduado' | null
    
    if (token && type) {
      setIsAuthenticated(true)
      setUserType(type)
    }
  }, [])

  const login = (token: string, type: 'admin' | 'graduado') => {
    localStorage.setItem('token', token)
    localStorage.setItem('userType', type)
    setIsAuthenticated(true)
    setUserType(type)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    setIsAuthenticated(false)
    setUserType(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
} 