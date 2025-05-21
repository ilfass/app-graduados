import { Request, Response } from 'express'
import { Graduado } from '../models/Graduado'
import { EmailService } from '../services/emailService'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import axios from 'axios'

// Configuración de multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/fotos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'foto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
}).single('foto');

export const graduadoController = {
  // Registrar un nuevo graduado
  async register(req: Request, res: Response) {
    try {
      console.log('Headers:', req.headers)
      console.log('Body completo:', req.body)
      console.log('Content-Type:', req.headers['content-type'])
      
      const { password, ...restoDatos } = req.body

      if (!password) {
        console.log('Error: Contraseña no proporcionada')
        return res.status(400).json({ error: 'La contraseña es requerida' })
      }

      // Verificar si el email ya existe
      const emailExistente = await Graduado.findOne({ where: { email: restoDatos.email } })
      if (emailExistente) {
        return res.status(400).json({ error: 'El email ya está registrado' })
      }

      // Convertir anio_graduacion a número
      const datosProcesados = {
        ...restoDatos,
        anio_graduacion: parseInt(restoDatos.anio_graduacion)
      }

      console.log('Datos procesados:', { ...datosProcesados, password: '[REDACTED]' })

      const hashedPassword = await bcrypt.hash(password, 10)

      // Crear graduado con la contraseña hasheada
      const graduado = await Graduado.create({
        ...datosProcesados,
        password: hashedPassword,
        estado: 'pendiente' // Estado inicial
      })

      res.status(201).json({ 
        message: 'Registro exitoso',
        graduado: {
          id: graduado.id,
          nombre: graduado.nombre,
          apellido: graduado.apellido,
          email: graduado.email
        }
      })
    } catch (error: any) {
      console.error('Error al registrar graduado:', error)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'El email ya está registrado' })
      }
      res.status(500).json({ error: 'Error al registrar graduado' })
    }
  },

  // Obtener todos los graduados
  async getAll(req: Request, res: Response) {
    try {
      const graduados = await Graduado.findAll({
        attributes: [
          'id', 
          'nombre', 
          'apellido', 
          'email',
          'carrera', 
          'anio_graduacion',
          'ciudad', 
          'pais', 
          'institucion',
          'estado',
          'latitud', 
          'longitud'
        ]
      })
      res.json(graduados)
    } catch (error) {
      console.error('Error al obtener graduados:', error)
      res.status(500).json({ message: 'Error al obtener graduados' })
    }
  },

  // Obtener un graduado por ID
  async getById(req: Request, res: Response) {
    try {
      const graduado = await Graduado.findByPk(req.params.id)
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' })
      }
      res.json(graduado)
    } catch (error) {
      console.error('Error al obtener graduado:', error)
      res.status(500).json({ error: 'Error al obtener graduado' })
    }
  },

  // Actualizar un graduado
  async update(req: Request, res: Response) {
    try {
      const graduado = await Graduado.findByPk(req.params.id)
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' })
      }

      const oldEstado = graduado.estado
      await graduado.update(req.body)

      // Si el estado cambió a aprobado, enviar correo de aprobación
      if (oldEstado !== 'aprobado' && graduado.estado === 'aprobado') {
        await EmailService.sendApprovalEmail(
          graduado.email,
          `${graduado.nombre} ${graduado.apellido}`
        )
      }
      // Si el estado cambió a rechazado, enviar correo de rechazo
      else if (oldEstado !== 'rechazado' && graduado.estado === 'rechazado') {
        await EmailService.sendRejectionEmail(
          graduado.email,
          `${graduado.nombre} ${graduado.apellido}`,
          req.body.motivo_rechazo || 'No se proporcionó un motivo específico'
        )
      }

      res.json(graduado)
    } catch (error) {
      console.error('Error al actualizar graduado:', error)
      res.status(500).json({ error: 'Error al actualizar graduado' })
    }
  },

  // Eliminar un graduado
  async delete(req: Request, res: Response) {
    try {
      const graduado = await Graduado.findByPk(req.params.id)
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' })
      }
      await graduado.destroy()
      res.status(204).send()
    } catch (error) {
      console.error('Error al eliminar graduado:', error)
      res.status(500).json({ error: 'Error al eliminar graduado' })
    }
  },

  // Actualizar estado de un graduado
  async updateEstado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;

      const graduado = await Graduado.findByPk(id);
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' });
      }

      const oldEstado = graduado.estado;
      await graduado.update({ 
        estado,
        observaciones_admin: observaciones 
      });

      // Intentar enviar correo según el estado, pero no fallar si no se puede
      try {
        if (estado === 'aprobado') {
          await EmailService.sendApprovalEmail(
            graduado.email,
            `${graduado.nombre} ${graduado.apellido}`
          );
        } else if (estado === 'rechazado') {
          await EmailService.sendRejectionEmail(
            graduado.email,
            `${graduado.nombre} ${graduado.apellido}`,
            observaciones || 'No se proporcionó un motivo específico'
          );
        }
      } catch (emailError) {
        console.error('Error al enviar correo:', emailError);
        // No fallamos si el correo no se puede enviar
      }

      res.json(graduado);
    } catch (error) {
      console.error('Error al actualizar estado del graduado:', error);
      res.status(500).json({ error: 'Error al actualizar estado del graduado' });
    }
  },

  // Login de graduado
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' })
      }

      const graduado = await Graduado.findOne({ where: { email } })
      if (!graduado) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      const isValidPassword = await bcrypt.compare(password, graduado.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: graduado.id, isAdmin: false },
        env.jwtSecret,
        { expiresIn: '24h' }
      )

      res.json({
        message: 'Login exitoso',
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
      console.error('Error al hacer login:', error)
      res.status(500).json({ error: 'Error al hacer login' })
    }
  },

  // Obtener perfil del graduado
  async getProfile(req: Request, res: Response) {
    try {
      const graduado = await Graduado.findByPk(req.user?.id)
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' })
      }

      res.json({
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
      })
    } catch (error) {
      console.error('Error al obtener perfil:', error)
      res.status(500).json({ error: 'Error al obtener perfil' })
    }
  },

  // Subir foto de perfil
  async uploadPhoto(req: Request, res: Response) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const graduado = await Graduado.findByPk(req.params.id);
        if (!graduado) {
          return res.status(404).json({ error: 'Graduado no encontrado' });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No se proporcionó ninguna foto' });
        }

        // Actualizar la ruta de la foto en la base de datos
        const fotoPath = `/uploads/fotos/${req.file.filename}`;
        await graduado.update({ foto: fotoPath });

        res.json({ 
          message: 'Foto actualizada exitosamente',
          foto: fotoPath
        });
      } catch (error) {
        console.error('Error al subir foto:', error);
        res.status(500).json({ error: 'Error al subir foto' });
      }
    });
  },

  // Actualizar perfil del graduado
  async updateProfile(req: Request, res: Response) {
    try {
      const graduado = await Graduado.findByPk(req.user?.id);
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' });
      }

      const { nombre, apellido, email, carrera, anio_graduacion, ciudad, pais, institucion, linkedin, biografia, latitud, longitud } = req.body;

      await graduado.update({
        nombre,
        apellido,
        email,
        carrera,
        anio_graduacion,
        ciudad,
        pais,
        institucion,
        linkedin,
        biografia,
        latitud,
        longitud
      });

      // Generar nuevo token
      const token = jwt.sign(
        { id: graduado.id, isAdmin: false },
        env.jwtSecret,
        { expiresIn: '24h' }
      );

      res.json({
        ...graduado.toJSON(),
        token
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  },

  // Olvidar contraseña
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const graduado = await Graduado.findOne({ where: { email } });

      if (!graduado) {
        return res.status(404).json({ error: 'No se encontró un graduado con ese email' });
      }

      const token = jwt.sign(
        { id: graduado.id },
        env.jwtSecret,
        { expiresIn: '1h' }
      );

      await EmailService.sendPasswordResetEmail(
        graduado.email,
        `${graduado.nombre} ${graduado.apellido}`,
        token
      );

      res.json({ message: 'Se ha enviado un correo con instrucciones para restablecer la contraseña' });
    } catch (error) {
      console.error('Error al procesar solicitud de restablecimiento de contraseña:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  },

  // Restablecer contraseña
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      const decoded = jwt.verify(token, env.jwtSecret) as { id: number };
      const graduado = await Graduado.findByPk(decoded.id);

      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await graduado.update({ password: hashedPassword });

      res.json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { estado } = req.body

      const graduado = await Graduado.findByPk(id)
      if (!graduado) {
        return res.status(404).json({ message: 'Graduado no encontrado' })
      }

      // Actualizar estado
      graduado.estado = estado

      // Si el estado es aprobado, calcular coordenadas
      if (estado === 'aprobado') {
        try {
          // Construir query para geocodificación
          const query = graduado.institucion 
            ? `${graduado.institucion}, ${graduado.ciudad}, ${graduado.pais}`
            : `${graduado.ciudad}, ${graduado.pais}`

          // Llamar a Nominatim API
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
          )

          if (response.data && response.data.length > 0) {
            graduado.latitud = parseFloat(response.data[0].lat)
            graduado.longitud = parseFloat(response.data[0].lon)
          }
        } catch (error) {
          console.error('Error al obtener coordenadas:', error)
          // Si falla la geocodificación, no actualizamos las coordenadas
        }
      }

      await graduado.save()
      res.json(graduado)
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      res.status(500).json({ message: 'Error al actualizar estado' })
    }
  },
} 