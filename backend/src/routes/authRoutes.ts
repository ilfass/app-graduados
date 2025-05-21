import { Router } from 'express'
import { authController } from '../controllers/authController'
import { auth } from '../middleware/auth'

const router = Router()

// Rutas públicas
router.post('/login/graduado', authController.loginGraduado)
router.post('/login/admin', authController.loginAdmin)
router.post('/verify', authController.verifyToken)

// Rutas protegidas
router.post('/logout', auth, authController.logout)

export default router 