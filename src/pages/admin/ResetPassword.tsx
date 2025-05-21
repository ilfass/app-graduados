import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  Text,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge
} from '@chakra-ui/react'
import { graduadoService } from '../../services/api'

interface Graduado {
  id: number
  nombre: string
  apellido: string
  email: string
  estado: string
}

const ResetPassword = () => {
  const [graduados, setGraduados] = useState<Graduado[]>([])
  const [selectedGraduado, setSelectedGraduado] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await graduadoService.getAll()
      setGraduados(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los graduados',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGraduado || !newPassword) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un graduado y una nueva contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    setLoading(true)
    try {
      await graduadoService.resetPassword(selectedGraduado, newPassword)
      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      setNewPassword('')
      setSelectedGraduado(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Restablecer Contraseñas
        </Heading>

        <Box p={6} borderRadius="lg" bg="white" boxShadow="md">
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" mb={4}>
                Instrucciones:
              </Text>
              <Text mb={2}>1. Haz clic en "Cargar Graduados" para ver la lista de graduados</Text>
              <Text mb={2}>2. Selecciona el graduado al que deseas restablecer la contraseña</Text>
              <Text mb={2}>3. Ingresa la nueva contraseña</Text>
              <Text>4. Haz clic en "Restablecer Contraseña"</Text>
            </Box>

            <Button
              onClick={handleSearch}
              colorScheme="blue"
              isLoading={loading}
              loadingText="Cargando..."
            >
              Cargar Graduados
            </Button>

            {graduados.length > 0 && (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Nombre</Th>
                      <Th>Apellido</Th>
                      <Th>Email</Th>
                      <Th>Estado</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {graduados.map((graduado) => (
                      <Tr key={graduado.id}>
                        <Td>{graduado.nombre}</Td>
                        <Td>{graduado.apellido}</Td>
                        <Td>{graduado.email}</Td>
                        <Td>
                          <Badge
                            colorScheme={graduado.estado === 'aprobado' ? 'green' : 'yellow'}
                          >
                            {graduado.estado}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => setSelectedGraduado(graduado.id)}
                            isDisabled={selectedGraduado === graduado.id}
                          >
                            Seleccionar
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            {selectedGraduado && (
              <Box as="form" onSubmit={handleResetPassword}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ingresa la nueva contraseña"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="green"
                    isLoading={loading}
                    loadingText="Actualizando..."
                    width="full"
                  >
                    Restablecer Contraseña
                  </Button>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default ResetPassword 