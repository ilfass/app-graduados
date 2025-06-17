import { Graduado } from '../models/Graduado';
import bcrypt from 'bcrypt';

const graduados = [
  {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    password: 'password123',
    carrera: 'Ingeniería en Sistemas',
    anio_graduacion: 2020,
    ciudad: 'New York',
    pais: 'USA',
    latitud: 40.7128,
    longitud: -74.0060,
    estado: 'aprobado'
  },
  {
    nombre: 'María',
    apellido: 'García',
    email: 'maria.garcia@example.com',
    password: 'password123',
    carrera: 'Licenciatura en Economía',
    anio_graduacion: 2019,
    ciudad: 'Paris',
    pais: 'France',
    latitud: 48.8566,
    longitud: 2.3522,
    estado: 'aprobado'
  },
  {
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@example.com',
    password: 'password123',
    carrera: 'Medicina',
    anio_graduacion: 2021,
    ciudad: 'Tokyo',
    pais: 'Japan',
    latitud: 35.6762,
    longitud: 139.6503,
    estado: 'aprobado'
  },
  {
    nombre: 'Ana',
    apellido: 'Martínez',
    email: 'ana.martinez@example.com',
    password: 'password123',
    carrera: 'Derecho',
    anio_graduacion: 2018,
    ciudad: 'London',
    pais: 'UK',
    latitud: 51.5074,
    longitud: -0.1278,
    estado: 'aprobado'
  },
  {
    nombre: 'Pedro',
    apellido: 'López',
    email: 'pedro.lopez@example.com',
    password: 'password123',
    carrera: 'Arquitectura',
    anio_graduacion: 2022,
    ciudad: 'Sydney',
    pais: 'Australia',
    latitud: -33.8688,
    longitud: 151.2093,
    estado: 'aprobado'
  },
  {
    nombre: 'Laura',
    apellido: 'Sánchez',
    email: 'laura.sanchez@example.com',
    password: 'password123',
    carrera: 'Psicología',
    anio_graduacion: 2019,
    ciudad: 'Mexico City',
    pais: 'Mexico',
    latitud: 19.4326,
    longitud: -99.1332,
    estado: 'aprobado'
  },
  {
    nombre: 'Diego',
    apellido: 'Fernández',
    email: 'diego.fernandez@example.com',
    password: 'password123',
    carrera: 'Ingeniería Civil',
    anio_graduacion: 2020,
    ciudad: 'São Paulo',
    pais: 'Brazil',
    latitud: -23.5505,
    longitud: -46.6333,
    estado: 'aprobado'
  },
  {
    nombre: 'Sofía',
    apellido: 'González',
    email: 'sofia.gonzalez@example.com',
    password: 'password123',
    carrera: 'Biología',
    anio_graduacion: 2021,
    ciudad: 'Moscow',
    pais: 'Russia',
    latitud: 55.7558,
    longitud: 37.6173,
    estado: 'aprobado'
  },
  {
    nombre: 'Miguel',
    apellido: 'Torres',
    email: 'miguel.torres@example.com',
    password: 'password123',
    carrera: 'Física',
    anio_graduacion: 2018,
    ciudad: 'New Delhi',
    pais: 'India',
    latitud: 28.6139,
    longitud: 77.2090,
    estado: 'aprobado'
  },
  {
    nombre: 'Valentina',
    apellido: 'Ramírez',
    email: 'valentina.ramirez@example.com',
    password: 'password123',
    carrera: 'Química',
    anio_graduacion: 2022,
    ciudad: 'Nairobi',
    pais: 'Kenya',
    latitud: -1.2921,
    longitud: 36.8219,
    estado: 'aprobado'
  }
];

async function createGraduados() {
  try {
    for (const graduado of graduados) {
      const hashedPassword = await bcrypt.hash(graduado.password, 10);
      
      await Graduado.create({
        ...graduado,
        password: hashedPassword
      });
      
      console.log(`Graduado creado: ${graduado.nombre} ${graduado.apellido} en ${graduado.ciudad}, ${graduado.pais}`);
    }
    
    console.log('✅ Todos los graduados fueron creados exitosamente');
  } catch (error) {
    console.error('❌ Error al crear los graduados:', error);
  }
}

createGraduados(); 