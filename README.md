# Mentor Match

Sistema web responsivo para hacer match entre mentores y mentiles, basado en sus perfiles y disponibilidad de agenda, además de registrar estadísticas de las reuniones realizadas.

## Estructura del Proyecto

- `backend/`: API RESTful desarrollada con FastAPI y SQLAlchemy
- `frontend/`: Aplicación web responsiva desarrollada con React, TypeScript y Material-UI
- `docs/`: Documentación del proyecto, incluyendo esquemas de base de datos

## Requisitos

### Backend
- Python 3.9+
- PostgreSQL (opcional, por defecto usa SQLite)

### Frontend
- Node.js 16+
- npm o yarn

## Instalación

### Backend

1. Crear un entorno virtual:
   ```
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # En Windows: .venv\Scripts\activate
   ```

2. Instalar dependencias:
   ```
   pip install -r requirements.txt
   ```

3. Configurar variables de entorno (crear archivo `.env` en la carpeta `backend`):
   ```
   DATABASE_URL=sqlite:///./mentor_match.db
   SECRET_KEY=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/calendar/callback
   ```

### Frontend

1. Instalar dependencias:
   ```
   cd frontend
   npm install
   ```

## Ejecución

### Backend

```
cd backend
uvicorn app.main:app --reload
```

La API estará disponible en `http://localhost:8000`.
La documentación de la API estará disponible en `http://localhost:8000/docs`.

### Frontend

```
cd frontend
npm run dev
```

La aplicación web estará disponible en `http://localhost:5173`.

## Características Principales

- **Perfiles de Usuario**:
  - Mentores: Experiencia, áreas de conocimiento y disponibilidad
  - Mentiles: Necesidades de mentoría, objetivos y disponibilidad

- **Algoritmo de Matchmaking**:
  - Compatibilidad de perfiles
  - Disponibilidad de horarios
  - Recomendaciones personalizadas

- **Gestión de Calendarios**:
  - Integración con Google Calendar
  - Visualización de disponibilidad
  - Programación de reuniones

- **Estadísticas**:
  - Reuniones programadas y realizadas
  - Tiempo invertido en mentorías
  - Tendencias de participación

- **Interfaz Responsiva**:
  - Optimizada para dispositivos móviles
  - Diseño intuitivo y fácil de usar

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
