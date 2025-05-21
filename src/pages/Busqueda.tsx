import { useState } from 'react'
import { Container, VStack, Heading } from '@chakra-ui/react'
import { BusquedaGraduados } from '../components/BusquedaGraduados'
import { ListaGraduados } from '../components/ListaGraduados'

export const Busqueda = () => {
  const [graduados, setGraduados] = useState([])

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Heading as="h1" size="xl">
          Buscar Graduados
        </Heading>

        <BusquedaGraduados onResultados={setGraduados} />
        <ListaGraduados graduados={graduados} />
      </VStack>
    </Container>
  )
} 