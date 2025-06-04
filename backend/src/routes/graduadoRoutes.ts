import { Router } from 'express'
import { graduadoController } from '../controllers/graduadoController'
import { auth, adminAuth } from '../middleware/auth'

const router = Router()

// Rutas públicas
router.post('/register', graduadoController.register)
router.post('/login', graduadoController.login)
router.get('/mapa', graduadoController.getForMap)

// Rutas protegidas
router.use(auth)

// Rutas protegidas para graduados
router.get('/profile', graduadoController.getProfile)
router.put('/:id', graduadoController.update)
router.post('/:id/foto', graduadoController.uploadPhoto)
router.delete('/profile', graduadoController.deleteProfile)

// Rutas de administrador
router.get('/', adminAuth, graduadoController.getAll)
router.get('/:id', adminAuth, graduadoController.getById)
router.put('/:id/estado', adminAuth, graduadoController.updateEstado)
router.put('/:id/reset-password', adminAuth, graduadoController.resetPassword)
router.delete('/:id', adminAuth, graduadoController.delete)

// Nueva ruta para actualizar estado y calcular coordenadas
router.put('/:id/status', graduadoController.updateStatus)

export default router 