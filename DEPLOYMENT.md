# 🚀 Guía de Despliegue - App Graduados UNICEN

## 📋 Resumen de Cambios en la Versión 5.3.0

### 🗺️ Nuevas Funcionalidades del Mapa
- **Popup rediseñado** con dos columnas
- **Foto circular** del graduado con fallback a iniciales
- **Información organizada**: nombre en azul, carrera, ubicación y trabajo
- **Biografía truncada** con botón "VER PERFIL"
- **Página de perfil público** accesible sin autenticación

### 📝 Mejoras en el Formulario de Registro
- **Biografía limitada a 250 palabras** con contador en tiempo real
- **Campo "¿Dónde trabajas/estudias actualmente?"** ahora es obligatorio
- **Eliminado campo "Institución"**
- **Eliminado campo "Documento de Identidad"**

### 🔧 Mejoras Técnicas
- **Nuevo endpoint público**: `GET /api/graduados/:id/public`
- **Campo `lugar_trabajo` obligatorio** en la base de datos
- **Migración automática** para registros existentes
- **Mejor manejo de errores** y validaciones

---

## 🐳 Construcción y Subida de Imágenes Docker

### Prerrequisitos
- Docker instalado y corriendo
- Acceso al registro Harbor (harbor.unicen.edu.ar)
- Credenciales de Harbor configuradas

### Pasos Automatizados

1. **Ejecutar el script de construcción y subida:**
   ```bash
   ./scripts/build-and-push.sh
   ```

   Este script:
   - ✅ Verifica que Docker esté corriendo
   - ✅ Inicia sesión en Harbor automáticamente
   - ✅ Construye las imágenes del backend y frontend
   - ✅ Sube las imágenes con tags `5.3.0` y `latest`
   - ✅ Limpia las imágenes locales
   - ✅ Muestra un resumen completo

### Pasos Manuales (Alternativo)

Si prefieres hacerlo manualmente:

```bash
# 1. Login a Harbor
docker login harbor.unicen.edu.ar

# 2. Construir backend
docker build -f docker/backend/Dockerfile \
  -t harbor.unicen.edu.ar/web/graduados-backend:5.3.0 \
  -t harbor.unicen.edu.ar/web/graduados-backend:latest .

# 3. Construir frontend
docker build -f docker/frontend/Dockerfile \
  -t harbor.unicen.edu.ar/web/graduados-frontend:5.3.0 \
  -t harbor.unicen.edu.ar/web/graduados-frontend:latest .

# 4. Subir imágenes
docker push harbor.unicen.edu.ar/web/graduados-backend:5.3.0
docker push harbor.unicen.edu.ar/web/graduados-backend:latest
docker push harbor.unicen.edu.ar/web/graduados-frontend:5.3.0
docker push harbor.unicen.edu.ar/web/graduados-frontend:latest
```

---

## ☸️ Despliegue en Kubernetes

### Prerrequisitos
- `kubectl` instalado y configurado
- Acceso al cluster de Kubernetes
- Contexto correcto seleccionado

### Pasos Automatizados

1. **Ejecutar el script de despliegue:**
   ```bash
   ./scripts/deploy-k8s.sh
   ```

   Este script:
   - ✅ Verifica que kubectl esté disponible
   - ✅ Confirma el contexto de Kubernetes
   - ✅ Aplica todos los recursos en orden correcto
   - ✅ Verifica el estado de los deployments
   - ✅ Muestra información de pods, servicios e ingress

### Pasos Manuales (Alternativo)

```bash
# 1. Aplicar configuración
kubectl apply -f k8s/configmap.yaml

# 2. Aplicar secretos
kubectl apply -f k8s/secretharbor.yaml

# 3. Aplicar PVC
kubectl apply -f k8s/pvc.yaml

# 4. Aplicar servicios
kubectl apply -f k8s/services.yaml

# 5. Aplicar deployments
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# 6. Aplicar ingress
kubectl apply -f k8s/ingress.yaml

# 7. Verificar estado
kubectl rollout status deployment/graduados-backend -n web-internacionales-appgraduados
kubectl rollout status deployment/graduados-frontend -n web-internacionales-appgraduados
```

---

## 🗄️ Migración de Base de Datos

### Automática
La migración se ejecuta automáticamente al iniciar el backend. Si hay registros existentes con `lugar_trabajo` NULL, se les asignará el valor "No especificado".

### Manual (Si es necesario)
```bash
# Conectar al pod del backend
kubectl exec -it <pod-backend> -n web-internacionales-appgraduados -- /bin/bash

# Ejecutar migración
npm run migrate
```

---

## 🔍 Verificación del Despliegue

### 1. Verificar Pods
```bash
kubectl get pods -n web-internacionales-appgraduados
```

### 2. Verificar Servicios
```bash
kubectl get services -n web-internacionales-appgraduados
```

### 3. Verificar Ingress
```bash
kubectl get ingress -n web-internacionales-appgraduados
```

### 4. Verificar Logs
```bash
# Backend
kubectl logs -f deployment/graduados-backend -n web-internacionales-appgraduados

# Frontend
kubectl logs -f deployment/graduados-frontend -n web-internacionales-appgraduados
```

### 5. Probar Funcionalidades
- ✅ Acceder a la aplicación web
- ✅ Probar el registro de graduados
- ✅ Verificar el mapa con el nuevo popup
- ✅ Probar la página de perfil público
- ✅ Verificar que el campo "lugar de trabajo" sea obligatorio

---

## 🚨 Solución de Problemas

### Error: "lugar_trabajo cannot be null"
**Causa:** Registros existentes sin valor en `lugar_trabajo`
**Solución:** La migración automática debería resolverlo. Si persiste, ejecutar manualmente:

```sql
UPDATE graduados SET lugar_trabajo = 'No especificado' WHERE lugar_trabajo IS NULL;
```

### Error: "ImagePullBackOff"
**Causa:** Problemas con el registro de imágenes
**Solución:**
```bash
# Verificar secretos
kubectl get secrets -n web-internacionales-appgraduados

# Recrear secretos si es necesario
kubectl apply -f k8s/secretharbor.yaml
```

### Error: "CrashLoopBackOff"
**Causa:** Error en la aplicación
**Solución:**
```bash
# Verificar logs
kubectl logs deployment/graduados-backend -n web-internacionales-appgraduados

# Reiniciar deployment
kubectl rollout restart deployment/graduados-backend -n web-internacionales-appgraduados
```

---

## 📊 Información de Versión

- **Versión:** 5.3.0
- **Fecha:** $(date)
- **Cambios principales:**
  - Rediseño del popup del mapa
  - Nueva página de perfil público
  - Mejoras en el formulario de registro
  - Campo lugar_trabajo obligatorio
  - Eliminación de campos innecesarios

---

## 📞 Contacto

Para soporte técnico o reportar problemas:
- **Equipo de Desarrollo:** [Contacto del equipo]
- **Documentación:** [Enlace a documentación]
- **Issues:** [Enlace al sistema de issues]

---

*Última actualización: $(date)* 