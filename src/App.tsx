import { ChakraProvider, ChakraTheme } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import { Home } from './pages/Home'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import { GraduadosMap } from './components/GraduadosMap'
import { Busqueda } from './pages/Busqueda'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import theme from './theme'

const App = () => {
  return (
    <ChakraProvider theme={theme as ChakraTheme}>
      <Router>
        <AuthProvider>
          <Box minH="100vh">
            <Navbar />
            <Box as="main">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Rutas protegidas para administradores */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute requiredUserType="admin">
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas protegidas para graduados */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requiredUserType="graduado">
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas públicas */}
                <Route path="/mapa" element={<GraduadosMap />} />
                <Route path="/busqueda" element={<Busqueda />} />
              </Routes>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  )
}

export default App
