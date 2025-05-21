import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Text, VStack } from '@chakra-ui/react'
import { graduadoService } from '../services/api'

// Corregir el problema con los íconos de Leaflet
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface Graduado {
  id: number
  nombre: string
  apellido: string
  carrera: string
  ciudad: string
  pais: string
  latitud: number
  longitud: number
}

export const GraduadosMap = () => {
  const [graduados, setGraduados] = useState<Graduado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGraduados = async () => {
      try {
        const response = await graduadoService.getAll()
        setGraduados(response.data)
        setLoading(false)
      } catch (err) {
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
          {graduados.map((graduado) => (
            <Marker
              key={graduado.id}
              position={[graduado.latitud, graduado.longitud]}
            >
              <Popup>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">
                    {graduado.nombre} {graduado.apellido}
                  </Text>
                  <Text>Carrera: {graduado.carrera}</Text>
                  <Text>
                    Ubicación: {graduado.ciudad}, {graduado.pais}
                  </Text>
                </VStack>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </VStack>
  )
} 