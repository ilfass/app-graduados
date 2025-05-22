import { Box, Flex, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, userType, logout } = useAuth();

  return (
    <Box bg="blue.500" px={4} py={4}>
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        <RouterLink to="/" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
          INICIO
        </RouterLink>

        <Flex gap={4}>
          {isAuthenticated ? (
            <>
              {userType === 'admin' ? (
                <RouterLink to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                  <Button colorScheme="whiteAlpha" variant="outline">
                    Dashboard
                  </Button>
                </RouterLink>
              ) : (
                <RouterLink to="/profile" style={{ textDecoration: 'none' }}>
                  <Button colorScheme="whiteAlpha" variant="outline">
                    Mi Perfil
                  </Button>
                </RouterLink>
              )}
              <Button
                onClick={logout}
                colorScheme="whiteAlpha"
                variant="outline"
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Button colorScheme="whiteAlpha" variant="outline">
                  Iniciar Sesión
                </Button>
              </RouterLink>
              <RouterLink to="/register" style={{ textDecoration: 'none' }}>
                <Button colorScheme="whiteAlpha" variant="outline">
                  Registrarse
                </Button>
              </RouterLink>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 