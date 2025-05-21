import { Router } from 'express'
import { adminController } from '../controllers/adminController'
import { adminAuth } from '../middleware/auth'
import { graduadoController } from '../controllers/graduadoController'

const router = Router()

// Todas las rutas requieren autenticación de administrador
router.use(adminAuth)

router.post('/', adminController.create)
router.get('/', adminController.getAll)
router.put('/:id/password', adminController.updatePassword)
router.delete('/:id', adminController.delete)

// Ruta para estadísticas del dashboard
router.get('/dashboard-stats', adminController.dashboardStats)

// Ruta para obtener todos los graduados (solo admin)
router.get('/graduados', graduadoController.getAll)

export default router 