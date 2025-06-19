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
  Link as ChakraLink,
  Select
} from '@chakra-ui/react';
import { FiUsers, FiMap, FiSearch, FiSettings } from 'react-icons/fi';
import Graduados from './admin/Graduados';
import GraduadoDetalle from './admin/GraduadoDetalle';
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

  const [graduados, setGraduados] = useState([]);
  const [stats, setStats] = useState({
    totalGraduados: 0,
    graduadosAprobados: 0,
    graduadosPendientes: 0,
    graduadosRechazados: 0
  });

  useEffect(() => {
    loadStats();
    loadGraduados();
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

  const loadGraduados = async () => {
    try {
      const data = await adminService.getGraduados();
      setGraduados(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los graduados',
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
                    
                    // Crear encabezados del CSV con todos los campos
                    const headers = [
                      'ID',
                      'Nombre',
                      'Apellido',
                      'Email',
                      'Carrera',
                      'Año Graduación',
                      'Ciudad',
                      'País',
                      'Institución',
                      'Lugar de Trabajo',
                      'Área de Desempeño',
                      'Sector de Trabajo',
                      'Vinculado UNICEN',
                      'Áreas Vinculación',
                      'Interés Proyectos',
                      'LinkedIn',
                      'Biografía',
                      'Estado',
                      'Observaciones Admin',
                      'Latitud',
                      'Longitud',
                      'Fecha Registro',
                      'Última Actualización'
                    ].join(',');

                    // Convertir datos a formato CSV
                    const csvRows = response.map((graduado: any) => [
                      graduado.id,
                      `"${graduado.nombre || ''}"`,
                      `"${graduado.apellido || ''}"`,
                      `"${graduado.email || ''}"`,
                      `"${graduado.carrera || ''}"`,
                      graduado.anio_graduacion || '',
                      `"${graduado.ciudad || ''}"`,
                      `"${graduado.pais || ''}"`,
                      `"${graduado.institucion || ''}"`,
                      `"${graduado.lugar_trabajo || ''}"`,
                      `"${graduado.area_desempeno || ''}"`,
                      `"${graduado.sector_trabajo || ''}"`,
                      graduado.vinculado_unicen ? 'Sí' : 'No',
                      `"${graduado.areas_vinculacion || ''}"`,
                      graduado.interes_proyectos ? 'Sí' : 'No',
                      `"${graduado.linkedin || ''}"`,
                      `"${graduado.biografia || ''}"`,
                      `"${graduado.estado || ''}"`,
                      `"${graduado.observaciones_admin || ''}"`,
                      graduado.latitud || '',
                      graduado.longitud || '',
                      graduado.created_at ? new Date(graduado.created_at).toLocaleDateString() : '',
                      graduado.updated_at ? new Date(graduado.updated_at).toLocaleDateString() : ''
                    ].join(','));

                    // Combinar encabezados y datos
                    const csvContent = [headers, ...csvRows].join('\n');

                    // Crear y descargar archivo
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `graduados_completo_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast({
                      title: 'Descarga exitosa',
                      description: 'Archivo CSV descargado correctamente',
                      status: 'success',
                      duration: 3000,
                    });
                  } catch (error) {
                    console.error('Error al descargar CSV:', error);
                    toast({
                      title: 'Error',
                      description: 'No se pudo descargar el archivo CSV',
                      status: 'error',
                      duration: 3000,
                    });
                  }
                }}
                colorScheme="green"
                size="lg"
                height="100px"
              >
                <VStack>
                  <Text>Descargar Datos</Text>
                  <Text fontSize="sm" color="gray.500">
                    Exportar todos los graduados
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
      <Route path="/graduado-detalle/:id" element={<GraduadoDetalle />} />
      <Route path="/configuracion" element={<Configuracion />} />
    </Routes>
  );
};

export default Admin; 