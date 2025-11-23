# Evaluación 2 - App de Tareas 

 App de lista de tareas (To-Do List) que incluye Login y permite guardar fotos y ubicación en cada tarea.

## Integrantes del Grupo

- **Daniela Bravo** 

## De qué trata la App

La aplicación permite iniciar sesión y gestionar una lista de pendientes. Lo principal es:

- Tiene un **Login funcional**.
- Se pueden **crear tareas nuevas**.
- **Cámara**: Al crear una tarea, se puede sacar una foto real.
- **Mapa**: Guarda la ubicación (ciudad-pais) de donde se creó la tarea.
- Las tareas no se borran al cerrar la app (Usamos AsyncStorage).
- Tiene un **diseño personalizado** con palette rosada y fuentes distintas.

## Cómo probarla

Para correr el proyecto se necesita tener **Node.js** instalado.

1. Clonar el repo o descargar la carpeta.
2. Abrir la terminal en la carpeta del proyecto.
3. Instalar las librerías:
```bash
npm install
```
4. Iniciar la aplicación:
```bash
npx expo start --clear
```
5. Escanear el QR con la app **"Expo Go"** en el celular.

### Datos para probar el Login:
- **Email**: (Cualquiera sirve, ej: `daniela@123.com`)
- **Clave**: `1234`

## Detalles Técnicos

- Utilicé **React Native** con **Expo**.
- El lenguaje es **TypeScript**.
- Para la navegación utilicé **Expo Router** (sistema de carpetas).
- Librerías extra: `expo-image-picker` (cámara), `expo-location` (gps) y `async-storage`.

## Sobre el desarrollo y la IA

Para este trabajo utilicé IA (ChatGPT/Gemini) principalmente para:

- Entender cómo funcionaba AsyncStorage para guardar los arreglos.
- Solucionar errores de configuración con la cámara en Expo.
- Generar algunas ideas para los estilos CSS de las tarjetas.
-Añadir fuentes nuevas.
