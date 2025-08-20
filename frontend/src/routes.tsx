import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import { GraduadosMap } from './components/GraduadosMap'
import { Busqueda } from './pages/Busqueda'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/admin/ResetPassword'
import NavigationButtons from './components/NavigationButtons'
import { TestPage } from './pages/TestPage'
import GraduadoPublico from './pages/GraduadoPublico'

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/graduado/:id" element={<GraduadoPublico />} />
      </Routes>
      <NavigationButtons />
    </>
  )
}

export default AppRoutes 