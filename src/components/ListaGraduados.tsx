import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Link,
  Badge
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

interface Graduado {
  id: number
  nombre: string
  apellido: string
  carrera: string
  anio_graduacion: number
  ciudad: string
  pais: string
  estado: string
}

interface ListaGraduadosProps {
  graduados: Graduado[]
}

export const ListaGraduados = ({ graduados }: ListaGraduadosProps) => {
  if (graduados.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text>No se encontraron graduados que coincidan con los criterios de búsqueda.</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Carrera</Th>
            <Th>Año</Th>
            <Th>Ubicación</Th>
            <Th>Estado</Th>
          </Tr>
        </Thead>
        <Tbody>
          {graduados.map((graduado) => (
            <Tr key={graduado.id}>
              <Td>
                <Link
                  as={RouterLink}
                  to={`/profile/${graduado.id}`}
                  color="blue.500"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {graduado.nombre} {graduado.apellido}
                </Link>
              </Td>
              <Td>{graduado.carrera}</Td>
              <Td>{graduado.anio_graduacion}</Td>
              <Td>
                {graduado.ciudad}, {graduado.pais}
              </Td>
              <Td>
                <Badge
                  colorScheme={
                    graduado.estado === 'aprobado'
                      ? 'green'
                      : graduado.estado === 'pendiente'
                      ? 'yellow'
                      : 'red'
                  }
                >
                  {graduado.estado}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
} 