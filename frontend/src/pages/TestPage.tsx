import { useEffect, useState } from 'react';
import { Box, VStack, Heading, Text, useToast } from '@chakra-ui/react';
import { checkEnvironmentVariables } from '../utils/envCheck';
import { WebSocketTest } from '../components/WebSocketTest';
import { graduadoService } from '../services/api';

export const TestPage = () => {
  const [envStatus, setEnvStatus] = useState<boolean | null>(null);
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const toast = useToast();

  useEffect(() => {
    // Verificar variables de entorno
    const envCheck = checkEnvironmentVariables();
    setEnvStatus(envCheck);

    // Verificar conexión a la API
    const checkApi = async () => {
      try {
        await graduadoService.getForMap();
        setApiStatus(true);
        toast({
          title: 'API Conectada',
          description: 'La conexión a la API está funcionando correctamente',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error al conectar con la API:', error);
        setApiStatus(false);
        toast({
          title: 'Error de API',
          description: 'No se pudo conectar con la API',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    checkApi();
  }, []);

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Página de Pruebas</Heading>

        {/* Estado de Variables de Entorno */}
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={4}>Variables de Entorno</Heading>
          <Text>
            Estado: {envStatus === null ? 'Verificando...' : 
                    envStatus ? '✅ Correcto' : '❌ Error'}
          </Text>
        </Box>

        {/* Estado de la API */}
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={4}>Conexión API</Heading>
          <Text>
            Estado: {apiStatus === null ? 'Verificando...' : 
                    apiStatus ? '✅ Conectado' : '❌ Error'}
          </Text>
        </Box>

        {/* Prueba de WebSocket */}
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={4}>Prueba WebSocket</Heading>
          <WebSocketTest />
        </Box>
      </VStack>
    </Box>
  );
}; 