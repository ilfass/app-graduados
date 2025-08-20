# Tiltfile para app-graduados
# Configuración para desarrollo con live reload

# Configuración del frontend
docker_build(
    'graduados-frontend',
    '.',
    dockerfile='./docker/frontend/Dockerfile.dev',
    live_update=[
        sync('./frontend/src', '/app/src'),
        run('cd /app && npm run dev -- --host 0.0.0.0 --port 80'),
    ],
    ignore=['./frontend/node_modules', './frontend/dist']
)

# Configuración del backend
docker_build(
    'graduados-backend',
    '.',
    dockerfile='./docker/backend/Dockerfile.dev',
    live_update=[
        sync('./backend/src', '/app/src'),
        run('cd /app && npm run dev'),
    ],
    ignore=['./backend/node_modules', './backend/dist']
)

# Aplicar manifiestos de Kubernetes
k8s_yaml(glob(['./k8s/*.yaml']))

# Configurar recursos
k8s_resource(
    'graduados-frontend',
    port_forwards=['3002:80'],
    labels=['frontend']
)

k8s_resource(
    'graduados-backend',
    port_forwards=['3003:3000'],
    labels=['backend']
)
