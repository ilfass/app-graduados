import { Router } from 'express'
import { graduadoController } from '../controllers/graduadoController'
import { auth, adminAuth } from '../middleware/auth'

const router = Router()

// Rutas públicas
router.post('/register', graduadoController.register)
router.post('/login', graduadoController.login)

// Rutas protegidas
router.get('/profile', auth, graduadoController.getProfile)
router.put('/profile', auth, graduadoController.updateProfile)
router.post('/:id/foto', auth, graduadoController.uploadPhoto)

// Rutas de administrador
router.get('/', adminAuth, graduadoController.getAll)
router.get('/:id', adminAuth, graduadoController.getById)
router.put('/:id', adminAuth, graduadoController.update)
router.put('/:id/estado', adminAuth, graduadoController.updateEstado)
router.delete('/:id', adminAuth, graduadoController.delete)

// Nueva ruta para actualizar estado y calcular coordenadas
router.put('/:id/status', graduadoController.updateStatus)

export default router 