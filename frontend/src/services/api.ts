import axios from 'axios';

// La URL de la API se configura a través de la variable de entorno VITE_API_URL
// En desarrollo: VITE_API_URL=/api
// En producción: VITE_API_URL=/api (a través del Ingress)
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    console.log('Token agregado a la petición:', token);
  } else {
    console.log('No se encontró token en localStorage');
  }
  return config;
}, (error) => {
  console.error('Error en el interceptor de request:', error);
  return Promise.reject(error);
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.status);
    return response;
  },
  (error) => {
    console.error('Error en la respuesta:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Solo redirigir al login si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
  lugar_trabajo?: string;
  area_desempeno?: string;
  sector_trabajo?: string;
  vinculado_unicen?: boolean;
  areas_vinculacion?: string;
  interes_proyectos?: boolean;
  linkedin?: string;
  biografia?: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  foto?: string;
  documento_identidad?: string;
  observaciones_admin?: string;
  latitud?: number;
  longitud?: number;
  created_at?: string;
  updated_at?: string;
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
      // Asegurarse de que latitud y longitud sean números válidos
      const dataToSend = {
        ...data,
        latitud: data.latitud ? Number(data.latitud) : undefined,
        longitud: data.longitud ? Number(data.longitud) : undefined
      };

      // Validar que los datos sean válidos antes de enviar
      if (dataToSend.latitud && (isNaN(dataToSend.latitud) || dataToSend.latitud < -90 || dataToSend.latitud > 90)) {
        throw new Error('Latitud inválida');
      }
      if (dataToSend.longitud && (isNaN(dataToSend.longitud) || dataToSend.longitud < -180 || dataToSend.longitud > 180)) {
        throw new Error('Longitud inválida');
      }

      console.log('Enviando petición de actualización:', {
        url: `${API_URL}/graduados/${id}`,
        data: dataToSend
      });

      const response = await api.put(`/graduados/${id}`, dataToSend);
      
      console.log('Respuesta del servidor:', response.data);

      // Actualizar el token si se recibe uno nuevo
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Error en la actualización del perfil:', error);
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

  // Obtener graduados para el mapa (ruta pública)
  getForMap: async () => {
    const response = await api.get('/graduados/mapa');
    return response.data;
  },

  deleteProfile: async () => {
    const response = await api.delete('/graduados/profile');
    return response.data;
  }
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

  getGraduadoById: async (id: number) => {
    const response = await api.get(`/admin/graduados/${id}`);
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

  updateGraduadoObservaciones: async (id: number, observaciones: string) => {
    const response = await api.put(`/admin/graduados/${id}/observaciones`, { observaciones });
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