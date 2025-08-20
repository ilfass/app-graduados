import { Box, Flex, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, userType, logout } = useAuth();

  return (
    <Box 
      bg="white" 
      px={4} 
      py={4}
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      borderBottom="1px solid"
      borderColor="rgba(0, 0, 0, 0.1)"
    >
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        <RouterLink to="/" style={{ textDecoration: 'none', margin: 0, padding: 0 }}>
          <div 
            className="logo-container"
            style={{ 
              position: 'relative', 
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img 
              src="/comunidad-graduada-logo.png" 
              alt="Comunidad Graduada UNICEN" 
              style={{ 
                height: '90px', 
                width: 'auto',
                margin: 0,
                padding: 0,
                position: 'relative',
                zIndex: 1
              }} 
            />
            <div 
              className="logo-shine"
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent)',
                animation: 'logoShine 3s ease-in-out infinite',
                zIndex: 2,
                pointerEvents: 'none'
              }}
            />
          </div>
        </RouterLink>

        <Flex gap={4}>
          {isAuthenticated ? (
            <>
              {userType === 'admin' ? (
                <RouterLink to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                  <Button colorScheme="blue" variant="outline">
                    Dashboard
                  </Button>
                </RouterLink>
              ) : (
                <RouterLink to="/profile" style={{ textDecoration: 'none' }}>
                  <Button colorScheme="blue" variant="outline">
                    Mi Perfil
                  </Button>
                </RouterLink>
              )}
              <Button
                onClick={logout}
                colorScheme="blue"
                variant="outline"
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Button colorScheme="blue" variant="outline">
                  Iniciar Sesión
                </Button>
              </RouterLink>
              <RouterLink to="/register" style={{ textDecoration: 'none' }}>
                <Button colorScheme="blue" variant="outline">
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