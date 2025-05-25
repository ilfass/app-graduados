import { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiMail, FiLinkedin, FiEdit2, FiCamera, FiX, FiDownload } from 'react-icons/fi';
import { graduadoService } from '../services/api';
import { useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los íconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Cargar la biblioteca de Google Maps
const loadGoogleMapsScript = () => {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  return new Promise((resolve) => {
    script.onload = resolve;
  });
};

interface PerfilGraduado {
  id: number;
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
  foto?: string;
  latitud?: number;
  longitud?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const TARGET_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_WIDTH = 1200; // Ancho máximo de la imagen

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  marginTop: '1rem',
  borderRadius: '0.5rem',
};

const styles = {
  container: {
    padding: '1.25rem',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
  },
  form: {
    padding: '1.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
  },
  formContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontWeight: '500',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    width: '100%',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    width: '100%',
    minHeight: '100px',
  },
  profile: {
    padding: '1.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
  },
  profileContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  profileHeader: {
    display: 'flex',
    gap: '1.5rem',
  },
  avatar: {
    width: '6rem',
    height: '6rem',
    borderRadius: '9999px',
    overflow: 'hidden',
    position: 'relative' as const,
    cursor: 'pointer',
    '&:hover > div': {
      opacity: 1,
    },
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  avatarOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '0.5rem',
    textAlign: 'center' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  career: {
    color: '#3B82F6',
  },
  graduation: {
    color: '#6B7280',
  },
  section: {
    borderTop: '1px solid #E5E7EB',
    paddingTop: '1rem',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  link: {
    color: '#3B82F6',
    textDecoration: 'none',
  },
  bioTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  previewContainer: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  previewContent: {
    background: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    maxWidth: '90%',
    maxHeight: '90%',
    position: 'relative' as const,
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain' as const,
  },
  previewActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  previewButton: {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    color: 'white',
  },
  closeButton: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  },
  compressionInfo: {
    fontSize: '0.875rem',
    color: '#6B7280',
    marginTop: '0.5rem',
    textAlign: 'center' as const,
  },
  mapContainer: {
    marginTop: '1rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  locationInput: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    marginBottom: '0.5rem',
  },
  locationButton: {
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  autocompleteContainer: {
    position: 'relative' as const,
    width: '100%',
  },
  autocompleteInput: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
  },
  autocompleteDropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    marginTop: '0.25rem',
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto' as const,
  },
  autocompleteItem: {
    padding: '0.5rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#F3F4F6',
    },
  },
  exportButton: {
    backgroundColor: '#10B981',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
};

// Componente para manejar eventos del mapa
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Profile = () => {
  const [profile, setProfile] = useState<PerfilGraduado | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PerfilGraduado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token en Profile:', token);
    if (!token) {
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await graduadoService.getProfile();
      console.log('Datos del perfil recibidos:', data);
      setProfile(data);
      setFormData(data);
      if (data.latitud && data.longitud) {
        setSelectedLocation({ lat: data.latitud, lng: data.longitud });
      }
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setLoading(true);
      console.log('Enviando datos de actualización:', formData);
      
      // Asegurarse de que latitud y longitud sean números válidos
      const dataToSend = {
        ...formData,
        latitud: formData.latitud ? Number(formData.latitud) : undefined,
        longitud: formData.longitud ? Number(formData.longitud) : undefined
      };

      const updatedProfile = await graduadoService.updateProfile(formData.id, dataToSend);
      console.log('Perfil actualizado:', updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
      
      // Mostrar mensaje de éxito
      alert('Perfil actualizado con éxito');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setError(error.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    
    setFormData({
      ...formData,
      [name]: value || ''
    });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: TARGET_FILE_SIZE / (1024 * 1024),
      maxWidthOrHeight: MAX_WIDTH,
      useWebWorker: true,
      onProgress: (progress: number) => {
        // Handle compression progress
      },
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error al comprimir la imagen:', error);
      throw new Error('Error al comprimir la imagen');
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    try {
      // Comprimir la imagen si es necesario
      let processedFile = file;
      if (file.size > TARGET_FILE_SIZE) {
        processedFile = await compressImage(file);
      }

      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setSelectedFile(processedFile);
      };
      reader.readAsDataURL(processedFile);
    } catch (err) {
      setError('Error al procesar la imagen');
      console.error(err);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !formData) return;

    try {
      setLoading(true);
      const updatedProfile = await graduadoService.uploadPhoto(formData.id, selectedFile);
      setProfile(updatedProfile);
      setPreviewUrl(null);
      setSelectedFile(null);
      alert('Foto de perfil actualizada con éxito');
    } catch (err) {
      setError('Error al actualizar la foto de perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0 && formData) {
        const { lat, lon, display_name } = data[0];
        setFormData({
          ...formData,
          ciudad: display_name.split(',')[0]?.trim() || '',
          pais: display_name.split(',').slice(-1)[0]?.trim() || '',
          latitud: parseFloat(lat),
          longitud: parseFloat(lon)
        });
        setShowMap(true);
      }
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!formData) return;
    
    console.log('Nueva ubicación seleccionada:', { lat, lng });
    
    setFormData({
      ...formData,
      latitud: lat,
      longitud: lng
    });

    // Guardar automáticamente la nueva ubicación
    handleSubmit(new Event('submit') as any);
  };

  const handleExportData = () => {
    if (!formData) return;

    const data = {
      ...formData,
      fecha_exportacion: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfil_${formData.nombre}_${formData.apellido}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteProfile = async () => {
    try {
      setLoading(true);
      await graduadoService.deleteProfile();
      setProfile(null);
      setFormData(null);
      setError(null);
      alert('Perfil eliminado con éxito');
      // Redirigir al login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al eliminar el perfil:', error);
      setError('Error al eliminar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.container}>Cargando...</div>;
  }

  if (error) {
    return <div style={styles.container}>{error}</div>;
  }

  if (!profile) {
    return <div style={styles.container}>No se encontró el perfil</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Perfil del Graduado</h1>
          <button style={styles.button} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        {isEditing ? (
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.formContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData?.nombre}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData?.apellido}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Carrera</label>
                <input
                  type="text"
                  name="carrera"
                  value={formData?.carrera}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Año de Graduación</label>
                <input
                  type="number"
                  name="anio_graduacion"
                  value={formData?.anio_graduacion}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Institución Actual</label>
                <input
                  type="text"
                  name="institucion"
                  value={formData?.institucion || ''}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Institución donde trabaja o estudia actualmente"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData?.linkedin || ''}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="https://linkedin.com/in/tu-perfil"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Biografía</label>
                <textarea
                  name="biografia"
                  value={formData?.biografia || ''}
                  onChange={handleChange}
                  style={styles.textarea}
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Ubicación</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.input}
                    placeholder="Buscar ubicación..."
                  />
                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    style={styles.button}
                  >
                    Buscar
                  </button>
                </div>
                {formData?.latitud && formData.longitud && (
                  <MapContainer
                    center={[formData.latitud, formData.longitud]}
                    zoom={13}
                    style={mapContainerStyle}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[formData.latitud, formData.longitud]} />
                    <MapEvents onMapClick={handleMapClick} />
                  </MapContainer>
                )}
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro que deseas eliminar tu perfil? Esta acción no se puede deshacer.')) {
                      handleDeleteProfile();
                    }
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    marginRight: '1rem'
                  }}
                >
                  Eliminar Perfil
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={styles.profile}>
            <div style={styles.profileContent}>
              <div style={styles.profileHeader}>
                <div style={styles.avatar} onClick={handlePhotoClick}>
                  <img
                    src={formData?.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${formData?.nombre}+${formData?.apellido}`)}
                    alt="Foto de perfil"
                    style={styles.avatarImage}
                  />
                  <div style={styles.avatarOverlay}>
                    <FiCamera />
                    Cambiar foto
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div style={styles.profileInfo}>
                  <h2 style={styles.name}>{`${formData?.nombre} ${formData?.apellido}`}</h2>
                  <p style={styles.career}>{formData?.carrera}</p>
                  <p style={styles.graduation}>Graduado en {formData?.anio_graduacion}</p>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.bioTitle}>Información de Contacto</h3>
                <div style={styles.contactInfo}>
                  <div style={styles.contactItem}>
                    <FiMail />
                    <a href={`mailto:${formData?.email}`} style={styles.link}>
                      {formData?.email}
                    </a>
                  </div>
                  {formData?.linkedin && (
                    <div style={styles.contactItem}>
                      <FiLinkedin />
                      <a
                        href={formData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  <div style={styles.contactItem}>
                    <FiMapPin />
                    <span>
                      {formData?.ciudad}, {formData?.pais}
                    </span>
                  </div>
                  {formData?.institucion && (
                    <div style={styles.contactItem}>
                      <FiMapPin />
                      <span>Institución Actual: {formData.institucion}</span>
                    </div>
                  )}
                </div>
              </div>

              {formData?.biografia && (
                <div style={styles.section}>
                  <h3 style={styles.bioTitle}>Biografía</h3>
                  <p>{formData.biografia}</p>
                </div>
              )}

              {formData?.latitud && formData.longitud && (
                <div style={styles.section}>
                  <h3 style={styles.bioTitle}>Ubicación</h3>
                  <MapContainer
                    center={[formData.latitud, formData.longitud]}
                    zoom={13}
                    style={mapContainerStyle}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[formData.latitud, formData.longitud]} />
                  </MapContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {previewUrl && (
        <div style={styles.previewContainer}>
          <div style={styles.previewContent}>
            <img
              src={previewUrl}
              alt="Vista previa"
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleConfirmUpload}
                style={{
                  ...styles.button,
                  backgroundColor: '#10B981',
                }}
                disabled={loading}
              >
                {loading ? 'Subiendo...' : 'Confirmar'}
              </button>
              <button
                onClick={handleCancelUpload}
                style={{
                  ...styles.button,
                  backgroundColor: '#EF4444',
                }}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Profile; 