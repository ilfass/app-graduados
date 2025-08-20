import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { useEffect, useState, useRef, useMemo } from 'react'
import { Box, Text, VStack, IconButton, useToast } from '@chakra-ui/react'
import { graduadoService } from '../services/api'
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import { io } from 'socket.io-client'

// Corregir el problema con los íconos de Leaflet
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Ícono personalizado para clusters
const clusterIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [30, 46], // Ligeramente más grande
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
  shadowSize: [46, 46],
  className: 'cluster-marker' // Clase CSS personalizada
})

interface Graduado {
  id: number
  nombre: string
  apellido: string
  carrera: string
  ciudad: string
  pais: string
  latitud: number
  longitud: number
  anio_graduacion: number
  institucion?: string
  estado: string
  foto?: string
  lugar_trabajo?: string
  biografia?: string
}

// Función para agrupar graduados por ubicación
const groupGraduadosByLocation = (graduados: Graduado[]) => {
  const groups = new Map<string, Graduado[]>()
  
  graduados.forEach(graduado => {
    // Crear una clave única para la ubicación (redondeada a 4 decimales para agrupar cercanos)
    const latKey = Math.round(graduado.latitud * 10000) / 10000
    const lngKey = Math.round(graduado.longitud * 10000) / 10000
    const locationKey = `${latKey},${lngKey}`
    
    if (!groups.has(locationKey)) {
      groups.set(locationKey, [])
    }
    groups.get(locationKey)!.push(graduado)
  })
  
  return groups
}

// Función para calcular offset de posición para marcadores superpuestos
const calculateOffset = (index: number, total: number, baseLat: number, baseLng: number) => {
  if (total === 1) {
    return { lat: baseLat, lng: baseLng }
  }
  
  // Calcular offset en forma de círculo
  const radius = 0.0001 // Aproximadamente 10 metros
  const angle = (index * 2 * Math.PI) / total
  const offsetLat = baseLat + radius * Math.cos(angle)
  const offsetLng = baseLng + radius * Math.sin(angle)
  
  return { lat: offsetLat, lng: offsetLng }
}

export const GraduadosMap = () => {
  const [graduados, setGraduados] = useState<Graduado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const socketRef = useRef<any>(null)

  const fetchGraduados = async () => {
    try {
      const response = await graduadoService.getForMap()
      console.log('Respuesta del servidor:', response)
      if (response && Array.isArray(response)) {
        setGraduados(response)
      } else {
        setError('Error en el formato de los datos')
      }
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar graduados:', err)
      setError('Error al cargar los graduados')
      setLoading(false)
    }
  }

  // Procesar graduados para el mapa con clustering
  const processedGraduados = useMemo(() => {
    const groups = groupGraduadosByLocation(graduados)
    const processed: Array<{
      graduados: Graduado[]
      position: { lat: number; lng: number }
      isCluster: boolean
    }> = []
    
    groups.forEach((groupGraduados, locationKey) => {
      const [baseLat, baseLng] = locationKey.split(',').map(Number)
      
      if (groupGraduados.length === 1) {
        // Un solo graduado en esta ubicación
        processed.push({
          graduados: groupGraduados,
          position: { lat: baseLat, lng: baseLng },
          isCluster: false
        })
      } else {
        // Múltiples graduados en la misma ubicación
        groupGraduados.forEach((graduado, index) => {
          const offset = calculateOffset(index, groupGraduados.length, baseLat, baseLng)
          processed.push({
            graduados: [graduado],
            position: offset,
            isCluster: true
          })
        })
      }
    })
    
    return processed
  }, [graduados])

  // Calcular estadísticas
  const stats = useMemo(() => {
    const groups = groupGraduadosByLocation(graduados)
    const totalLocations = groups.size
    const sharedLocations = Array.from(groups.values()).filter(group => group.length > 1).length
    const totalGraduados = graduados.length
    
    return {
      totalLocations,
      sharedLocations,
      totalGraduados,
      uniqueLocations: totalLocations - sharedLocations
    }
  }, [graduados])

  // Cargar graduados inicialmente
  useEffect(() => {
    fetchGraduados()

    // Configurar Socket.IO usando la variable de entorno VITE_SOCKET_URL
    // En desarrollo: VITE_SOCKET_URL=/socket.io
    // En producción: VITE_SOCKET_URL=/socket.io (a través del Ingress)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/socket.io';
    socketRef.current = io(socketUrl);

    // Escuchar actualizaciones de graduados
    socketRef.current.on('graduadoActualizado', (data: { id: number; latitud: number; longitud: number }) => {
      setGraduados(prevGraduados => 
        prevGraduados.map(graduado => 
          graduado.id === data.id 
            ? { ...graduado, latitud: data.latitud, longitud: data.longitud }
            : graduado
        )
      )

      toast({
        title: 'Ubicación actualizada',
        description: 'La ubicación del graduado ha sido actualizada en el mapa',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Text>Cargando mapa...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Text color="red.500">{error}</Text>
      </Box>
    )
  }

  return (
    <Box w="100%" h="100%" position="relative" minH="400px">
      {/* Panel de estadísticas */}
      <Box
        position="absolute"
        top={4}
        left={4}
        zIndex={1000}
        bg="white"
        p={3}
        borderRadius="lg"
        boxShadow="md"
        maxW="300px"
      >
        <VStack spacing={2} align="stretch">
          <Text fontSize="sm" fontWeight="bold" color="gray.700">
            Estadísticas del Mapa
          </Text>
          <Box fontSize="xs" color="gray.600">
            <Text>Total graduados: <strong>{stats.totalGraduados}</strong></Text>
            <Text>Ubicaciones únicas: <strong>{stats.uniqueLocations}</strong></Text>
            <Text>Ubicaciones compartidas: <strong>{stats.sharedLocations}</strong></Text>
            {stats.sharedLocations > 0 && (
              <Text color="blue.600" fontWeight="semibold">
                💡 Haz clic en los marcadores azules para ver graduados en la misma ubicación
              </Text>
            )}
          </Box>
        </VStack>
      </Box>

      <IconButton
        aria-label={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
        icon={isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
        position="absolute"
        top={4}
        right={4}
        zIndex={1000}
        onClick={toggleFullscreen}
        colorScheme="blue"
        size="lg"
        borderRadius="full"
        boxShadow="md"
        _hover={{ transform: 'scale(1.1)' }}
        transition="all 0.2s"
      />
      <Box ref={mapContainerRef} w="100%" h="100%" minH="400px">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          minZoom={2}
          style={{ height: '100%', width: '100%', minHeight: '400px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {processedGraduados.map((item, index) => (
            <Marker
              key={`${item.graduados[0].id}-${index}`}
              position={[item.position.lat, item.position.lng]}
              icon={item.isCluster ? clusterIcon : icon}
            >
              <Popup>
                <div className="p-2" style={{ minWidth: '300px', maxWidth: '400px' }}>
                  {item.isCluster && (
                    <div className="location-shared mb-2">
                      <strong>Ubicación compartida</strong>
                    </div>
                  )}
                  {item.graduados.map((graduado) => (
                    <div key={graduado.id} className="mb-3 p-2 border-b border-gray-200 last:border-b-0">
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Columna izquierda */}
                        <div style={{ flex: '0 0 120px' }}>
                          {/* Foto circular */}
                          <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            overflow: 'hidden', 
                            marginBottom: '8px',
                            border: '2px solid #e2e8f0'
                          }}>
                            {graduado.foto ? (
                              <img 
                                src={graduado.foto} 
                                alt={`${graduado.nombre} ${graduado.apellido}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ 
                                width: '100%', 
                                height: '100%', 
                                backgroundColor: '#e2e8f0', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#718096',
                                fontSize: '24px'
                              }}>
                                {graduado.nombre.charAt(0)}{graduado.apellido.charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          {/* Nombre en azul */}
                          <h3 style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            color: '#3182ce', 
                            marginBottom: '4px',
                            lineHeight: '1.2'
                          }}>
                            {graduado.nombre} {graduado.apellido}
                          </h3>
                          
                          {/* Carrera con fuente más pequeña */}
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#4a5568', 
                            marginBottom: '6px',
                            lineHeight: '1.3'
                          }}>
                            {graduado.carrera}
                          </p>
                          
                          {/* Lugar de residencia */}
                          <p style={{ 
                            fontSize: '11px', 
                            color: '#718096', 
                            marginBottom: '4px',
                            lineHeight: '1.2'
                          }}>
                            📍 {graduado.ciudad}, {graduado.pais}
                          </p>
                          
                          {/* Lugar de trabajo */}
                          {graduado.lugar_trabajo && (
                            <p style={{ 
                              fontSize: '11px', 
                              color: '#718096',
                              lineHeight: '1.2'
                            }}>
                              💼 {graduado.lugar_trabajo}
                            </p>
                          )}
                        </div>
                        
                        {/* Columna derecha */}
                        <div style={{ flex: '1' }}>
                          {/* Biografía */}
                          {graduado.biografia ? (
                            <div style={{ marginBottom: '12px' }}>
                              <p style={{ 
                                fontSize: '12px', 
                                color: '#2d3748', 
                                lineHeight: '1.4',
                                marginBottom: '8px'
                              }}>
                                {graduado.biografia.length > 150 
                                  ? `${graduado.biografia.substring(0, 150)}...` 
                                  : graduado.biografia
                                }
                              </p>
                            </div>
                          ) : (
                            <p style={{ 
                              fontSize: '12px', 
                              color: '#a0aec0', 
                              fontStyle: 'italic',
                              marginBottom: '12px'
                            }}>
                              Sin biografía disponible
                            </p>
                          )}
                          
                          {/* Botón VER PERFIL */}
                          <button 
                            onClick={() => window.open(`/graduado/${graduado.id}`, '_blank')}
                            style={{
                              backgroundColor: '#3182ce',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              width: '100%',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2c5aa0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                          >
                            VER PERFIL
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  )
} 