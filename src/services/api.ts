import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Graduado {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  carrera: string;
  anio_graduacion: number;
  ciudad: string;
  pais: string;
  institucion: string;
  linkedin?: string;
  biografia?: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  foto?: string;
  documento_identidad?: string;
  observaciones_admin?: string;
}

export const graduadoService = {
  register: async (data: any) => {
    try {
      const response = await api.post('/graduados/register', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error en el registro:', error)
      throw error
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/graduados/login', { email, password })
      return response.data
    } catch (error) {
      console.error('Error en el login:', error)
      throw error
    }
  },

  getProfile: async () => {
    const response = await api.get('/graduados/profile');
    return response.data;
  },

  updateProfile: async (id: number, data: {
    nombre: string;
    apellido: string;
    email: string;
    carrera: string;
    anio_graduacion: number;
    ciudad: string;
    pais: string;
    linkedin?: string;
    biografia?: string;
  }) => {
    const response = await api.put(`/graduados/${id}`, data);
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  uploadPhoto: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('foto', file);

    const response = await api.post(`/graduados/${id}/foto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadDocument: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('documento', file);

    const response = await api.post(`/graduados/${id}/documento`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const adminService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },

  getGraduados: async () => {
    const response = await api.get('/admin/graduados');
    return response.data;
  },

  updateGraduadoStatus: async (id: number, estado: 'aprobado' | 'rechazado') => {
    const response = await api.put(`/admin/graduados/${id}`, { estado });
    return response.data;
  },

  deleteGraduado: async (id: number) => {
    const response = await api.delete(`/admin/graduados/${id}`);
    return response.data;
  },

  getGraduadosPendientes: async () => {
    const response = await api.get('/admin/graduados/pendientes');
    return response.data;
  },

  validarGraduado: async (id: number, data: {
    estado: 'aprobado' | 'rechazado';
    observaciones: string;
  }) => {
    const response = await api.put(`/admin/graduados/${id}/validar`, data);
    return response.data;
  },

  getDocumentosGraduado: async (id: number) => {
    const response = await api.get(`/admin/graduados/${id}/documentos`);
    return response.data;
  },
}; 