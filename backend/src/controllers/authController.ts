import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Graduado } from '../models/Graduado'
import { AdministradorModel } from '../models/Administrador'
import { TokenModel } from '../models/Token'
import bcrypt from 'bcrypt'
import { env } from '../config/env'

export const authController = {
  // Login de graduado
  async loginGraduado(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      console.log('Intentando login de graduado con email:', email)

      const graduado = await Graduado.findOne({ where: { email } })
      if (!graduado) {
        console.log('Graduado no encontrado')
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, graduado.password)
      if (!isValidPassword) {
        console.log('Contraseña inválida')
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      const token = jwt.sign({ id: graduado.id, isAdmin: false }, env.jwtSecret, { expiresIn: '24h' })
      console.log('Token generado exitosamente para graduado')

      // Guardar el token en la base de datos
      await TokenModel.create({
        graduado_id: graduado.id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
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
      console.error('Error en login de graduado:', error)
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

      const token = jwt.sign({ id: admin.id, isAdmin: true }, env.jwtSecret, { expiresIn: '24h' })
      console.log('Token generado exitosamente para admin')

      res.json({ 
        token, 
        admin: { 
          id: admin.id, 
          email: admin.email 
        } 
      })
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
      console.error('Error en logout:', error)
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
      console.error('Error al verificar token:', error)
      res.status(500).json({ error: 'Error al verificar el token' })
    }
  }
} 