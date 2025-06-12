import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const WebSocketTest = () => {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    console.log('Conectando a WebSocket:', socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      path: '/socket.io'
    });

    newSocket.on('connect', () => {
      console.log('Conectado al WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del WebSocket');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Error en WebSocket:', error);
    });

    newSocket.on('message', (message) => {
      console.log('Mensaje recibido:', message);
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendTestMessage = () => {
    if (socket && isConnected) {
      console.log('Enviando mensaje de prueba...');
      socket.emit('message', 'Mensaje de prueba desde el cliente');
    } else {
      console.log('No se puede enviar mensaje: WebSocket no conectado');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test de WebSocket</h2>
      <div className="mb-4">
        <p>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</p>
        <button
          onClick={sendTestMessage}
          disabled={!isConnected}
          className={`px-4 py-2 rounded ${
            isConnected 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Enviar mensaje de prueba
        </button>
      </div>
      <div className="mt-4">
        <h3 className="font-bold mb-2">Mensajes recibidos:</h3>
        <div className="border rounded p-2 h-40 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="mb-1">{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}; 