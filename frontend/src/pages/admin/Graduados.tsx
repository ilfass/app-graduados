import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Heading,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Select,
  VStack
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { adminService } from '../../services/api';

interface Graduado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  carrera: string;
  anio_graduacion: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
}

const Graduados = () => {
  const toast = useToast();
  const [registros, setRegistros] = useState<Graduado[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    const fetchGraduados = async () => {
      try {
        const data = await adminService.getGraduados();
        setRegistros(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los graduados',
          status: 'error',
          duration: 3000,
        });
      }
    };
    fetchGraduados();
  }, [toast]);

  const handleAprobar = async (id: number) => {
    try {
      await adminService.updateGraduadoStatus(id, 'aprobado');
      toast({
        title: 'Registro aprobado',
        status: 'success',
        duration: 3000,
      });
      // Refrescar la lista
      const data = await adminService.getGraduados();
      setRegistros(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo aprobar el graduado',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRechazar = async (id: number) => {
    try {
      await adminService.updateGraduadoStatus(id, 'rechazado');
      toast({
        title: 'Registro rechazado',
        status: 'error',
        duration: 3000,
      });
      // Refrescar la lista
      const data = await adminService.getGraduados();
      setRegistros(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo rechazar el graduado',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'green';
      case 'rechazado':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const registrosFiltrados = registros.filter(registro => {
    const coincideFiltro = 
      registro.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      registro.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
      registro.email.toLowerCase().includes(filtro.toLowerCase()) ||
      registro.carrera.toLowerCase().includes(filtro.toLowerCase());
    
    const coincideEstado = filtroEstado === 'todos' || registro.estado === filtroEstado;
    
    return coincideFiltro && coincideEstado;
  });

  return (
    <Box p={5}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Gestión de Graduados</Heading>

        <Flex gap={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nombre, email o carrera..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </InputGroup>

          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            w="200px"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
          </Select>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Carrera</Th>
                <Th>Año</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {registrosFiltrados.map(registro => (
                <Tr key={registro.id}>
                  <Td>{`${registro.nombre} ${registro.apellido}`}</Td>
                  <Td>{registro.email}</Td>
                  <Td>{registro.carrera}</Td>
                  <Td>{registro.anio_graduacion}</Td>
                  <Td>
                    <Badge colorScheme={getEstadoColor(registro.estado)}>
                      {registro.estado}
                    </Badge>
                  </Td>
                  <Td>
                    <Box>
                      <Button
                        colorScheme="green"
                        size="sm"
                        mr={2}
                        onClick={() => handleAprobar(registro.id)}
                        isDisabled={registro.estado === 'aprobado'}
                      >
                        Aprobar
                      </Button>
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleRechazar(registro.id)}
                        isDisabled={registro.estado === 'rechazado'}
                      >
                        Rechazar
                      </Button>
                    </Box>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};

export default Graduados; 