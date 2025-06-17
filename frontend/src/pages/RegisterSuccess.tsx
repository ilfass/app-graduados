import { Box, Container, Heading, Text, VStack, Button, useColorModeValue } from '@chakra-ui/react'
import { Link as RouterLink, useLocation, Navigate } from 'react-router-dom'
import { FaSmile } from 'react-icons/fa'

interface UserData {
  nombre: string
  apellido: string
  email: string
  carrera: string
  ciudad: string
  pais: string
}

const RegisterSuccess = () => {
  const location = useLocation()
  const userData = location.state?.userData as UserData
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Si no hay datos del usuario, redirigir al registro
  if (!userData) {
    return <Navigate to="/register" replace />
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="center">
        <Box
          p={8}
          bg={bgColor}
          borderRadius="lg"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          width="100%"
          textAlign="center"
        >
          <FaSmile size="64px" color="#48BB78" style={{ margin: '0 auto 20px' }} />
          
          <Heading as="h1" size="xl" mb={6}>
            ¡Registro Exitoso!
          </Heading>

          <Text fontSize="lg" mb={8}>
            ¡Felicitaciones {userData.nombre} {userData.apellido}! Tu registro se ha completado correctamente.
          </Text>

          <VStack spacing={4} align="stretch" mb={8}>
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold">Tus datos de registro:</Text>
              <Text>Email: {userData.email}</Text>
              <Text>Carrera: {userData.carrera}</Text>
              <Text>Ubicación: {userData.ciudad}, {userData.pais}</Text>
            </Box>
          </VStack>

          <Text mb={6}>
            Ahora puedes acceder a tu perfil y comenzar a explorar la plataforma.
          </Text>

          <Button
            as={RouterLink}
            to="/profile"
            colorScheme="blue"
            size="lg"
            width="full"
          >
            Ir a mi perfil
          </Button>
        </Box>
      </VStack>
    </Container>
  )
}

export default RegisterSuccess 