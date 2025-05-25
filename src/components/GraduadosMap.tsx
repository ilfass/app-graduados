import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { useEffect, useState, useRef } from 'react'
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

  // Cargar graduados inicialmente
  useEffect(() => {
    fetchGraduados()

    // Configurar Socket.IO
    socketRef.current = io('http://localhost:3001')

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
          {graduados.map((graduado) => (
            <Marker
              key={graduado.id}
              position={[graduado.latitud, graduado.longitud]}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
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
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  )
} 