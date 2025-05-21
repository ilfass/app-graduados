import '@chakra-ui/react'

declare module '@chakra-ui/react' {
  interface Theme {
    styles: {
      global: {
        body: {
          bg: string
        }
      }
    }
    components: {
      Button: {
        baseStyle: {
          fontWeight: string
        }
      }
    }
  }
} 