# Evaluación 3 - App Todo

App To-Do List con login que se conecta a una API.

## Integrante

- **Daniela Bravo**

## Descripción

Aplicación móvil que permite iniciar sesión y gestionar tareas personales. Las tareas se guardan en un servidor mediante una API.

### Funcionalidades principales:

- **Login** con email y contraseña (conexión con API real)
- **Crear tareas** con título, foto y ubicación GPS
- **Editar tareas** para cambiar el título
- **Marcar como completada/pendiente**
- **Eliminar tareas**
- **Navegación con tabs**: Home, Tareas, Perfil

## Instalación

1. Clonar o descargar el proyecto
2. Abrir terminal en la carpeta del proyecto
3. Instalar dependencias:
```bash
npm install
```
4. Instalar librerías de Expo:
```bash
npm install expo-image-picker expo-location
```
5. Iniciar la app:
```bash
npm start
```
6. Escanear el QR con **Expo Go** en el celular

## Credenciales de prueba

- **Email**: `dani@example.com`
- **Contraseña**: `password123`


## API

La app se conecta a: `https://todo-list.dobleb.cl`

Endpoints utilizados:
- POST `/auth/login` - Login
- GET `/todos` - Listar tareas
- POST `/todos` - Crear tarea
- PATCH `/todos/:id` - Editar/completar tarea
- DELETE `/todos/:id` - Eliminar tarea

## Video demostrativo

**(https://youtube.com/shorts/EY5UrvtPT7Y?feature=share)**

## Uso de IA

Para este proyecto usé la IA para:
- Solucionar errores de permisos de cámara y ubicación
- Ayuda con TypeScript y tipado de interfaces
- Ideas para mejorar el diseño de las tarjetas
