import nodemailer from 'nodemailer'
import { env } from '../config/env'

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass
  }
})

export class EmailService {
  // Enviar correo de registro exitoso
  static async sendRegistrationEmail(email: string, nombre: string, datos: any) {
    const mailOptions = {
      from: env.smtp.from,
      to: email,
      subject: 'Registro Exitoso - Red de Graduados UNICEN',
      html: `
        <h1>¡Bienvenido a la Red de Graduados UNICEN!</h1>
        <p>Hola ${nombre},</p>
        <p>Tu registro ha sido recibido exitosamente en Internacionales.unicen.edu.ar como graduado.</p>
        <p>Datos de tu registro:</p>
        <ul>
          <li>Nombre: ${datos.nombre} ${datos.apellido}</li>
          <li>Email: ${datos.email}</li>
          <li>Carrera: ${datos.carrera}</li>
          <li>Año de graduación: ${datos.anio_graduacion}</li>
          <li>Ciudad: ${datos.ciudad}</li>
          <li>País: ${datos.pais}</li>
        </ul>
        <p>Estamos procesando tu solicitud y te notificaremos cuando sea aprobada.</p>
        <p>Puedes acceder a la plataforma en: <a href="${env.frontendUrl}">${env.frontendUrl}</a></p>
        <p>Saludos cordiales,<br>Equipo de la Red de Graduados UNICEN</p>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Error al enviar correo de registro:', error)
      throw error
    }
  }

  // Enviar correo de aprobación
  static async sendApprovalEmail(email: string, nombre: string) {
    const mailOptions = {
      from: env.smtp.from,
      to: email,
      subject: 'Registro Aprobado - Red de Graduados UNICEN',
      html: `
        <h1>¡Tu registro ha sido aprobado!</h1>
        <p>Hola ${nombre},</p>
        <p>Nos complace informarte que tu registro en la Red de Graduados UNICEN ha sido aprobado.</p>
        <p>Ahora puedes acceder a todas las funcionalidades de la plataforma y conectarte con otros graduados.</p>
        <p>Saludos cordiales,<br>Equipo de la Red de Graduados UNICEN</p>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Error al enviar correo de aprobación:', error)
      throw error
    }
  }

  // Enviar correo de rechazo
  static async sendRejectionEmail(email: string, nombre: string, motivo: string) {
    const mailOptions = {
      from: env.smtp.from,
      to: email,
      subject: 'Registro Rechazado - Red de Graduados UNICEN',
      html: `
        <h1>Información sobre tu registro</h1>
        <p>Hola ${nombre},</p>
        <p>Lamentamos informarte que tu registro en la Red de Graduados UNICEN ha sido rechazado.</p>
        <p>Motivo: ${motivo}</p>
        <p>Si consideras que esto es un error, por favor contáctanos para revisar tu caso.</p>
        <p>Saludos cordiales,<br>Equipo de la Red de Graduados UNICEN</p>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Error al enviar correo de rechazo:', error)
      throw error
    }
  }

  // Enviar correo de recuperación de contraseña
  static async sendPasswordResetEmail(email: string, nombre: string, resetToken: string) {
    const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`
    const mailOptions = {
      from: env.smtp.from,
      to: email,
      subject: 'Recuperación de Contraseña - Red de Graduados UNICEN',
      html: `
        <h1>Recuperación de Contraseña</h1>
        <p>Hola ${nombre},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Para continuar con el proceso, haz clic en el siguiente enlace:</p>
        <p><a href="${resetUrl}">Restablecer Contraseña</a></p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>Saludos cordiales,<br>Equipo de la Red de Graduados UNICEN</p>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error)
      throw error
    }
  }
} 