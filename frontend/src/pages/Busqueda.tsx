import { useState } from 'react'
import { Container, VStack, Heading } from '@chakra-ui/react'
import { BusquedaGraduados } from '../components/BusquedaGraduados'
import { ListaGraduados } from '../components/ListaGraduados'

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

export const Busqueda = () => {
  const [graduados, setGraduados] = useState<Graduado[]>([])

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Heading as="h1" size="xl">
          Buscar Graduados
        </Heading>

        <BusquedaGraduados onResultados={(g: Graduado[]) => setGraduados(g)} />
        <ListaGraduados graduados={graduados} />
      </VStack>
    </Container>
  )
} 