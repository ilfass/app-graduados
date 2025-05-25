import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

interface JwtPayload {
  id: number
  isAdmin?: boolean
}

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload
      req.user = decoded

      // Si es una petición PUT a /api/graduados/:id, verificar que el usuario está actualizando su propio perfil
      if (req.method === 'PUT' && req.path.startsWith('/api/graduados/')) {
        const graduadoId = parseInt(req.path.split('/').pop() || '')
        if (graduadoId && graduadoId !== decoded.id && !decoded.isAdmin) {
          return res.status(403).json({ error: 'No tienes permiso para actualizar este perfil' })
        }
      }

      next()
    } catch (jwtError) {
      console.error('Error al verificar token:', jwtError)
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload
      if (!decoded.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado: se requieren privilegios de administrador' })
      }

      req.user = decoded
      next()
    } catch (jwtError) {
      console.error('Error al verificar token:', jwtError)
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 