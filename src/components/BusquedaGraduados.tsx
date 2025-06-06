import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'

interface Graduado {
  id: number
  nombre: string
  apellido: string
  carrera: string
  pais: string
  ciudad: string
  estado: string
  anio_graduacion: number
}

interface BusquedaGraduadosProps {
  onResultados: (graduados: Graduado[]) => void
}

export const BusquedaGraduados = ({ onResultados }: BusquedaGraduadosProps) => {
  const [nombre, setNombre] = useState('')
  const [carrera, setCarrera] = useState('')
  const [pais, setPais] = useState('')
  const [anioDesde, setAnioDesde] = useState('')
  const [anioHasta, setAnioHasta] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleBuscar = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3001/api/graduados')
      let graduados = response.data

      // Aplicar filtros
      if (nombre) {
        graduados = graduados.filter((g: Graduado) =>
          `${g.nombre} ${g.apellido}`.toLowerCase().includes(nombre.toLowerCase())
        )
      }
      if (carrera) {
        graduados = graduados.filter((g: Graduado) =>
          g.carrera.toLowerCase().includes(carrera.toLowerCase())
        )
      }
      if (pais) {
        graduados = graduados.filter((g: Graduado) =>
          g.pais.toLowerCase().includes(pais.toLowerCase())
        )
      }
      if (anioDesde) {
        graduados = graduados.filter(
          (g: Graduado) => g.anio_graduacion >= parseInt(anioDesde)
        )
      }
      if (anioHasta) {
        graduados = graduados.filter(
          (g: Graduado) => g.anio_graduacion <= parseInt(anioHasta)
        )
      }

      onResultados(graduados)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los graduados',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" width="100%">
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Nombre</FormLabel>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Buscar por nombre o apellido"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Carrera</FormLabel>
          <Input
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            placeholder="Buscar por carrera"
          />
        </FormControl>

        <FormControl>
          <FormLabel>País</FormLabel>
          <Input
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            placeholder="Buscar por país"
          />
        </FormControl>

        <Stack direction="row" spacing={4}>
          <FormControl>
            <FormLabel>Año desde</FormLabel>
            <Input
              type="number"
              value={anioDesde}
              onChange={(e) => setAnioDesde(e.target.value)}
              placeholder="Año mínimo"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Año hasta</FormLabel>
            <Input
              type="number"
              value={anioHasta}
              onChange={(e) => setAnioHasta(e.target.value)}
              placeholder="Año máximo"
            />
          </FormControl>
        </Stack>

        <Button
          colorScheme="blue"
          onClick={handleBuscar}
          isLoading={loading}
          loadingText="Buscando..."
        >
          Buscar
        </Button>
      </Stack>
    </Box>
  )
} 