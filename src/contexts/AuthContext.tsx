import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  isAuthenticated: boolean
  userType: 'admin' | 'graduado' | null
  login: (token: string, type: 'admin' | 'graduado') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Tiempo de expiración de la sesión (24 horas en milisegundos)
const SESSION_EXPIRATION = 24 * 60 * 60 * 1000

// Función para verificar la sesión
const checkSession = () => {
  const token = localStorage.getItem('token')
  const type = localStorage.getItem('userType') as 'admin' | 'graduado' | null
  const lastLogin = localStorage.getItem('lastLogin')
  
  if (token && type && lastLogin) {
    const now = new Date().getTime()
    const loginTime = parseInt(lastLogin)
    
    if (now - loginTime < SESSION_EXPIRATION) {
      return { isValid: true, type }
    }
  }
  return { isValid: false, type: null }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const { isValid } = checkSession()
    return isValid
  })
  
  const [userType, setUserType] = useState<'admin' | 'graduado' | null>(() => {
    const { type } = checkSession()
    return type
  })
  
  const navigate = useNavigate()

  useEffect(() => {
    const { isValid, type } = checkSession()
    setIsAuthenticated(isValid)
    setUserType(type)

    if (!isValid) {
      localStorage.removeItem('token')
      localStorage.removeItem('userType')
      localStorage.removeItem('lastLogin')
    }

    const interval = setInterval(() => {
      const { isValid, type } = checkSession()
      if (!isValid) {
        setIsAuthenticated(false)
        setUserType(null)
        localStorage.removeItem('token')
        localStorage.removeItem('userType')
        localStorage.removeItem('lastLogin')
        navigate('/login')
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [navigate])

  const login = (token: string, type: 'admin' | 'graduado') => {
    const now = new Date().getTime()
    localStorage.setItem('token', token)
    localStorage.setItem('userType', type)
    localStorage.setItem('lastLogin', now.toString())
    setIsAuthenticated(true)
    setUserType(type)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    localStorage.removeItem('lastLogin')
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
} 