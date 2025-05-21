import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Container,
  HStack,
  useToast,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FiUsers, FiMap, FiSearch, FiSettings } from 'react-icons/fi';
import Graduados from './admin/Graduados';
import Configuracion from './admin/Configuracion';
import { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import { Link as RouterLink } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  const [stats, setStats] = useState({
    totalGraduados: 0,
    graduadosAprobados: 0,
    graduadosPendientes: 0,
    graduadosRechazados: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Panel de Administración
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Stat
            px={4}
            py={5}
            shadow="xl"
            border="1px solid"
            borderColor="gray.200"
            rounded="lg"
          >
            <StatLabel>Total de Graduados</StatLabel>
            <StatNumber>{stats.totalGraduados}</StatNumber>
            <StatHelpText>Registrados en el sistema</StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            shadow="xl"
            border="1px solid"
            borderColor="gray.200"
            rounded="lg"
          >
            <StatLabel>Graduados Aprobados</StatLabel>
            <StatNumber>{stats.graduadosAprobados}</StatNumber>
            <StatHelpText>Perfiles verificados</StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            shadow="xl"
            border="1px solid"
            borderColor="gray.200"
            rounded="lg"
          >
            <StatLabel>Graduados Pendientes</StatLabel>
            <StatNumber>{stats.graduadosPendientes}</StatNumber>
            <StatHelpText>En espera de revisión</StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            shadow="xl"
            border="1px solid"
            borderColor="gray.200"
            rounded="lg"
          >
            <StatLabel>Graduados Rechazados</StatLabel>
            <StatNumber>{stats.graduadosRechazados}</StatNumber>
            <StatHelpText>Perfiles no aprobados</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box p={6} borderRadius="lg" bg="white" boxShadow="md">
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="lg">
              Acciones Rápidas
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Button
                as={RouterLink}
                to="/admin/graduados"
                colorScheme="blue"
                size="lg"
                height="100px"
              >
                <VStack>
                  <Text>Gestionar Graduados</Text>
                  <Text fontSize="sm" color="gray.500">
                    Ver y administrar perfiles
                  </Text>
                </VStack>
              </Button>

              <Button
                as={RouterLink}
                to="/mapa"
                colorScheme="green"
                size="lg"
                height="100px"
              >
                <VStack>
                  <Text>Ver Mapa</Text>
                  <Text fontSize="sm" color="gray.500">
                    Visualizar graduados en el mapa
                  </Text>
                </VStack>
              </Button>

              <Button
                as={RouterLink}
                to="/admin/reset-password"
                colorScheme="purple"
                size="lg"
                height="100px"
              >
                <VStack>
                  <Text>Restablecer Contraseñas</Text>
                  <Text fontSize="sm" color="gray.500">
                    Gestionar contraseñas de graduados
                  </Text>
                </VStack>
              </Button>

              <Button
                onClick={loadStats}
                colorScheme="teal"
                size="lg"
                height="100px"
              >
                <VStack>
                  <Text>Actualizar Estadísticas</Text>
                  <Text fontSize="sm" color="gray.500">
                    Refrescar datos del dashboard
                  </Text>
                </VStack>
              </Button>
            </SimpleGrid>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/graduados" element={<Graduados />} />
      <Route path="/configuracion" element={<Configuracion />} />
    </Routes>
  );
};

export default Admin; 