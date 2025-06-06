import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { GraduadosMap } from '../components/GraduadosMap'
import { Link as RouterLink } from 'react-router-dom'

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bg="linear-gradient(135deg, var(--primary-color), var(--secondary-color))"
        color="white"
        py={20}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <VStack spacing={8} align="center" textAlign="center">
            <Heading 
              as="h1" 
              size="2xl"
              bgGradient="linear(to-r, white, blue.100)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Red de Graduados UNICEN
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Conectamos a los graduados de la Universidad Nacional del Centro de la Provincia de Buenos Aires
              en todo el mundo. ¡Únete a nuestra comunidad global!
            </Text>
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              colorScheme="whiteAlpha"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.3s"
            >
              ¡Regístrate como Graduado!
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Mapa Section */}
      <Box py={12} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading as="h2" size="xl" textAlign="center">
              Nuestra Red Global
            </Heading>
            <Text fontSize="lg" textAlign="center" maxW="3xl" color="gray.600">
              Explora dónde se encuentran nuestros graduados alrededor del mundo.
              Cada marcador representa una historia de éxito UNICEN.
            </Text>
            <Box 
              w="100%" 
              h="600px" 
              borderRadius="xl" 
              overflow="hidden"
              boxShadow="2xl"
            >
              <GraduadosMap />
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={8} align="center" textAlign="center">
            <Heading as="h2" size="xl">
              ¿Eres Graduado de UNICEN?
            </Heading>
            <Text fontSize="xl" maxW="2xl" color="gray.600">
              Únete a nuestra red global de graduados. Comparte tu historia,
              conecta con otros profesionales y expande tu red profesional.
            </Text>
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              colorScheme="blue"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.3s"
            >
              ¡Regístrate Ahora!
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

export default Home 