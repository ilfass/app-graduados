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
import { adminService, graduadoService } from '../services/api';
import { Link as RouterLink } from 'react-router-dom';
import { GraduadosMap } from '../components/GraduadosMap';

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
                onClick={async () => {
                  try {
                    const response = await adminService.getGraduados();
                    // Verificar que tenemos datos válidos
                    if (!response || !Array.isArray(response)) {
                      throw new Error('No se recibieron datos válidos');
                    }
                    
                    // Crear encabezados del CSV
                    const headers = [
                      'ID',
                      'Nombre',
                      'Apellido',
                      'Email',
                      'Carrera',
                      'Institución',
                      'Año Graduación',
                      'Ciudad',
                      'País',
                      'Estado',
                      'LinkedIn',
                      'Latitud',
                      'Longitud'
                    ].join(',');

                    // Convertir datos a formato CSV
                    const csvRows = response.map((graduado: {
                      id: number;
                      nombre: string;
                      apellido: string;
                      email: string;
                      carrera: string;
                      institucion?: string;
                      anio_graduacion: number;
                      ciudad?: string;
                      pais?: string;
                      estado: string;
                      linkedin?: string;
                      latitud?: number;
                      longitud?: number;
                    }) => [
                      graduado.id,
                      `"${graduado.nombre}"`,
                      `"${graduado.apellido}"`,
                      `"${graduado.email}"`,
                      `"${graduado.carrera}"`,
                      `"${graduado.institucion || ''}"`,
                      graduado.anio_graduacion,
                      `"${graduado.ciudad || ''}"`,
                      `"${graduado.pais || ''}"`,
                      `"${graduado.estado}"`,
                      `"${graduado.linkedin || ''}"`,
                      graduado.latitud || '',
                      graduado.longitud || ''
                    ].join(','));

                    // Combinar encabezados y datos
                    const csvContent = [headers, ...csvRows].join('\n');

                    // Crear y descargar archivo
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `graduados_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast({
                      title: 'Éxito',
                      description: 'Datos de graduados exportados correctamente',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                  } catch (error) {
                    console.error('Error al exportar datos:', error);
                    toast({
                      title: 'Error',
                      description: 'No se pudieron exportar los datos de los graduados',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
                colorScheme="green"
                size="lg"
                height="100px"
              >
                <VStack>
                  <Text>Exportar Datos</Text>
                  <Text fontSize="sm" color="gray.500">
                    Descargar datos de graduados en CSV
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
                  <Text>Restablecer Contraseña</Text>
                  <Text fontSize="sm" color="gray.500">
                    Cambiar contraseña de usuario
                  </Text>
                </VStack>
              </Button>

              <Button
                onClick={async () => {
                  const id = prompt('Ingrese el ID del graduado a eliminar:');
                  if (id && window.confirm('¿Estás seguro de que deseas eliminar este perfil? Esta acción no se puede deshacer.')) {
                    try {
                      await adminService.deleteGraduado(Number(id));
                      toast({
                        title: 'Perfil eliminado',
                        description: 'El perfil ha sido eliminado exitosamente',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                      // Recargar estadísticas
                      loadStats();
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: 'No se pudo eliminar el perfil',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }
                }}
                colorScheme="red"
                size="lg"
                height="100px"
              >
                <VStack>
                  <Text>Eliminar Perfil</Text>
                  <Text fontSize="sm" color="gray.500">
                    Eliminar perfil de graduado
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

        {/* Mapa de Graduados */}
        <Box p={6} borderRadius="lg" bg="white" boxShadow="md">
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="lg">
              Mapa de Graduados
            </Heading>
            <Box 
              w="100%" 
              h="500px" 
              borderRadius="xl" 
              overflow="hidden"
              boxShadow="md"
            >
              <GraduadosMap />
            </Box>
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