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
                <div className="p-2">
                  {item.isCluster && (
                    <div className="location-shared">
                      <strong>Ubicación compartida</strong>
                    </div>
                  )}
                  {item.graduados.map((graduado) => (
                    <div key={graduado.id} className="mb-3 p-2 border-b border-gray-200 last:border-b-0">
                      <h3 className="font-semibold text-lg mb-1">
                        {graduado.nombre} {graduado.apellido}
                      </h3>
                      <p className="text-gray-600">{graduado.carrera}</p>
                      <p className="text-gray-500 text-sm">
                        {graduado.ciudad}, {graduado.pais}
                      </p>
                      {graduado.institucion && (
                        <p className="text-gray-500 text-sm">
                          {graduado.institucion}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
                        Año de graduación: {graduado.anio_graduacion}
                      </p>
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