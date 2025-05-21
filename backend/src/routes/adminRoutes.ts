import { Router } from 'express'
import { adminController } from '../controllers/adminController'
import { adminAuth } from '../middleware/auth'

const router = Router()

// Todas las rutas requieren autenticación de administrador
router.use(adminAuth)

router.post('/', adminController.create)
router.get('/', adminController.getAll)
router.put('/:id/password', adminController.updatePassword)
router.delete('/:id', adminController.delete)

export default router 