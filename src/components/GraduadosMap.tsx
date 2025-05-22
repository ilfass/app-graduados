import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { useEffect, useState } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { graduadoService } from '../services/api'

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

  useEffect(() => {
    const fetchGraduados = async () => {
      try {
        console.log('Iniciando carga de graduados...')
        const response = await graduadoService.getAll()
        console.log('Respuesta del servicio:', response)
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Graduados recibidos:', response.data)
          setGraduados(response.data)
        } else {
          console.error('Formato de respuesta inválido:', response)
          setError('Error en el formato de los datos')
        }
        setLoading(false)
      } catch (err) {
        console.error('Error al cargar graduados:', err)
        setError('Error al cargar los graduados')
        setLoading(false)
      }
    }

    fetchGraduados()
  }, [])

  if (loading) {
    return (
      <Box p={4}>
        <Text>Cargando mapa...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    )
  }

  console.log('Renderizando mapa con graduados:', graduados)

  return (
    <VStack spacing={4} align="stretch" w="100%" h="600px">
      <Text fontSize="xl" fontWeight="bold">
        Mapa de Graduados UNICEN
      </Text>
      <Box w="100%" h="100%" borderRadius="lg" overflow="hidden">
        <MapContainer
          center={[-37.3217, -59.1332]} // Coordenadas de Tandil
          zoom={4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {graduados.map((graduado) => {
            console.log('Renderizando marcador para:', graduado)
            return (
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
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </Box>
    </VStack>
  )
} 