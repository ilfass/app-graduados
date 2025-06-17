import { Box, Heading, Text, Link, VStack, Container } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const ForgotPassword = () => {
  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Recuperación de Contraseña
        </Heading>
        
        <Box p={6} borderRadius="lg" bg="white" boxShadow="md">
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg">
              Para recuperar tu contraseña, por favor comunícate con el administrador del sistema:
            </Text>
            
            <Text fontSize="lg" fontWeight="bold" color="blue.500">
              relaciones.internacionales@rec.unicen.edu.ar
            </Text>
            
            <Text fontSize="md" color="gray.600">
              El administrador te ayudará a restablecer tu contraseña de manera segura.
            </Text>
          </VStack>
        </Box>

        <Box textAlign="center">
          <Link as={RouterLink} to="/login" color="blue.500">
            Volver al inicio de sesión
          </Link>
        </Box>
      </VStack>
    </Container>
  )
}

export default ForgotPassword 