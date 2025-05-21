import { useState } from 'react'
import {
  Box,
  Input,
  Select,
  HStack,
  Button,
  VStack,
  Text,
  useToast
} from '@chakra-ui/react'
import { graduadoService } from '../services/api'

interface Filtros {
  nombre: string
  carrera: string
  pais: string
  anioDesde: string
  anioHasta: string
}

interface BusquedaGraduadosProps {
  onResultados: (graduados: any[]) => void
}

export const BusquedaGraduados = ({ onResultados }: BusquedaGraduadosProps) => {
  const [filtros, setFiltros] = useState<Filtros>({
    nombre: '',
    carrera: '',
    pais: '',
    anioDesde: '',
    anioHasta: ''
  })
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  const handleBuscar = async () => {
    setLoading(true)
    try {
      const response = await graduadoService.getAll()
      let graduados = response.data

      // Aplicar filtros
      if (filtros.nombre) {
        graduados = graduados.filter(g => 
          `${g.nombre} ${g.apellido}`.toLowerCase().includes(filtros.nombre.toLowerCase())
        )
      }
      if (filtros.carrera) {
        graduados = graduados.filter(g => g.carrera === filtros.carrera)
      }
      if (filtros.pais) {
        graduados = graduados.filter(g => g.pais === filtros.pais)
      }
      if (filtros.anioDesde) {
        graduados = graduados.filter(g => g.anio_graduacion >= parseInt(filtros.anioDesde))
      }
      if (filtros.anioHasta) {
        graduados = graduados.filter(g => g.anio_graduacion <= parseInt(filtros.anioHasta))
      }

      onResultados(graduados)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al buscar graduados',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLimpiar = () => {
    setFiltros({
      nombre: '',
      carrera: '',
      pais: '',
      anioDesde: '',
      anioHasta: ''
    })
    handleBuscar()
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="bold">
          Buscar Graduados
        </Text>

        <Input
          name="nombre"
          value={filtros.nombre}
          onChange={handleChange}
          placeholder="Buscar por nombre o apellido"
        />

        <HStack spacing={4} w="100%">
          <Select
            name="carrera"
            value={filtros.carrera}
            onChange={handleChange}
            placeholder="Carrera"
          >
            <option value="Ingeniería en Sistemas">Ingeniería en Sistemas</option>
            <option value="Ingeniería Química">Ingeniería Química</option>
            <option value="Ingeniería Civil">Ingeniería Civil</option>
            <option value="Ingeniería Industrial">Ingeniería Industrial</option>
            <option value="Ingeniería Mecánica">Ingeniería Mecánica</option>
            <option value="Ingeniería Eléctrica">Ingeniería Eléctrica</option>
            <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
            <option value="Ingeniería en Alimentos">Ingeniería en Alimentos</option>
            <option value="Ingeniería Agronómica">Ingeniería Agronómica</option>
            <option value="Ingeniería en Petróleo">Ingeniería en Petróleo</option>
          </Select>

          <Select
            name="pais"
            value={filtros.pais}
            onChange={handleChange}
            placeholder="País"
          >
            <option value="Argentina">Argentina</option>
            <option value="Brasil">Brasil</option>
            <option value="Chile">Chile</option>
            <option value="Colombia">Colombia</option>
            <option value="México">México</option>
            <option value="Perú">Perú</option>
            <option value="Uruguay">Uruguay</option>
            <option value="Venezuela">Venezuela</option>
          </Select>
        </HStack>

        <HStack spacing={4} w="100%">
          <Input
            name="anioDesde"
            type="number"
            value={filtros.anioDesde}
            onChange={handleChange}
            placeholder="Año desde"
          />
          <Input
            name="anioHasta"
            type="number"
            value={filtros.anioHasta}
            onChange={handleChange}
            placeholder="Año hasta"
          />
        </HStack>

        <HStack spacing={4} w="100%">
          <Button
            colorScheme="blue"
            onClick={handleBuscar}
            isLoading={loading}
            flex={1}
          >
            Buscar
          </Button>
          <Button
            onClick={handleLimpiar}
            flex={1}
          >
            Limpiar
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
} 