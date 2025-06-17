import { Box, IconButton, useColorModeValue } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const NavigationButtons = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleBack = () => {
    navigate(-1)
  }

  const handleForward = () => {
    navigate(1)
  }

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      display="flex"
      gap="2"
      bg={bgColor}
      p="2"
      borderRadius="lg"
      boxShadow="md"
      border="1px"
      borderColor={borderColor}
      zIndex="1000"
    >
      <IconButton
        aria-label="Página anterior"
        icon={<FiChevronLeft />}
        onClick={handleBack}
        size="md"
        colorScheme="blue"
        variant="ghost"
      />
      <IconButton
        aria-label="Página siguiente"
        icon={<FiChevronRight />}
        onClick={handleForward}
        size="md"
        colorScheme="blue"
        variant="ghost"
      />
    </Box>
  )
}

export default NavigationButtons 