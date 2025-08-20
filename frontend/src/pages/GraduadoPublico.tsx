import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  HStack,
  Avatar,
  Text,
  Heading,
  Badge,
  Divider,
  Card,
  CardBody,
  Grid,
  GridItem,
  Icon,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react'
import { FiMapPin, FiBriefcase, FiCalendar, FiAward, FiLinkedin, FiMail } from 'react-icons/fi'
import { graduadoService } from '../services/api'

interface GraduadoPublico {
  id: number
  nombre: string
  apellido: string
  carrera: string
  anio_graduacion: number
  ciudad: string
  pais: string
  lugar_trabajo?: string
  area_desempeno?: string
  sector_trabajo?: string
  biografia?: string
  foto?: string
  linkedin?: string
  email?: string
}

const GraduadoPublico = () => {
  const { id } = useParams<{ id: string }>()
  const [graduado, setGraduado] = useState<GraduadoPublico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    const fetchGraduado = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const response = await graduadoService.getPublicProfile(parseInt(id))
        setGraduado(response)
      } catch (err) {
        console.error('Error al cargar el perfil:', err)
        setError('No se pudo cargar el perfil del graduado')
        toast({
          title: 'Error',
          description: 'No se pudo cargar el perfil del graduado',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGraduado()
  }, [id, toast])

  if (loading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando perfil...</Text>
        </VStack>
      </Center>
    )
  }

  if (error || !graduado) {
    return (
      <Container maxW="container.md" py={8}>
        <Center minH="50vh">
          <VStack spacing={4}>
            <Text color="red.500" fontSize="lg">
              {error || 'Graduado no encontrado'}
            </Text>
          </VStack>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header del perfil */}
        <Card>
          <CardBody>
            <HStack spacing={6} align="start">
              {/* Avatar */}
              <Avatar
                size="2xl"
                name={`${graduado.nombre} ${graduado.apellido}`}
                src={graduado.foto}
                bg="blue.100"
                color="blue.600"
              />
              
              {/* Información básica */}
              <VStack align="start" spacing={3} flex="1">
                <Heading size="lg" color="blue.600">
                  {graduado.nombre} {graduado.apellido}
                </Heading>
                
                <HStack spacing={4} wrap="wrap">
                  <HStack spacing={2}>
                    <Icon as={FiAward} color="gray.500" />
                    <Text fontSize="lg" fontWeight="medium">
                      {graduado.carrera}
                    </Text>
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} color="gray.500" />
                    <Text color="gray.600">
                      Graduado en {graduado.anio_graduacion}
                    </Text>
                  </HStack>
                </HStack>

                <HStack spacing={4} wrap="wrap">
                  <HStack spacing={2}>
                    <Icon as={FiMapPin} color="gray.500" />
                    <Text color="gray.600">
                      {graduado.ciudad}, {graduado.pais}
                    </Text>
                  </HStack>
                  
                  {graduado.lugar_trabajo && (
                    <HStack spacing={2}>
                      <Icon as={FiBriefcase} color="gray.500" />
                      <Text color="gray.600">
                        {graduado.lugar_trabajo}
                      </Text>
                    </HStack>
                  )}
                </HStack>

                {/* Badges de área y sector */}
                <HStack spacing={2} wrap="wrap">
                  {graduado.area_desempeno && (
                    <Badge colorScheme="blue" variant="subtle">
                      {graduado.area_desempeno}
                    </Badge>
                  )}
                  {graduado.sector_trabajo && (
                    <Badge colorScheme="green" variant="subtle">
                      {graduado.sector_trabajo}
                    </Badge>
                  )}
                </HStack>

                {/* Contacto */}
                <HStack spacing={4} wrap="wrap">
                  {graduado.email && (
                    <HStack spacing={2}>
                      <Icon as={FiMail} color="blue.600" />
                      <Text
                        as="a"
                        href={`mailto:${graduado.email}`}
                        color="blue.600"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {graduado.email}
                      </Text>
                    </HStack>
                  )}
                  
                  {graduado.linkedin && (
                    <HStack spacing={2}>
                      <Icon as={FiLinkedin} color="blue.600" />
                      <Text
                        as="a"
                        href={graduado.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="blue.600"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        Ver perfil de LinkedIn
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Biografía */}
        {graduado.biografia && (
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md" color="gray.700">
                  Biografía Profesional
                </Heading>
                <Divider />
                <Text
                  fontSize="md"
                  lineHeight="1.6"
                  color="gray.700"
                  whiteSpace="pre-wrap"
                >
                  {graduado.biografia}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Información adicional */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          {/* Información académica */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="sm" color="gray.700">
                  Información Académica
                </Heading>
                <Divider />
                <VStack align="start" spacing={2}>
                  <HStack spacing={2}>
                    <Icon as={FiAward} color="blue.500" />
                    <Text fontWeight="medium">{graduado.carrera}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} color="blue.500" />
                    <Text>Año de graduación: {graduado.anio_graduacion}</Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Información laboral */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="sm" color="gray.700">
                  Información Laboral
                </Heading>
                <Divider />
                <VStack align="start" spacing={2}>
                  {graduado.lugar_trabajo && (
                    <HStack spacing={2}>
                      <Icon as={FiBriefcase} color="green.500" />
                      <Text fontWeight="medium">{graduado.lugar_trabajo}</Text>
                    </HStack>
                  )}
                  {graduado.area_desempeno && (
                    <Text fontSize="sm" color="gray.600">
                      Área: {graduado.area_desempeno}
                    </Text>
                  )}
                  {graduado.sector_trabajo && (
                    <Text fontSize="sm" color="gray.600">
                      Sector: {graduado.sector_trabajo}
                    </Text>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Container>
  )
}

export default GraduadoPublico 