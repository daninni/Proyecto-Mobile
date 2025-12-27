# App Todo List - React Native + Expo

Aplicación móvil de gestión de tareas con autenticación y conexión a backend.

## Integrante

- **Daniela Bravo** 

## Descripción

App desarrollada con React Native y Expo que permite crear y gestionar tareas personales. Incluye login, subida de fotos y ubicación GPS.

### Funcionalidades

- Login con email y contraseña
- Crear tareas con título, foto y ubicación
- Ver lista de tareas
- Editar y eliminar tareas
- Marcar tareas como completadas
- Logout

## Instalación

1. Clonar el repositorio
```bash
git clone <URL_REPO>
cd Proyecto-Mobile2-main
```

2. Instalar dependencias
```bash
npm install
```

3. **(Opcional)** Configurar variable de entorno
```bash
# Crear archivo .env en la raíz
EXPO_PUBLIC_API_URL=https://todo-list.dobleb.cl
```

4. Iniciar la aplicación
```bash
npm start
# o
expo start
```

5. Escanear el QR con Expo Go en tu celular

## 🔗 API Backend

**Base URL**: `https://todo-list.dobleb.cl`


### Credenciales de Prueba

```
Email: dani@example.com
Contraseña: password123
```

## 📱 APIs Nativas Utilizadas

- **expo-image-picker**: Captura de fotos con cámara
- **expo-location**: GPS y geocodificación inversa
- **@react-native-async-storage/async-storage**: Persistencia de token

## 🎥 Video Demostrativo

**Link**: https://youtu.be/3tRUa6sX5yA

### Uso IA:

- Reducción significativa de bugs de tipado
- Mejores prácticas de React Native sugeridas
- Implementación correcta de flujos de autenticación


```

