import { Box, Button, Container, Heading, Text, VStack, HStack, Image, Avatar, Icon, Stack } from '@chakra-ui/react'
import { GraduadosMap } from '../components/GraduadosMap'
import { Link as RouterLink } from 'react-router-dom'
import { FiMapPin, FiUser, FiFileText, FiStar, FiShare2 } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { graduadoService } from '../services/api'

const Home = () => {
  const [graduadoDestacado, setGraduadoDestacado] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener un graduado aleatorio
  const fetchRandomGraduado = async () => {
    try {
      setLoading(true);
      const response = await graduadoService.getRandomGraduado();
      setGraduadoDestacado(response);
    } catch (error) {
      console.error('Error al obtener graduado aleatorio:', error);
      // En caso de error, usar datos por defecto
      setGraduadoDestacado({
        nombre: 'Graduado',
        apellido: 'UNICEN',
        carrera: 'Carrera',
        ciudad: 'Ciudad',
        pais: 'País',
        foto: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar graduado aleatorio al montar el componente
  useEffect(() => {
    fetchRandomGraduado();
  }, []);

  // Efecto para cambiar graduado cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRandomGraduado();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bg="linear-gradient(45deg, rgba(34, 82, 117, 1) 0, rgb(100, 110, 96) 100%)"
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
              color="white"
              fontWeight="extrabold"
              className="hero-main-heading"
            >
              Bienvenidos/as a la Red de Graduadas y Graduados de la Universidad Nacional del Centro de Buenos Aires
            </Heading>
            <Text fontSize="xl" maxW="2xl">
            Únete a nuestra red global de graduados. Comparte tu historia, conecta con otros profesionales y expande tu red profesional
            </Text>
            
            {/* Layout de dos columnas: Imagen y botón a la izquierda, graduado destacado a la derecha */}
            <Stack 
              direction={{ base: "column", lg: "row" }}
              spacing={{ base: 8, lg: 12 }} 
              align="center" 
              justify="center" 
              w="100%"
            >
              
              {/* Columna izquierda - Imagen y botón de registro */}
              <VStack spacing={6} align="center" w={{ base: "100%", lg: "auto" }}>
                <Box 
                  bg="white" 
                  p={{ base: 4, md: 6, lg: 8 }} 
                  borderRadius="3xl" 
                  shadow="2xl"
                  maxW={{ base: "100%", lg: "500px" }}
                  w="100%"
                  minH={{ base: "400px", md: "500px", lg: "600px" }}
                  border="2px solid"
                  borderColor="gray.100"
                  _hover={{
                    transform: 'translateY(-12px)',
                    shadow: '3xl',
                    borderColor: 'blue.200',
                    boxShadow: '0 35px 60px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                  }}
                  transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  overflow="hidden"
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  className="modern-card"
                >
                  {/* Efecto de brillo en el borde superior */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    height="4px"
                    bgGradient="linear(to-r, blue.400, blue.500, blue.400)"
                    opacity="0"
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.4s ease"
                    borderRadius="full"
                  />
                  
                  {/* Efecto de sombra interna sutil */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bgGradient="linear(to-b, rgba(255,255,255,0.1), transparent)"
                    pointerEvents="none"
                    borderRadius="3xl"
                  />
                  
                  <VStack spacing={6} align="center" flex="1" justify="center">
                    {/* Título */}
                    <Heading 
                      size={{ base: "md", md: "lg" }} 
                      color="black" 
                      textAlign="center"
                      fontWeight="extrabold"
                      letterSpacing="tight"
                      mb={2}
                    >
                      Consejos para destacar tu perfil
                    </Heading>
                    
                    {/* Lista de consejos con iconos */}
                    <VStack spacing={{ base: 3, md: 4, lg: 5 }} align="flex-start" w="100%" px={{ base: 2, md: 3, lg: 4 }}>
                      <HStack 
                        spacing={{ base: 3, md: 4 }} 
                        align="center" 
                        p={{ base: 2, md: 3 }} 
                        bg="gray.50" 
                        borderRadius="xl"
                        w="100%"
                        _hover={{
                          bg: "blue.50",
                          transform: "translateX(4px)",
                          boxShadow: "md"
                        }}
                        transition="all 0.3s ease"
                      >
                        <Icon as={FiUser} color="blue.500" boxSize={{ base: 5, md: 6 }} />
                        <Text fontSize={{ base: "sm", md: "md" }} color="black" fontWeight="medium">
                          Usá una foto clara y profesional
                        </Text>
                      </HStack>
                      
                      <HStack 
                        spacing={{ base: 3, md: 4 }} 
                        align="center" 
                        p={{ base: 2, md: 3 }} 
                        bg="gray.50" 
                        borderRadius="xl"
                        w="100%"
                        _hover={{
                          bg: "blue.50",
                          transform: "translateX(4px)",
                          boxShadow: "md"
                        }}
                        transition="all 0.3s ease"
                      >
                        <Icon as={FiFileText} color="blue.500" boxSize={{ base: 5, md: 6 }} />
                        <Text fontSize={{ base: "sm", md: "md" }} color="black" fontWeight="medium">
                          Escribí un resumen breve de quién sos
                        </Text>
                      </HStack>
                      
                      <HStack 
                        spacing={{ base: 3, md: 4 }} 
                        align="center" 
                        p={{ base: 2, md: 3 }} 
                        bg="gray.50" 
                        borderRadius="xl"
                        w="100%"
                        _hover={{
                          bg: "blue.50",
                          transform: "translateX(4px)",
                          boxShadow: "md"
                        }}
                        transition="all 0.3s ease"
                      >
                        <Icon as={FiMapPin} color="blue.500" boxSize={{ base: 5, md: 6 }} />
                        <Text fontSize={{ base: "sm", md: "md" }} color="black" fontWeight="medium">
                          Actualizá tu ubicación y contacto
                        </Text>
                      </HStack>
                      
                      <HStack 
                        spacing={{ base: 3, md: 4 }} 
                        align="center" 
                        p={{ base: 2, md: 3 }} 
                        bg="gray.50" 
                        borderRadius="xl"
                        w="100%"
                        _hover={{
                          bg: "blue.50",
                          transform: "translateX(4px)",
                          boxShadow: "md"
                        }}
                        transition="all 0.3s ease"
                      >
                        <Icon as={FiStar} color="blue.500" boxSize={{ base: 5, md: 6 }} />
                        <Text fontSize={{ base: "sm", md: "md" }} color="black" fontWeight="medium">
                          Compartí tus redes profesionales
                        </Text>
                      </HStack>
                      
                      <HStack 
                        spacing={{ base: 3, md: 4 }} 
                        align="center" 
                        p={{ base: 2, md: 3 }} 
                        bg="gray.50" 
                        borderRadius="xl"
                        w="100%"
                        _hover={{
                          bg: "blue.50",
                          transform: "translateX(4px)",
                          boxShadow: "md"
                        }}
                        transition="all 0.3s ease"
                      >
                        <Icon as={FiShare2} color="blue.500" boxSize={{ base: 5, md: 6 }} />
                        <Text fontSize={{ base: "sm", md: "md" }} color="black" fontWeight="medium">
                          Revisá y actualizá tu perfil al menos una vez al año
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                  
                  {/* Botón de registro */}
                  <VStack spacing={4} align="center" pb={4}>
                    <Button
                      as={RouterLink}
                      to="/register"
                      size={{ base: "md", md: "lg" }}
                      colorScheme="blue"
                      px={{ base: 6, md: 8 }}
                      py={{ base: 4, md: 5 }}
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="extrabold"
                      borderRadius="2xl"
                      bgGradient="linear(to-r, blue.500, blue.600)"
                      _hover={{
                        transform: 'translateY(-3px)',
                        boxShadow: 'xl',
                        bgGradient: 'linear(to-r, blue.600, blue.700)',
                        filter: 'brightness(1.1)'
                      }}
                      _active={{
                        transform: 'translateY(-1px)'
                      }}
                      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                      shadow="lg"
                      letterSpacing="wide"
                    >
                      Registrate
                    </Button>
                  </VStack>
                </Box>
              </VStack>
              
              {/* Columna derecha - Graduado destacado */}
              <VStack spacing={6} flex={1} align="center">
                <Box 
                  bg="white" 
                  p={{ base: 4, md: 6, lg: 8 }} 
                  borderRadius="3xl" 
                  shadow="2xl"
                  maxW={{ base: "100%", lg: "500px" }}
                  w="100%"
                  minH={{ base: "400px", md: "500px", lg: "600px" }}
                  border="2px solid"
                  borderColor="gray.100"
                  _hover={{
                    transform: 'translateY(-12px)',
                    shadow: '3xl',
                    borderColor: 'purple.200',
                    boxShadow: '0 35px 60px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(147, 51, 234, 0.1)'
                  }}
                  transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  overflow="hidden"
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  className="modern-card"
                >
                  {/* Efecto de brillo en el borde superior */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    height="4px"
                    bgGradient="linear(to-r, purple.400, purple.500, purple.400)"
                    opacity="0"
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.4s ease"
                    borderRadius="full"
                  />
                  
                  {/* Efecto de sombra interna sutil */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bgGradient="linear(to-b, rgba(255,255,255,0.1), transparent)"
                    pointerEvents="none"
                    borderRadius="3xl"
                  />
                  
                  <VStack spacing={6} align="center" flex="1" justify="center">
                    {/* Título del recuadro */}
                    <Heading 
                      size={{ base: "md", md: "lg" }} 
                      color="black" 
                      textAlign="center"
                      fontWeight="extrabold"
                      letterSpacing="tight"
                      mb={4}
                    >
                      GRADUADOS YA REGISTRADOS
                    </Heading>
                    
                    {/* Avatar del graduado */}
                    <Box position="relative">
                      <Avatar
                        size={{ base: "xl", md: "2xl" }}
                        name={graduadoDestacado ? `${graduadoDestacado.nombre} ${graduadoDestacado.apellido}` : 'Graduado UNICEN'}
                        src={graduadoDestacado?.foto ? `/uploads/fotos/${graduadoDestacado.foto}` : undefined}
                        bgGradient="linear(to-r, purple.400, blue.400)"
                        border="4px solid"
                        borderColor="purple.200"
                        _hover={{
                          transform: 'scale(1.1)',
                          borderColor: 'purple.300',
                          boxShadow: 'xl'
                        }}
                        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                        boxShadow="lg"
                      />
                      {/* Indicador de estado online */}
                      <Box
                        position="absolute"
                        bottom="3"
                        right="3"
                        w="5"
                        h="5"
                        bg="green.400"
                        borderRadius="full"
                        border="3px solid"
                        borderColor="white"
                        boxShadow="xl"
                        _before={{
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          w: '2',
                          h: '2',
                          bg: 'white',
                          borderRadius: 'full'
                        }}
                      />
                    </Box>
                    
                    {/* Información del graduado */}
                    <VStack spacing={3} align="center">
                      {loading ? (
                        <VStack spacing={3}>
                          <Box w="32" h="8" bg="gray.200" borderRadius="md" />
                          <Box w="40" h="6" bg="gray.200" borderRadius="md" />
                          <Box w="36" h="5" bg="gray.200" borderRadius="md" />
                        </VStack>
                      ) : (
                        <>
                          <Heading size={{ base: "md", md: "lg" }} color="black" textAlign="center">
                            {graduadoDestacado?.nombre} {graduadoDestacado?.apellido}
                          </Heading>
                          <Text 
                            fontSize={{ base: "sm", md: "md" }} 
                            color="blue.600" 
                            fontWeight="medium"
                            textAlign="center"
                          >
                            {graduadoDestacado?.carrera}
                          </Text>
                          <HStack spacing={2} align="center">
                            <Icon as={FiMapPin} color="blue.500" boxSize={{ base: 4, md: 5 }} />
                            <Text fontSize={{ base: "xs", md: "sm" }} color="black">
                              {graduadoDestacado?.ciudad}, {graduadoDestacado?.pais}
                            </Text>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </VStack>
                  
                  {/* Botón para ver más graduados */}
                  <VStack spacing={4} align="center" pb={4}>
                    <Button
                      size={{ base: "md", md: "lg" }}
                      colorScheme="purple"
                      variant="outline"
                      borderRadius="2xl"
                      px={{ base: 6, md: 8 }}
                      py={{ base: 4, md: 5 }}
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="extrabold"
                      borderWidth="2px"
                      onClick={() => {
                        // Scroll suave hacia el mapa
                        document.getElementById('mapa-graduados')?.scrollIntoView({ 
                          behavior: 'smooth' 
                        });
                      }}
                      _hover={{
                        bg: 'purple.500',
                        color: 'white',
                        transform: 'translateY(-3px)',
                        boxShadow: 'xl',
                        borderColor: 'purple.500'
                      }}
                      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                      letterSpacing="wide"
                    >
                      Ver más graduados
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Mapa Section */}
      <Box py={12} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading 
              as="h2" 
              size="xl" 
              textAlign="center" 
              color="gray.800"
              className="mapa-titulo"
              sx={{
                color: 'rgb(31, 41, 55) !important'
              }}
            >
              Nuestra Red Global
            </Heading>
            <Text fontSize="lg" textAlign="center" maxW="3xl" color="gray.600">
              Explora dónde se encuentran nuestros graduados alrededor del mundo.
              Cada marcador representa una historia de éxito UNICEN.
            </Text>
            <Box 
              id="mapa-graduados"
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

      {/* Footer Section */}
      <Box py={16} bg="black" borderTop="1px solid" borderColor="gray.800">
        <Container maxW="container.xl">
          <VStack spacing={8} align="center" textAlign="center">
            <Heading as="h2" size="xl" color="white">
              CONTACTO
            </Heading>
            <VStack spacing={4} align="center">
              <Text fontSize="lg" color="white" fontWeight="medium" sx={{ color: 'white !important' }}>
                General Pinto 399. 2° piso. Oficina 233.
              </Text>
              <Text fontSize="lg" color="white" sx={{ color: 'white !important' }}>
                CP B7000GHC. Tandil. Buenos Aires. Argentina
              </Text>
              <Text fontSize="lg" color="white" fontWeight="medium" sx={{ color: 'white !important' }}>
                (00) (54) (9) 249 4 385600 int. 1961
              </Text>
              <Text 
                fontSize="lg" 
                color="white" 
                fontWeight="bold"
                _hover={{ color: 'gray.200' }}
                transition="color 0.3s ease"
                cursor="pointer"
                sx={{ color: 'white !important' }}
                onClick={() => window.open('mailto:relaciones.internacionales@rec.unicen.edu.ar', '_blank')}
              >
                relaciones.internacionales@rec.unicen.edu.ar
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

export default Home 