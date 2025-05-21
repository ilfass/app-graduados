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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputRightElement,
  IconButton
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
  const [isAdmin, setIsAdmin] = useState(false);
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
      const service = isAdmin ? adminService : graduadoService;
      console.log('Intentando login como:', isAdmin ? 'admin' : 'graduado');
      const response = await service.login(formData.email, formData.password);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('userType', isAdmin ? 'admin' : 'graduado');
      
      if (!isAdmin && response.graduado) {
        localStorage.setItem('graduadoId', response.graduado.id.toString());
      }
      
      login(response.token, isAdmin ? 'admin' : 'graduado');
      
      toast({
        title: 'Inicio de sesión exitoso',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      setTimeout(() => {
        navigate(isAdmin ? '/admin/dashboard' : '/profile');
      }, 100);
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
        </Box>

        <Tabs isFitted variant="enclosed" onChange={(index) => {
          setIsAdmin(index === 1);
          setFormData({ email: '', password: '' }); // Limpiar el formulario al cambiar de pestaña
        }}>
          <TabList mb="1em">
            <Tab>Graduado</Tab>
            <Tab>Administrador</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
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

                  <Box textAlign="right">
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

                  <Text mt={4}>
                    ¿No tienes una cuenta?{' '}
                    <Link as={RouterLink} to="/register" color="blue.500">
                      Regístrate aquí
                    </Link>
                  </Text>
                </VStack>
              </Box>
            </TabPanel>

            <TabPanel>
              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@unicen.edu.ar"
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

                  <Box textAlign="right">
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
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default Login; 