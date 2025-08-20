import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Select,
  Textarea,
  useToast,
  Text,
  Alert,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { graduadoService } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix para los íconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar eventos del mapa
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    carrera: '',
    carrera_otra: '',
    anio_graduacion: '',
    ciudad: '',
    pais: '',
    lugar_trabajo: '',
    area_desempeno: '',
    sector_trabajo: '',
    tipo_empleo: '',
    nivel_empleo: '',
    biografia: '',
    vinculado_unicen: false,
    areas_vinculacion: '',
    interes_proyectos: false,
    linkedin: '',
    password: '',
    confirmPassword: '',
    latitud: undefined as number | undefined,
    longitud: undefined as number | undefined,
  })


  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMap, setShowMap] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value || '' }))
  }



  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setFormData(prev => ({
          ...prev,
          ciudad: display_name.split(',')[0]?.trim() || '',
          pais: display_name.split(',').slice(-1)[0]?.trim() || '',
          latitud: parseFloat(lat),
          longitud: parseFloat(lon)
        }));
        setShowMap(true);
      }
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
      toast({
        title: 'Error',
        description: 'No se pudo encontrar la ubicación',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        setLoading(false)
        return
      }

      // Validar longitud mínima de contraseña
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        setLoading(false)
        return
      }

      // Validar que se haya seleccionado una ubicación
      if (!formData.latitud || !formData.longitud) {
        setError('Debes seleccionar una ubicación en el mapa')
        setLoading(false)
        return
      }

      // Crear objeto con los datos del formulario
      const graduadoData = {
        ...formData,
        anio_graduacion: parseInt(formData.anio_graduacion),
        carrera: formData.carrera === 'Otra' ? formData.carrera_otra : formData.carrera
      }

      // Eliminar campos que no necesitamos enviar
      const { confirmPassword, carrera_otra, ...dataToSend } = graduadoData;

      // Debug: mostrar los datos que se enviarán
      console.log('Datos a enviar:', dataToSend)

      await graduadoService.register(dataToSend)
      
      // Hacer login automático después del registro
      const loginResponse = await graduadoService.login(dataToSend.email, dataToSend.password)
      localStorage.setItem('token', loginResponse.token)
      
      // Redirigir a la página de éxito con los datos del usuario
      navigate('/register-success', {
        state: {
          userData: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            carrera: formData.carrera === 'Otra' ? formData.carrera_otra : formData.carrera,
            ciudad: formData.ciudad,
            pais: formData.pais
          }
        }
      })
    } catch (error) {
      console.error('Error al registrar:', error)
      setError('Error al registrar. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            Registro de Graduado
          </Heading>
          <Alert status="info" mb={4}>
            <InfoIcon mr={2} />
            Completa el formulario para registrarte como graduado de UNICEN
          </Alert>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Apellido</FormLabel>
              <Input
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Tu apellido"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Carrera</FormLabel>
              <Select
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                placeholder="Selecciona tu carrera"
              >
                <option value="Tecnicatura en Gestión Universitaria - Tandil">Tecnicatura en Gestión Universitaria - Tandil</option>
                <option value="Abogacía - Azul">Abogacía - Azul</option>
                <option value="Analista Programador Universitario - Tandil">Analista Programador Universitario - Tandil</option>
                <option value="Analista Universitario en Monitoreo del Ambiente - Tandil">Analista Universitario en Monitoreo del Ambiente - Tandil</option>
                <option value="Auxiliar Administrativo Contable (T.I. Contador Público) - Tandil">Auxiliar Administrativo Contable (T.I. Contador Público) - Tandil</option>
                <option value="Bachillerato Universitario en Derecho - Azul">Bachillerato Universitario en Derecho - Azul</option>
                <option value="Ciclo de Licenciatura en Educación Matemática - A Distancia - Tandil">Ciclo de Licenciatura en Educación Matemática - A Distancia - Tandil</option>
                <option value="Contador Público - Tandil">Contador Público - Tandil</option>
                <option value="Enfermería Profesional - Olavarría">Enfermería Profesional - Olavarría</option>
                <option value="Guía Universitario de Turismo - Tandil">Guía Universitario de Turismo - Tandil</option>
                <option value="Ingeniería Agronómica - Azul">Ingeniería Agronómica - Azul</option>
                <option value="Ingeniería Civil - Olavarría">Ingeniería Civil - Olavarría</option>
                <option value="Ingeniería Civil (CICLO FINALIZADO) - Quequén">Ingeniería Civil (CICLO FINALIZADO) - Quequén</option>
                <option value="Ingeniería de Sistemas - Tandil">Ingeniería de Sistemas - Tandil</option>
                <option value="Ingeniería de Sistemas (CICLO FINALIZADO) - Quequén">Ingeniería de Sistemas (CICLO FINALIZADO) - Quequén</option>
                <option value="Ingeniería Electromecánica - Olavarría">Ingeniería Electromecánica - Olavarría</option>
                <option value="Ingeniería Electromecánica (CICLO FINALIZADO) - Quequén">Ingeniería Electromecánica (CICLO FINALIZADO) - Quequén</option>
                <option value="Ingeniería en Agrimensura - Olavarría">Ingeniería en Agrimensura - Olavarría</option>
                <option value="Ingeniería en Seguridad e Higiene en el Trabajo - A Distancia - Olavarría">Ingeniería en Seguridad e Higiene en el Trabajo - A Distancia - Olavarría</option>
                <option value="Ingeniería en Sistemas - Olavarría">Ingeniería en Sistemas - Olavarría</option>
                <option value="Ingeniería Industrial - Olavarría">Ingeniería Industrial - Olavarría</option>
                <option value="Ingeniería Industrial (CICLO FINALIZADO) - Quequén">Ingeniería Industrial (CICLO FINALIZADO) - Quequén</option>
                <option value="Ingeniería Química - Quequén">Ingeniería Química - Quequén</option>
                <option value="Ingeniería Química - Olavarría">Ingeniería Química - Olavarría</option>
                <option value="Ingeniería Química (CICLO FINALIZADO) - Quequén">Ingeniería Química (CICLO FINALIZADO) - Quequén</option>
                <option value="Licenciatura en Teatro - Tandil">Licenciatura en Teatro - Tandil</option>
                <option value="Licenciatura en Administración - Tandil">Licenciatura en Administración - Tandil</option>
                <option value="Licenciatura en Administración Agraria - Azul">Licenciatura en Administración Agraria - Azul</option>
                <option value="Licenciatura en Antropología - Olavarría">Licenciatura en Antropología - Olavarría</option>
                <option value="Licenciatura en Ciencias de la Educación – CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil">Licenciatura en Ciencias de la Educación – CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil</option>
                <option value="Licenciatura en Ciencias de la Educación - Presencial - Tandil">Licenciatura en Ciencias de la Educación - Presencial - Tandil</option>
                <option value="Licenciatura en Ciencias Físicas - Tandil">Licenciatura en Ciencias Físicas - Tandil</option>
                <option value="Licenciatura en Ciencias Matemáticas - Tandil">Licenciatura en Ciencias Matemáticas - Tandil</option>
                <option value="Licenciatura en Comunicación Social - Facultad de Ciencias Sociales - Olavarría">Licenciatura en Comunicación Social - Facultad de Ciencias Sociales - Olavarría</option>
                <option value="Licenciatura en Diagnóstico y Gestión Ambiental - Presencial - Tandil">Licenciatura en Diagnóstico y Gestión Ambiental - Presencial - Tandil</option>
                <option value="Licenciatura en Economía Empresarial - Tandil">Licenciatura en Economía Empresarial - Tandil</option>
                <option value="Licenciatura en Educación Artística - Ciclos de Licenciatura - Se dicta en la ciudad de Azul (cohorte cerrada, ya no recibe nuevas inscripciones) - Tandil">Licenciatura en Educación Artística - Ciclos de Licenciatura - Se dicta en la ciudad de Azul (cohorte cerrada, ya no recibe nuevas inscripciones) - Tandil</option>
                <option value="Licenciatura en Educación Inicial - CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil">Licenciatura en Educación Inicial - CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil</option>
                <option value="Licenciatura en Educación Inicial - Presencial - Tandil">Licenciatura en Educación Inicial - Presencial - Tandil</option>
                <option value="Licenciatura en Enfermería - Olavarría">Licenciatura en Enfermería - Olavarría</option>
                <option value="Licenciatura en Enseñanza de las Ciencias Naturales - Olavarría">Licenciatura en Enseñanza de las Ciencias Naturales - Olavarría</option>
                <option value="Licenciatura en Geografía - CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil">Licenciatura en Geografía - CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil</option>
                <option value="Licenciatura en Geografía - Presencial - Tandil">Licenciatura en Geografía - Presencial - Tandil</option>
                <option value="Licenciatura en Gestión Ambiental – CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil">Licenciatura en Gestión Ambiental – CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil</option>
                <option value="Licenciatura en Historia – CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil">Licenciatura en Historia – CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil</option>
                <option value="Licenciatura en Historia - Presencial - Tandil">Licenciatura en Historia - Presencial - Tandil</option>
                <option value="Licenciatura en Logística Integral - Quequén">Licenciatura en Logística Integral - Quequén</option>
                <option value="Licenciatura en Logística Integral - Se dicta en la Unid. de Ens. Univ. Quequen - Olavarría">Licenciatura en Logística Integral - Se dicta en la Unid. de Ens. Univ. Quequen - Olavarría</option>
                <option value="Licenciatura en Relaciones Internacionales - Presencial - Tandil">Licenciatura en Relaciones Internacionales - Presencial - Tandil</option>
                <option value="Licenciatura en Relaciones Laborales - Ciclos de Licenciatura - Ciclo Cerrado - Olavarría">Licenciatura en Relaciones Laborales - Ciclos de Licenciatura - Ciclo Cerrado - Olavarría</option>
                <option value="Licenciatura en Tecnología Ambiental - Tandil">Licenciatura en Tecnología Ambiental - Tandil</option>
                <option value="Licenciatura en Tecnología de los Alimentos - Mención: Industrialización de Alimentos de Origen Vegetal - Olavarría">Licenciatura en Tecnología de los Alimentos - Mención: Industrialización de Alimentos de Origen Vegetal - Olavarría</option>
                <option value="Licenciatura en Tecnología de los Alimentos - Mención: Producción de Materia Prima de Origen Vegetal - Azul">Licenciatura en Tecnología de los Alimentos - Mención: Producción de Materia Prima de Origen Vegetal - Azul</option>
                <option value="Licenciatura en Tecnología de los Alimentos - Mención: Tecnología de alimentos de Origen Animal - Tandil">Licenciatura en Tecnología de los Alimentos - Mención: Tecnología de alimentos de Origen Animal - Tandil</option>
                <option value="Licenciatura en Tecnología Médica - Ciclo Cerrado - Olavarría">Licenciatura en Tecnología Médica - Ciclo Cerrado - Olavarría</option>
                <option value="Licenciatura en Trabajo Social - Presencial - Tandil">Licenciatura en Trabajo Social - Presencial - Tandil</option>
                <option value="Licenciatura en Turismo - Presencial - Tandil">Licenciatura en Turismo - Presencial - Tandil</option>
                <option value="Licenciatura en Turismo Sustentable - CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil">Licenciatura en Turismo Sustentable - CICLO DE LICENCIATURA MODALIDAD A DISTANCIA - Tandil</option>
                <option value="Medicina - Olavarría">Medicina - Olavarría</option>
                <option value="Medicina Veterinaria - Tandil">Medicina Veterinaria - Tandil</option>
                <option value="Periodismo - Olavarría">Periodismo - Olavarría</option>
                <option value="Profesorado de Educación Inicial - Presencial - Tandil">Profesorado de Educación Inicial - Presencial - Tandil</option>
                <option value="Profesorado de Física - Tandil">Profesorado de Física - Tandil</option>
                <option value="Profesorado de Historia - Presencial - Tandil">Profesorado de Historia - Presencial - Tandil</option>
                <option value="Profesorado de Matemática - Tandil">Profesorado de Matemática - Tandil</option>
                <option value="Profesorado de Teatro - Tandil">Profesorado de Teatro - Tandil</option>
                <option value="Profesorado en Antropología - Olavarría">Profesorado en Antropología - Olavarría</option>
                <option value="Profesorado en Ciencias Biológicas - Azul">Profesorado en Ciencias Biológicas - Azul</option>
                <option value="Profesorado en Ciencias de la Educación - Presencial - Tandil">Profesorado en Ciencias de la Educación - Presencial - Tandil</option>
                <option value="Profesorado en Comunicación Social - Olavarría">Profesorado en Comunicación Social - Olavarría</option>
                <option value="Profesorado en Geografía - Presencial - Tandil">Profesorado en Geografía - Presencial - Tandil</option>
                <option value="Profesorado en Informática - Tandil">Profesorado en Informática - Tandil</option>
                <option value="Profesorado en Química - Olavarría">Profesorado en Química - Olavarría</option>
                <option value="Realización Integral en Artes Audiovisuales - Tandil">Realización Integral en Artes Audiovisuales - Tandil</option>
                <option value="Tecnicatura en Equipamiento Agroindustrial - Quequén">Tecnicatura en Equipamiento Agroindustrial - Quequén</option>
                <option value="Tecnicatura en Gestión Pública - Azul">Tecnicatura en Gestión Pública - Azul</option>
                <option value="Tecnicatura en Sistemas de Información Geográfica - Tandil">Tecnicatura en Sistemas de Información Geográfica - Tandil</option>
                <option value="Tecnicatura Universitaria en Administración de Empresas Agropecuarias - Azul">Tecnicatura Universitaria en Administración de Empresas Agropecuarias - Azul</option>
                <option value="Tecnicatura Universitaria en Administración de Redes Informáticas - Tandil">Tecnicatura Universitaria en Administración de Redes Informáticas - Tandil</option>
                <option value="Tecnicatura Universitaria en Circuitos Turísticos - Tandil">Tecnicatura Universitaria en Circuitos Turísticos - Tandil</option>
                <option value="Tecnicatura Universitaria en Desarrollo de Aplicaciones Informáticas 'TUDAI' - Tandil">Tecnicatura Universitaria en Desarrollo de Aplicaciones Informáticas 'TUDAI' - Tandil</option>
                <option value="Tecnicatura Universitaria en Electromedicina - Olavarría">Tecnicatura Universitaria en Electromedicina - Olavarría</option>
                <option value="Tecnicatura Universitaria en Logística Integral - Quequén">Tecnicatura Universitaria en Logística Integral - Quequén</option>
                <option value="Tecnicatura Universitaria en Logística Integral - Se dicta en la Unid. de Ens. Univ. Quequen - Olavarría">Tecnicatura Universitaria en Logística Integral - Se dicta en la Unid. de Ens. Univ. Quequen - Olavarría</option>
                <option value="Tecnicatura Universitaria en Tecnología de los Alimentos - Tandil">Tecnicatura Universitaria en Tecnología de los Alimentos - Tandil</option>
                <option value="Tecnicatura Universitaria en Tecnología de los Alimentos - Olavarría">Tecnicatura Universitaria en Tecnología de los Alimentos - Olavarría</option>
                <option value="Tecnicatura Universitaria en Tecnología de los Alimentos - Azul">Tecnicatura Universitaria en Tecnología de los Alimentos - Azul</option>
                <option value="Tecnicaturas de la Licenciatura en Comunicación Social (Producción Mediática - Institucional) - Facultad Ciencias Sociales - Olavarría">Tecnicaturas de la Licenciatura en Comunicación Social (Producción Mediática - Institucional) - Facultad Ciencias Sociales - Olavarría</option>
                <option value="Otra">Otra</option>
              </Select>
            </FormControl>

            {formData.carrera === 'Otra' && (
              <FormControl isRequired>
                <FormLabel>Especifique su carrera</FormLabel>
                <Input
                  name="carrera_otra"
                  value={formData.carrera_otra || ''}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre de su carrera"
                />
              </FormControl>
            )}

            <FormControl isRequired>
              <FormLabel>Año de Graduación</FormLabel>
              <Input
                name="anio_graduacion"
                type="number"
                value={formData.anio_graduacion}
                onChange={handleChange}
                placeholder="Año de graduación"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Ubicación</FormLabel>
              <VStack spacing={2} align="stretch">
                <Box display="flex" gap={2}>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar ubicación..."
                  />
                  <Button onClick={handleLocationSearch}>
                    Buscar
                  </Button>
                </Box>
                {formData.latitud && formData.longitud ? (
                  <Box height="300px" width="100%" borderRadius="md" overflow="hidden">
                    <MapContainer
                      center={[formData.latitud, formData.longitud]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[formData.latitud, formData.longitud]} />
                      <MapEvents onMapClick={handleMapClick} />
                    </MapContainer>
                  </Box>
                ) : (
                  <Alert status="warning">
                    <Text>Debes seleccionar una ubicación en el mapa</Text>
                  </Alert>
                )}
              </VStack>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>¿Dónde trabajas/estudias actualmente?</FormLabel>
              <Input
                name="lugar_trabajo"
                value={formData.lugar_trabajo}
                onChange={handleChange}
                placeholder="Lugar de trabajo o estudio actual"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Área principal de desempeño laboral/profesional</FormLabel>
              <Select
                name="area_desempeno"
                value={formData.area_desempeno}
                onChange={handleChange}
                placeholder="Seleccione el área de conocimiento"
              >
                <option value="Ciencias Agrarias, de Ingeniería y de Materiales">Ciencias Agrarias, de Ingeniería y de Materiales</option>
                <option value="Ciencias Biológicas y de la Salud">Ciencias Biológicas y de la Salud</option>
                <option value="Ciencias Exactas y Naturales">Ciencias Exactas y Naturales</option>
                <option value="Ciencias Sociales y Humanidades">Ciencias Sociales y Humanidades</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Sector donde se encuentra trabajando</FormLabel>
              <Select
                name="sector_trabajo"
                value={formData.sector_trabajo}
                onChange={handleChange}
                placeholder="Seleccione el sector"
              >
                <optgroup label="Sector privado">
                  <option value="Sector privado - Relación de dependencia">Relación de dependencia</option>
                  <option value="Sector privado - Trabajo Independiente">Trabajo Independiente (autogestionado)</option>
                  <option value="Sector privado - Cooperativa">Cooperativa</option>
                </optgroup>
                <optgroup label="Sector público">
                  <option value="Sector público - Internacional">Internacional</option>
                  <option value="Sector público - Nacional">Nacional</option>
                  <option value="Sector público - Provincial">Provincial</option>
                  <option value="Sector público - Local">Local</option>
                </optgroup>
                <optgroup label="Organismos No Gubernamentales/Asociaciones Civiles">
                  <option value="Organismos No Gubernamentales/Asociaciones Civiles - Internacional">Internacional</option>
                  <option value="Organismos No Gubernamentales/Asociaciones Civiles - Nacional">Nacional</option>
                  <option value="Organismos No Gubernamentales/Asociaciones Civiles - Local">Local</option>
                </optgroup>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Breve recorrido de tu vida profesional (máximo 250 palabras)</FormLabel>
              <Textarea
                name="biografia"
                value={formData.biografia}
                onChange={handleChange}
                placeholder="Cuéntanos brevemente sobre tu trayectoria profesional..."
                maxLength={250}
                rows={4}
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                {formData.biografia.length}/250 palabras
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>¿Seguís vinculado con la UNICEN?</FormLabel>
              <Select
                name="vinculado_unicen"
                value={formData.vinculado_unicen ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, vinculado_unicen: e.target.value === 'true' }))}
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </Select>
            </FormControl>

            {formData.vinculado_unicen && (
              <FormControl>
                <FormLabel>¿Con qué áreas?</FormLabel>
                <Input
                  name="areas_vinculacion"
                  value={formData.areas_vinculacion}
                  onChange={handleChange}
                  placeholder="Especifique las áreas"
                />
              </FormControl>
            )}

            {!formData.vinculado_unicen && (
              <FormControl>
                <FormLabel>¿Te gustaría que te convoquemos para trabajar en proyectos institucionales?</FormLabel>
                <Select
                  name="interes_proyectos"
                  value={formData.interes_proyectos ? 'true' : 'false'}
                  onChange={(e) => setFormData(prev => ({ ...prev, interes_proyectos: e.target.value === 'true' }))}
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </Select>
              </FormControl>
            )}

            <FormControl>
              <FormLabel>LinkedIn</FormLabel>
              <Input
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="URL de tu perfil de LinkedIn"
              />
            </FormControl>



            {error && (
              <Alert status="error">
                <Text>{error}</Text>
              </Alert>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={loading}
            >
              Registrarse
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default Register 