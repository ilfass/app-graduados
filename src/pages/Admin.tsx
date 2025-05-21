import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FiUsers, FiMap, FiSearch, FiSettings } from 'react-icons/fi';
import Graduados from './admin/Graduados';
import Configuracion from './admin/Configuracion';

const Dashboard = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const stats = [
    {
      label: 'Total Graduados',
      value: '1,234',
      icon: FiUsers,
      color: 'blue.500',
    },
    {
      label: 'Países',
      value: '15',
      icon: FiMap,
      color: 'green.500',
    },
    {
      label: 'Carreras',
      value: '10',
      icon: FiSearch,
      color: 'purple.500',
    },
  ];

  return (
    <Box p={5}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Dashboard</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {stats.map((stat, index) => (
            <Stat
              key={index}
              px={4}
              py={5}
              bg={bgColor}
              shadow="base"
              rounded="lg"
              border="1px"
              borderColor={borderColor}
            >
              <Flex justifyContent="space-between">
                <Box>
                  <StatLabel fontWeight="medium">{stat.label}</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="medium">
                    {stat.value}
                  </StatNumber>
                </Box>
                <Box
                  p={3}
                  bg={`${stat.color}20`}
                  rounded="full"
                  color={stat.color}
                >
                  <Icon as={stat.icon} w={6} h={6} />
                </Box>
              </Flex>
            </Stat>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box
            p={6}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            border="1px"
            borderColor={borderColor}
          >
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Acciones Rápidas</Heading>
              <Button
                leftIcon={<Icon as={FiUsers} />}
                colorScheme="blue"
                onClick={() => navigate('/admin/graduados')}
              >
                Gestionar Graduados
              </Button>
              <Button
                leftIcon={<Icon as={FiSettings} />}
                colorScheme="purple"
                onClick={() => navigate('/admin/configuracion')}
              >
                Configuración
              </Button>
            </VStack>
          </Box>

          <Box
            p={6}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            border="1px"
            borderColor={borderColor}
          >
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Actividad Reciente</Heading>
              <Text color="gray.500">No hay actividad reciente para mostrar.</Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/graduados" element={<Graduados />} />
      <Route path="/configuracion" element={<Configuracion />} />
    </Routes>
  );
};

export default Admin; 