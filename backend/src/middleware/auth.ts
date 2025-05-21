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

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Error de autenticación' })
  }
}

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Error de autenticación' })
  }
} 