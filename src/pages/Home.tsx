import { Box, Container, Heading, Text, Button, VStack, SimpleGrid } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { GraduadosMap } from '../components/GraduadosMap'

export const Home = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            Red de Graduados UNICEN
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Conectando a los graduados de la Universidad Nacional del Centro de la Provincia de Buenos Aires
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
          <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
            <Heading as="h2" size="lg" mb={4}>
              ¿Eres Graduado?
            </Heading>
            <Text mb={4}>
              Únete a nuestra red y mantente conectado con otros graduados de la UNICEN.
              Comparte tu experiencia y contribuye al crecimiento de nuestra comunidad.
            </Text>
            <Button
              as={RouterLink}
              to="/register"
              colorScheme="blue"
              size="lg"
              width="100%"
            >
              Registrarse
            </Button>
          </Box>

          <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
            <Heading as="h2" size="lg" mb={4}>
              Explora el Mapa
            </Heading>
            <Text mb={4}>
              Descubre dónde se encuentran nuestros graduados alrededor del mundo.
              Conecta con otros profesionales en tu área.
            </Text>
            <Button
              as={RouterLink}
              to="/mapa"
              colorScheme="green"
              size="lg"
              width="100%"
            >
              Ver Mapa
            </Button>
          </Box>
        </SimpleGrid>

        <Box w="100%" h="600px" mt={8}>
          <GraduadosMap />
        </Box>
      </VStack>
    </Container>
  )
} 