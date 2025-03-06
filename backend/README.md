# Mentor Match - Backend

Backend para la aplicación Mentor Match, desarrollado con FastAPI.

## Requisitos

- Python 3.9+
- PostgreSQL (opcional, por defecto usa SQLite)

## Instalación

1. Clonar el repositorio
2. Crear un entorno virtual:
   ```
   python -m venv .venv
   source .venv/bin/activate  # En Windows: .venv\Scripts\activate
   ```
3. Instalar dependencias:
   ```
   pip install -r requirements.txt
   ```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
DATABASE_URL=sqlite:///./mentor_match.db
SECRET_KEY=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/calendar/callback
```

## Ejecución

```
cd backend
uvicorn app.main:app --reload
```

La API estará disponible en `http://localhost:8000`.

La documentación de la API estará disponible en `http://localhost:8000/docs`.

## Estructura del proyecto

- `app/`: Código principal de la aplicación
  - `core/`: Configuración y utilidades centrales
  - `models/`: Modelos de la base de datos (SQLAlchemy)
  - `schemas/`: Esquemas de validación (Pydantic)
  - `routers/`: Rutas de la API
  - `services/`: Servicios de negocio
  - `utils/`: Utilidades generales
- `alembic/`: Migraciones de la base de datos
