import { useEffect, useState, useRef } from 'react';
import { Box, Text, Button, VStack, useToast } from '@chakra-ui/react';
import { io } from 'socket.io-client';

export const WebSocketTest = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const toast = useToast();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/socket.io';
    console.log('Conectando a WebSocket:', socketUrl);
    
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      console.log('Conectado a WebSocket');
      setConnected(true);
      setMessages(prev => [...prev, 'Conectado al servidor']);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Desconectado de WebSocket');
      setConnected(false);
      setMessages(prev => [...prev, 'Desconectado del servidor']);
    });

    socketRef.current.on('error', (error: any) => {
      console.error('Error en WebSocket:', error);
      toast({
        title: 'Error en WebSocket',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendTestMessage = () => {
    if (socketRef.current && connected) {
      socketRef.current.emit('test', { message: 'Test message' });
      setMessages(prev => [...prev, 'Mensaje de prueba enviado']);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Text>Estado de WebSocket: {connected ? 'Conectado' : 'Desconectado'}</Text>
        <Button
          colorScheme={connected ? 'green' : 'red'}
          onClick={sendTestMessage}
          isDisabled={!connected}
        >
          Enviar Mensaje de Prueba
        </Button>
        <Box maxH="200px" overflowY="auto">
          {messages.map((msg, index) => (
            <Text key={index}>{msg}</Text>
          ))}
        </Box>
      </VStack>
    </Box>
  );
}; 