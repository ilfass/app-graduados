import { Request, Response } from 'express'
import { AdministradorModel } from '../models/Administrador'
import { Graduado } from '../models/Graduado'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const adminController = {
  // Crear un nuevo administrador
  async create(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      // Verificar si el email ya está registrado
      const existingAdmin = await AdministradorModel.findByEmail(email)
      if (existingAdmin) {
        return res.status(400).json({ error: 'El email ya está registrado' })
      }

      const admin = await AdministradorModel.create({ 
        email, 
        password,
        nombre: 'Admin', // Valor por defecto
        apellido: 'Default' // Valor por defecto
      })
      res.status(201).json({ id: admin.id, email: admin.email })
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el administrador' })
    }
  },

  // Obtener todos los administradores
  async getAll(req: Request, res: Response) {
    try {
      // TODO: Implementar cuando se necesite
      res.status(501).json({ error: 'No implementado' })
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los administradores' })
    }
  },

  // Actualizar contraseña de administrador
  async updatePassword(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const { currentPassword, newPassword } = req.body

      const admin = await AdministradorModel.findByEmail(req.body.email)
      if (!admin) {
        return res.status(404).json({ error: 'Administrador no encontrado' })
      }

      const isValidPassword = await AdministradorModel.verifyPassword(admin, currentPassword)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' })
      }

      const success = await AdministradorModel.updatePassword(id, newPassword)
      if (!success) {
        return res.status(404).json({ error: 'Administrador no encontrado' })
      }

      res.json({ message: 'Contraseña actualizada correctamente' })
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la contraseña' })
    }
  },

  // Eliminar un administrador
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const success = await AdministradorModel.delete(id)

      if (!success) {
        return res.status(404).json({ error: 'Administrador no encontrado' })
      }

      res.json({ message: 'Administrador eliminado correctamente' })
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el administrador' })
    }
  },

  // Endpoint para estadísticas del dashboard
  async dashboardStats(req: Request, res: Response) {
    try {
      // Total graduados
      const totalGraduados = await Graduado.count();
      
      // Graduados por estado
      const graduadosAprobados = await Graduado.count({
        where: { estado: 'aprobado' }
      });
      
      const graduadosPendientes = await Graduado.count({
        where: { estado: 'pendiente' }
      });
      
      const graduadosRechazados = await Graduado.count({
        where: { estado: 'rechazado' }
      });

      res.json({
        totalGraduados,
        graduadosAprobados,
        graduadosPendientes,
        graduadosRechazados
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      const admin = await AdministradorModel.findByEmail(email)
      if (!admin) {
        return res.status(401).json({ message: 'Credenciales inválidas' })
      }

      const isValidPassword = await bcrypt.compare(password, admin.password)
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' })
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      )

      res.json({ token })
    } catch (error) {
      console.error('Error en login:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
} 