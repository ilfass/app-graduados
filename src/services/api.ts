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
  institucion?: string;
  linkedin?: string;
  biografia?: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  foto?: string;
  documento_identidad?: string;
  observaciones_admin?: string;
  latitud?: number;
  longitud?: number;
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
      const response = await api.post('/auth/login/graduado', { email, password })
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
    institucion?: string;
    linkedin?: string;
    biografia?: string;
    latitud?: number;
    longitud?: number;
  }) => {
    try {
      const response = await api.put(`/graduados/profile`, data);
      // Actualizar el token si se recibe uno nuevo
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },

  resetPassword: async (id: number, newPassword: string) => {
    const response = await api.put(`/graduados/${id}/reset-password`, { newPassword })
    return response.data
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

  getAll: async () => {
    const response = await api.get('/graduados');
    // Filtrar solo graduados aprobados con coordenadas válidas
    const graduadosValidos = response.data.filter((g: Graduado) => 
      g.estado === 'aprobado' && 
      typeof g.latitud === 'number' && 
      typeof g.longitud === 'number' &&
      !isNaN(g.latitud) && 
      !isNaN(g.longitud)
    );
    console.log('Graduados válidos:', graduadosValidos);
    return { data: graduadosValidos };
  },
};

export const adminService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login/admin', { email, password });
    return response.data;
  },

  getGraduados: async () => {
    const response = await api.get('/admin/graduados');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },

  updateGraduadoStatus: async (id: number, estado: 'aprobado' | 'rechazado') => {
    const response = await api.put(`/graduados/${id}/estado`, { estado });
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