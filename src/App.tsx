import { ChakraProvider, ChakraTheme } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import NavigationButtons from './components/NavigationButtons'
import Home from './pages/Home'
import Register from './pages/Register'
import RegisterSuccess from './pages/RegisterSuccess'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import { GraduadosMap } from './components/GraduadosMap'
import { Busqueda } from './pages/Busqueda'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/admin/ResetPassword'
import { TestPage } from './pages/TestPage'
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
                <Route path="/register-success" element={<RegisterSuccess />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Home />} />
                
                {/* Rutas protegidas para administradores */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute requiredUserType="admin">
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/reset-password"
                  element={
                    <ProtectedRoute requiredUserType="admin">
                      <ResetPassword />
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
                <Route path="/test" element={<TestPage />} />
              </Routes>
            </Box>
            <NavigationButtons />
          </Box>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  )
}

export default App
