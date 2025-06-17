export const checkEnvironmentVariables = () => {
  const requiredVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Variables de entorno faltantes:', missingVars);
    return false;
  }

  console.log('Todas las variables de entorno están configuradas correctamente');
  return true;
}; 