import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Grid,
  GridItem,
  Divider,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Link,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiDownload, FiMapPin, FiMail, FiLinkedin, FiBriefcase, FiUser } from 'react-icons/fi';
import { adminService } from '../../services/api';
import { Graduado } from '../../services/api';

const GraduadoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [graduado, setGraduado] = useState<Graduado | null>(null);
  const [loading, setLoading] = useState(true);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (id) {
      fetchGraduado(parseInt(id));
    }
  }, [id]);

  const fetchGraduado = async (graduadoId: number) => {
    try {
      setLoading(true);
      const data = await adminService.getGraduadoById(graduadoId);
      setGraduado(data);
      setObservaciones(data.observaciones_admin || '');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del graduado',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (estado: 'aprobado' | 'rechazado') => {
    if (!graduado) return;

    try {
      await adminService.updateGraduadoStatus(graduado.id!, estado);
      await adminService.updateGraduadoObservaciones(graduado.id!, observaciones);
      
      toast({
        title: 'Éxito',
        description: `Graduado ${estado} correctamente`,
        status: 'success',
        duration: 3000,
      });
      
      fetchGraduado(graduado.id!);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDownloadData = () => {
    if (!graduado) return;

    const data = {
      id: graduado.id,
      nombre: graduado.nombre,
      apellido: graduado.apellido,
      email: graduado.email,
      carrera: graduado.carrera,
      anio_graduacion: graduado.anio_graduacion,
      ciudad: graduado.ciudad,
      pais: graduado.pais,
      institucion: graduado.institucion,
      lugar_trabajo: graduado.lugar_trabajo,
      area_desempeno: graduado.area_desempeno,
      sector_trabajo: graduado.sector_trabajo,
      vinculado_unicen: graduado.vinculado_unicen,
      areas_vinculacion: graduado.areas_vinculacion,
      interes_proyectos: graduado.interes_proyectos,
      linkedin: graduado.linkedin,
      biografia: graduado.biografia,
      estado: graduado.estado,
      observaciones_admin: graduado.observaciones_admin,
      latitud: graduado.latitud,
      longitud: graduado.longitud,
      fecha_registro: graduado.created_at
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graduado_${graduado.id}_${graduado.nombre}_${graduado.apellido}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Text>Cargando...</Text>
      </Container>
    );
  }

  if (!graduado) {
    return (
      <Container maxW="container.xl" py={10}>
        <Text>Graduado no encontrado</Text>
      </Container>
    );
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'green';
      case 'rechazado': return 'red';
      default: return 'yellow';
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack>
            <IconButton
              aria-label="Volver"
              icon={<FiArrowLeft />}
              onClick={() => navigate('/admin/graduados')}
              variant="ghost"
            />
            <Heading size="lg">
              {graduado.nombre} {graduado.apellido}
            </Heading>
            <Badge colorScheme={getEstadoColor(graduado.estado || 'pendiente')} fontSize="md">
              {graduado.estado}
            </Badge>
          </HStack>
          
          <HStack>
            <Tooltip label="Descargar datos">
              <IconButton
                aria-label="Descargar"
                icon={<FiDownload />}
                onClick={handleDownloadData}
                colorScheme="blue"
                variant="outline"
              />
            </Tooltip>
            <Button colorScheme="green" onClick={() => handleUpdateStatus('aprobado')}>
              Aprobar
            </Button>
            <Button colorScheme="red" onClick={() => handleUpdateStatus('rechazado')}>
              Rechazar
            </Button>
          </HStack>
        </HStack>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Información Principal */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Información Personal */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <FiUser style={{ marginRight: '8px' }} />
                  Información Personal
                </Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Nombre</Text>
                    <Text>{graduado.nombre} {graduado.apellido}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Email</Text>
                    <Text display="flex" alignItems="center">
                      <FiMail style={{ marginRight: '4px' }} />
                      {graduado.email}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Carrera</Text>
                    <Text>{graduado.carrera}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Año de Graduación</Text>
                    <Text>{graduado.anio_graduacion}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Ciudad</Text>
                    <Text display="flex" alignItems="center">
                      <FiMapPin style={{ marginRight: '4px' }} />
                      {graduado.ciudad}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">País</Text>
                    <Text>{graduado.pais}</Text>
                  </Box>
                </Grid>
              </Box>

              {/* Información Laboral */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <FiBriefcase style={{ marginRight: '8px' }} />
                  Información Laboral
                </Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  {graduado.institucion && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Institución</Text>
                      <Text>{graduado.institucion}</Text>
                    </Box>
                  )}
                  {graduado.lugar_trabajo && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Lugar de Trabajo</Text>
                      <Text>{graduado.lugar_trabajo}</Text>
                    </Box>
                  )}
                  {graduado.area_desempeno && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Área de Desempeño</Text>
                      <Text>{graduado.area_desempeno}</Text>
                    </Box>
                  )}
                  {graduado.sector_trabajo && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Sector de Trabajo</Text>
                      <Text>{graduado.sector_trabajo}</Text>
                    </Box>
                  )}
                </Grid>
              </Box>

              {/* Vinculación con UNICEN */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <Heading size="md" mb={4}>Vinculación con UNICEN</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Vinculado a UNICEN</Text>
                    <Badge colorScheme={graduado.vinculado_unicen ? 'green' : 'gray'}>
                      {graduado.vinculado_unicen ? 'Sí' : 'No'}
                    </Badge>
                  </Box>
                  {graduado.areas_vinculacion && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Áreas de Vinculación</Text>
                      <Text>{graduado.areas_vinculacion}</Text>
                    </Box>
                  )}
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Interés en Proyectos</Text>
                    <Badge colorScheme={graduado.interes_proyectos ? 'blue' : 'gray'}>
                      {graduado.interes_proyectos ? 'Sí' : 'No'}
                    </Badge>
                  </Box>
                </Grid>
              </Box>

              {/* Biografía */}
              {graduado.biografia && (
                <Box p={6} borderWidth={1} borderRadius="lg">
                  <Heading size="md" mb={4}>Biografía</Heading>
                  <Text>{graduado.biografia}</Text>
                </Box>
              )}

              {/* LinkedIn */}
              {graduado.linkedin && (
                <Box p={6} borderWidth={1} borderRadius="lg">
                  <Heading size="md" mb={4} display="flex" alignItems="center">
                    <FiLinkedin style={{ marginRight: '8px' }} />
                    LinkedIn
                  </Heading>
                  <Link href={graduado.linkedin} isExternal color="blue.500">
                    {graduado.linkedin}
                  </Link>
                </Box>
              )}
            </VStack>
          </GridItem>

          {/* Panel Lateral */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Observaciones del Administrador */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <Heading size="md" mb={4}>Observaciones</Heading>
                <Textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Agregar observaciones..."
                  rows={6}
                />
                <Button
                  mt={3}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => {
                    if (graduado.id) {
                      adminService.updateGraduadoObservaciones(graduado.id, observaciones);
                      toast({
                        title: 'Observaciones guardadas',
                        status: 'success',
                        duration: 2000,
                      });
                    }
                  }}
                >
                  Guardar Observaciones
                </Button>
              </Box>

              {/* Información del Sistema */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <Heading size="md" mb={4}>Información del Sistema</Heading>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <Text fontWeight="bold" color="gray.600">ID</Text>
                    <Text>{graduado.id}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Fecha de Registro</Text>
                    <Text>{graduado.created_at ? new Date(graduado.created_at).toLocaleDateString() : 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Última Actualización</Text>
                    <Text>{graduado.updated_at ? new Date(graduado.updated_at).toLocaleDateString() : 'N/A'}</Text>
                  </Box>
                  {graduado.latitud && graduado.longitud && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Coordenadas</Text>
                      <Text>{graduado.latitud}, {graduado.longitud}</Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default GraduadoDetalle; 