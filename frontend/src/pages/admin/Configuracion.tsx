import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'

const Configuracion = () => {
  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
  })
  const toast = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implementar actualización de configuración
      toast({
        title: 'Configuración actualizada',
        description: 'Los cambios se han guardado correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un error al guardar la configuración',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            Configuración del Sistema
          </Heading>
          <Text color="gray.600">
            Configura los parámetros del sistema para el envío de correos y otras funcionalidades
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Servidor SMTP</FormLabel>
              <Input
                name="smtp_host"
                value={formData.smtp_host}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Puerto SMTP</FormLabel>
              <Input
                name="smtp_port"
                value={formData.smtp_port}
                onChange={handleChange}
                placeholder="587"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Usuario SMTP</FormLabel>
              <Input
                name="smtp_user"
                value={formData.smtp_user}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Contraseña SMTP</FormLabel>
              <Input
                name="smtp_pass"
                type="password"
                value={formData.smtp_pass}
                onChange={handleChange}
                placeholder="Tu contraseña"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email de Origen</FormLabel>
              <Input
                name="smtp_from"
                value={formData.smtp_from}
                onChange={handleChange}
                placeholder="graduados@unicen.edu.ar"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              mt={4}
            >
              Guardar Configuración
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default Configuracion 