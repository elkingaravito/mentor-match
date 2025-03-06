# Mentor Match - Frontend

Frontend para la aplicación Mentor Match, desarrollado con React y TypeScript.

## Requisitos

- Node.js 16+
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```
   cd frontend
   npm install
   ```

## Ejecución en desarrollo

```
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Construcción para producción

```
npm run build
```

Los archivos de la aplicación se generarán en la carpeta `dist`.

## Estructura del proyecto

- `src/`: Código fuente de la aplicación
  - `components/`: Componentes reutilizables
  - `pages/`: Páginas de la aplicación
  - `services/`: Servicios para comunicación con la API
  - `context/`: Contextos de React (autenticación, etc.)
  - `hooks/`: Hooks personalizados
  - `utils/`: Utilidades y funciones auxiliares
  - `assets/`: Imágenes, iconos y otros recursos estáticos

## Características principales

- Autenticación de usuarios (mentores y mentiles)
- Perfiles de usuario
- Matchmaking entre mentores y mentiles
- Gestión de sesiones de mentoría
- Calendario de disponibilidad
- Estadísticas y reportes
- Notificaciones
