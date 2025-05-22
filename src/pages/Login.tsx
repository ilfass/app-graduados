import { useState } from 'react';
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
  Link,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { graduadoService, adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Primero intentamos como administrador
      try {
        const adminResponse = await adminService.login(formData.email, formData.password);
        localStorage.setItem('token', adminResponse.token);
        localStorage.setItem('userType', 'admin');
        login(adminResponse.token, 'admin');
        
        toast({
          title: 'Inicio de sesión exitoso',
          description: 'Bienvenido administrador',
          status: 'success',
          duration: 3000,
          isClosable: true
        });

        navigate('/admin/dashboard');
        return;
      } catch (error) {
        // Si falla como admin, intentamos como graduado
        const graduadoResponse = await graduadoService.login(formData.email, formData.password);
        localStorage.setItem('token', graduadoResponse.token);
        localStorage.setItem('userType', 'graduado');
        
        if (graduadoResponse.graduado) {
          localStorage.setItem('graduadoId', graduadoResponse.graduado.id.toString());
        }
        
        login(graduadoResponse.token, 'graduado');
        
        toast({
          title: 'Inicio de sesión exitoso',
          description: 'Bienvenido graduado',
          status: 'success',
          duration: 3000,
          isClosable: true
        });

        navigate('/profile');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast({
        title: 'Error',
        description: 'Credenciales inválidas',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            Iniciar Sesión
          </Heading>
          <Text color="gray.600" mb={8}>
            Ingresa tus credenciales para acceder al sistema
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Contraseña</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tu contraseña"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleShowPassword}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Box textAlign="right" width="100%">
              <Link as={RouterLink} to="/forgot-password" color="blue.500">
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              mt={4}
              isLoading={loading}
            >
              Iniciar Sesión
            </Button>

            <Text mt={4} textAlign="center">
              ¿No tienes una cuenta?{' '}
              <Link as={RouterLink} to="/register" color="blue.500">
                Regístrate aquí
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Login; 