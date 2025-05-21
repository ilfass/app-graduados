import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Graduado } from '../models/Graduado'
import { AdministradorModel } from '../models/Administrador'
import { TokenModel } from '../models/Token'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authController = {
  // Login de graduado
  async loginGraduado(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      const graduado = await Graduado.findOne({ where: { email } })
      if (!graduado) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, graduado.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      const token = jwt.sign({ id: graduado.id }, JWT_SECRET, { expiresIn: '24h' })

      // Guardar el token en la base de datos
      await TokenModel.create({
        graduado_id: graduado.id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        updated_at: new Date()
      })

      res.json({ 
        token, 
        graduado: {
          id: graduado.id,
          nombre: graduado.nombre,
          apellido: graduado.apellido,
          email: graduado.email,
          carrera: graduado.carrera,
          anio_graduacion: graduado.anio_graduacion,
          ciudad: graduado.ciudad,
          pais: graduado.pais,
          institucion: graduado.institucion,
          estado: graduado.estado
        }
      })
    } catch (error) {
      console.error('Error en login:', error)
      res.status(500).json({ error: 'Error en el inicio de sesión' })
    }
  },

  // Login de administrador
  async loginAdmin(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      console.log('Intentando login de admin con email:', email)

      const admin = await AdministradorModel.findByEmail(email)
      console.log('Admin encontrado:', admin ? 'Sí' : 'No')

      if (!admin) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      const isValidPassword = await AdministradorModel.verifyPassword(admin, password)
      console.log('Contraseña válida:', isValidPassword ? 'Sí' : 'No')

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      const token = jwt.sign({ id: admin.id, isAdmin: true }, JWT_SECRET, { expiresIn: '24h' })
      console.log('Token generado exitosamente')

      res.json({ token, admin: { id: admin.id, email: admin.email } })
    } catch (error) {
      console.error('Error en login de admin:', error)
      res.status(500).json({ error: 'Error en el inicio de sesión' })
    }
  },

  // Logout
  async logout(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '')
      if (token) {
        await TokenModel.delete(token)
      }
      res.json({ message: 'Sesión cerrada correctamente' })
    } catch (error) {
      res.status(500).json({ error: 'Error al cerrar sesión' })
    }
  },

  // Verificar token
  async verifyToken(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '')
      if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' })
      }

      const isValid = await TokenModel.isValid(token)
      if (!isValid) {
        return res.status(401).json({ error: 'Token inválido' })
      }

      res.json({ valid: true })
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar el token' })
    }
  }
} 