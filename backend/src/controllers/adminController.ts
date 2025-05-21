import { Request, Response } from 'express'
import { AdministradorModel } from '../models/Administrador'
import { Graduado } from '../models/Graduado'

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

      const admin = await AdministradorModel.create({ email, password })
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
  async dashboardStats(req, res) {
    try {
      // Total graduados
      const totalGraduados = await Graduado.count();
      // Total países distintos
      const totalPaises = await Graduado.count({ distinct: true, col: 'pais' });
      // Total carreras distintas
      const totalCarreras = await Graduado.count({ distinct: true, col: 'carrera' });

      res.json({
        totalGraduados,
        totalPaises,
        totalCarreras
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
    }
  }
} 