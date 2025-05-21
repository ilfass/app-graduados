import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  VStack,
  HStack,
  Image,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { adminService } from '../../services/api';

interface GraduadoPendiente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  carrera: string;
  anio_graduacion: number;
  documento_identidad: string;
}

const ValidacionGraduados = () => {
  const [graduados, setGraduados] = useState<GraduadoPendiente[]>([]);
  const [selectedGraduado, setSelectedGraduado] = useState<GraduadoPendiente | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchGraduadosPendientes();
  }, []);

  const fetchGraduadosPendientes = async () => {
    try {
      const data = await adminService.getGraduadosPendientes();
      setGraduados(data);
    } catch (error) {
      console.error('Error al cargar graduados pendientes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los graduados pendientes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async (estado: 'aprobado' | 'rechazado') => {
    if (!selectedGraduado) return;

    try {
      setLoading(true);
      await adminService.validarGraduado(selectedGraduado.id, {
        estado,
        observaciones,
      });

      toast({
        title: 'Éxito',
        description: `Graduado ${estado === 'aprobado' ? 'aprobado' : 'rechazado'} correctamente`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Actualizar lista y cerrar modal
      fetchGraduadosPendientes();
      onClose();
      setSelectedGraduado(null);
      setObservaciones('');
    } catch (error) {
      console.error('Error al validar graduado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo validar al graduado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalles = (graduado: GraduadoPendiente) => {
    setSelectedGraduado(graduado);
    onOpen();
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl">
          Validación de Graduados
        </Heading>

        {loading ? (
          <Text>Cargando...</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Email</Th>
                  <Th>Carrera</Th>
                  <Th>Año</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {graduados.map((graduado) => (
                  <Tr key={graduado.id}>
                    <Td>{`${graduado.nombre} ${graduado.apellido}`}</Td>
                    <Td>{graduado.email}</Td>
                    <Td>{graduado.carrera}</Td>
                    <Td>{graduado.anio_graduacion}</Td>
                    <Td>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleVerDetalles(graduado)}
                      >
                        Ver Detalles
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Validar Graduado: {selectedGraduado?.nombre} {selectedGraduado?.apellido}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch" pb={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>Documento de Identidad:</Text>
                  <Image
                    src={selectedGraduado?.documento_identidad}
                    alt="Documento de identidad"
                    maxH="400px"
                    objectFit="contain"
                  />
                </Box>

                <Textarea
                  placeholder="Observaciones (opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />

                <HStack spacing={4} justify="flex-end">
                  <Button
                    colorScheme="red"
                    onClick={() => handleValidar('rechazado')}
                    isLoading={loading}
                  >
                    Rechazar
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={() => handleValidar('aprobado')}
                    isLoading={loading}
                  >
                    Aprobar
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default ValidacionGraduados; 