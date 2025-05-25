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
import { Op } from 'sequelize'

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

// Función auxiliar para geocodificación
async function getCoordinates(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    console.log(`Intentando obtener coordenadas para: "${query}"`);
    
    // Configurar opciones de la petición
    const options = {
      timeout: 5000, // Reducir el timeout a 5 segundos
      headers: {
        'User-Agent': 'GraduadosUNICEN/1.0',
        'Accept-Language': 'es,en'
      },
      params: {
        q: query,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        countrycodes: 'ar,us,ca,mx,br,cl,pe,co,ec,uy,py,bo,ve,es,fr,de,it,uk,jp,cn,au,nz,za,ng,eg,ma,sa,ae,in,id,my,sg,th,vn,ph,kr,jp,tw,hk'
      }
    };

    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      options
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log(`Coordenadas encontradas para "${query}":`, {
        lat: result.lat,
        lon: result.lon,
        display_name: result.display_name
      });
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      };
    }
    
    console.log(`No se encontraron coordenadas para "${query}"`);
    return null;
  } catch (error) {
    console.error(`Error al buscar coordenadas para "${query}":`, error);
    return null;
  }
}

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

      // Enviar correo de registro exitoso
      try {
        await EmailService.sendRegistrationEmail(
          graduado.email,
          `${graduado.nombre} ${graduado.apellido}`,
          datosProcesados
        )
      } catch (error) {
        console.error('Error al enviar correo de registro:', error)
        // No fallamos el registro si falla el envío del correo
      }

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
      console.log('Obteniendo todos los graduados...');
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
      console.log('Graduados encontrados en la base de datos:', graduados);
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
      console.log('Recibida petición de actualización:', {
        id: req.params.id,
        body: req.body
      });

      const graduado = await Graduado.findByPk(req.params.id);
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' });
      }

      const oldEstado = graduado.estado;
      const oldLatitud = graduado.latitud;
      const oldLongitud = graduado.longitud;

      // Asegurarse de que latitud y longitud sean números válidos
      const dataToUpdate = {
        ...req.body,
        latitud: req.body.latitud ? Number(req.body.latitud) : undefined,
        longitud: req.body.longitud ? Number(req.body.longitud) : undefined
      };

      // Validar coordenadas si se proporcionan
      if (dataToUpdate.latitud && (isNaN(dataToUpdate.latitud) || dataToUpdate.latitud < -90 || dataToUpdate.latitud > 90)) {
        return res.status(400).json({ error: 'Latitud inválida' });
      }
      if (dataToUpdate.longitud && (isNaN(dataToUpdate.longitud) || dataToUpdate.longitud < -180 || dataToUpdate.longitud > 180)) {
        return res.status(400).json({ error: 'Longitud inválida' });
      }

      await graduado.update(dataToUpdate);

      console.log('Graduado actualizado:', {
        id: graduado.id,
        oldLatitud,
        oldLongitud,
        newLatitud: graduado.latitud,
        newLongitud: graduado.longitud
      });

      // Si el estado cambió a aprobado, enviar correo de aprobación
      if (oldEstado !== 'aprobado' && graduado.estado === 'aprobado') {
        await EmailService.sendApprovalEmail(
          graduado.email,
          `${graduado.nombre} ${graduado.apellido}`
        );
      }
      // Si el estado cambió a rechazado, enviar correo de rechazo
      else if (oldEstado !== 'rechazado' && graduado.estado === 'rechazado') {
        await EmailService.sendRejectionEmail(
          graduado.email,
          `${graduado.nombre} ${graduado.apellido}`,
          req.body.motivo_rechazo || 'No se proporcionó un motivo específico'
        );
      }

      // Emitir evento de actualización si las coordenadas cambiaron
      if (oldLatitud !== graduado.latitud || oldLongitud !== graduado.longitud) {
        const io = req.app.get('io');
        if (io) {
          io.emit('graduadoActualizado', {
            id: graduado.id,
            latitud: graduado.latitud,
            longitud: graduado.longitud
          });
        }
      }

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
      console.error('Error al actualizar graduado:', error);
      res.status(500).json({ error: 'Error al actualizar graduado' });
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

      console.log('Actualizando estado del graduado:', { id, estado, observaciones });

      const graduado = await Graduado.findByPk(id);
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' });
      }

      const oldEstado = graduado.estado;
      
      // Si el estado cambia a aprobado y no tiene coordenadas, intentar obtenerlas
      if (estado === 'aprobado' && oldEstado !== 'aprobado' && (!graduado.latitud || !graduado.longitud)) {
        try {
          // Construir diferentes queries para intentar obtener las coordenadas
          const queries = [
            // Query más específica
            graduado.institucion ? `${graduado.institucion}, ${graduado.ciudad}, ${graduado.pais}` : null,
            // Query con ciudad y país
            `${graduado.ciudad}, ${graduado.pais}`,
            // Query solo con ciudad
            graduado.ciudad,
            // Query solo con país
            graduado.pais
          ].filter((query): query is string => query !== null);

          console.log('Intentando obtener coordenadas con las siguientes queries:', queries);

          let coordsObtenidas = false;
          for (const query of queries) {
            try {
              const coords = await getCoordinates(query);
              if (coords) {
                console.log(`Coordenadas obtenidas para "${query}":`, coords);
                await graduado.update({
                  estado,
                  observaciones_admin: observaciones,
                  latitud: coords.lat,
                  longitud: coords.lon
                });
                coordsObtenidas = true;
                break;
              }
            } catch (error) {
              console.error(`Error al obtener coordenadas para "${query}":`, error);
              continue;
            }
          }

          if (!coordsObtenidas) {
            console.log('No se pudieron obtener coordenadas para ninguna de las queries');
            // Actualizar solo el estado si no se pudieron obtener coordenadas
            await graduado.update({ 
              estado,
              observaciones_admin: observaciones 
            });
          }
        } catch (error) {
          console.error('Error en el proceso de geocodificación:', error);
          // Actualizar solo el estado si falló la geocodificación
          await graduado.update({ 
            estado,
            observaciones_admin: observaciones 
          });
        }
      } else {
        // Si no se actualizó la ubicación o no es necesario, actualizar solo el estado
        await graduado.update({ 
          estado,
          observaciones_admin: observaciones 
        });
      }

      // Recargar el graduado para obtener los datos actualizados
      const graduadoActualizado = await Graduado.findByPk(id);
      console.log('Graduado actualizado:', graduadoActualizado);

      res.json(graduadoActualizado);
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

      if (ciudad !== graduado.ciudad || pais !== graduado.pais || institucion !== graduado.institucion || latitud !== graduado.latitud || longitud !== graduado.longitud) {
        try {
          // Si se proporcionaron coordenadas directamente, usarlas
          if (latitud && longitud) {
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

            // Emitir evento de actualización
            const io = req.app.get('io');
            if (io) {
              io.emit('graduadoActualizado', {
                id: graduado.id,
                latitud,
                longitud
              });
            }

            const token = jwt.sign(
              { id: graduado.id, isAdmin: false },
              env.jwtSecret,
              { expiresIn: '24h' }
            );

            return res.json({
              ...graduado.toJSON(),
              token
            });
          }

          // Si no se proporcionaron coordenadas, intentar geocodificar
          const queries = [
            institucion ? `${institucion}, ${ciudad}, ${pais}` : null,
            `${ciudad}, ${pais}`,
            pais
          ].filter((query): query is string => query !== null);

          console.log('Intentando obtener coordenadas con las siguientes queries:', queries);

          for (const query of queries) {
            const coords = await getCoordinates(query);
            if (coords) {
              console.log(`Coordenadas obtenidas para "${query}":`, coords);
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
                latitud: coords.lat,
                longitud: coords.lon
              });

              // Emitir evento de actualización
              const io = req.app.get('io');
              if (io) {
                io.emit('graduadoActualizado', {
                  id: graduado.id,
                  latitud: coords.lat,
                  longitud: coords.lon
                });
              }

              const token = jwt.sign(
                { id: graduado.id, isAdmin: false },
                env.jwtSecret,
                { expiresIn: '24h' }
              );

              return res.json({
                ...graduado.toJSON(),
                token
              });
            }
          }

          console.log('No se pudieron obtener coordenadas para ninguna de las queries');
        } catch (error) {
          console.error('Error en el proceso de geocodificación:', error);
        }
      }

      // Si no se actualizó la ubicación o falló la geocodificación, actualizar sin coordenadas
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
        biografia
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
      const { id } = req.params
      const { newPassword } = req.body

      if (!newPassword) {
        return res.status(400).json({ message: 'La nueva contraseña es requerida' })
      }

      const graduado = await Graduado.findByPk(id)
      if (!graduado) {
        return res.status(404).json({ message: 'Graduado no encontrado' })
      }

      // Encriptar la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      // Actualizar la contraseña
      await graduado.update({ password: hashedPassword })

      res.json({ message: 'Contraseña actualizada correctamente' })
    } catch (error) {
      console.error('Error al restablecer contraseña:', error)
      res.status(500).json({ message: 'Error al restablecer la contraseña' })
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

      // Guardar cambios en la base de datos
      await graduado.save()

      // Intentar enviar correo según el estado, pero no fallar si no se puede
      try {
        if (estado === 'aprobado') {
          await EmailService.sendApprovalEmail(
            graduado.email,
            `${graduado.nombre} ${graduado.apellido}`
          )
        } else if (estado === 'rechazado') {
          await EmailService.sendRejectionEmail(
            graduado.email,
            `${graduado.nombre} ${graduado.apellido}`,
            'No se proporcionó un motivo específico'
          )
        }
      } catch (emailError) {
        console.error('Error al enviar correo:', emailError)
        // No fallamos si el correo no se puede enviar
      }

      res.json(graduado)
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      res.status(500).json({ message: 'Error al actualizar estado' })
    }
  },

  // Obtener graduados para el mapa (ruta pública)
  async getForMap(req: Request, res: Response) {
    try {
      const graduados = await Graduado.findAll({
        where: {
          estado: 'aprobado',
          latitud: {
            [Op.not]: null
          },
          longitud: {
            [Op.not]: null
          }
        },
        attributes: ['id', 'nombre', 'apellido', 'carrera', 'ciudad', 'pais', 'institucion', 'anio_graduacion', 'latitud', 'longitud']
      });

      console.log('Graduados filtrados para el mapa:', graduados);
      res.json(graduados);
    } catch (error) {
      console.error('Error al obtener graduados para el mapa:', error);
      res.status(500).json({ error: 'Error al obtener graduados para el mapa' });
    }
  },

  async deleteProfile(req: Request, res: Response) {
    try {
      const graduadoId = req.user?.id;
      
      if (!graduadoId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const graduado = await Graduado.findByPk(graduadoId);
      
      if (!graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado' });
      }

      await graduado.destroy();
      res.json({ message: 'Perfil eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar el perfil:', error);
      res.status(500).json({ error: 'Error al eliminar el perfil' });
    }
  }
} 