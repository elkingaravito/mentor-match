-- Esquema de Base de Datos para Mentor-Match

-- Tabla de Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'mentor', 'mentee', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Mentores
CREATE TABLE mentors (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience_years INTEGER,
    company VARCHAR(255),
    position VARCHAR(255),
    linkedin_url VARCHAR(255),
    calendar_integration JSONB -- Para almacenar tokens y configuración de Google Calendar
);

-- Tabla de Mentiles
CREATE TABLE mentees (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    goals TEXT,
    current_position VARCHAR(255),
    linkedin_url VARCHAR(255)
);

-- Tabla de Habilidades/Áreas de Conocimiento
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL -- 'technical', 'soft', 'business', etc.
);

-- Tabla de Relación Mentor-Habilidad
CREATE TABLE mentor_skills (
    mentor_id INTEGER REFERENCES mentors(user_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER NOT NULL, -- 1-5
    PRIMARY KEY (mentor_id, skill_id)
);

-- Tabla de Relación Mentil-Intereses
CREATE TABLE mentee_interests (
    mentee_id INTEGER REFERENCES mentees(user_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    interest_level INTEGER NOT NULL, -- 1-5
    PRIMARY KEY (mentee_id, skill_id)
);

-- Tabla de Disponibilidad
CREATE TABLE availability (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0-6 (domingo a sábado)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    recurrence VARCHAR(50) NOT NULL, -- 'weekly', 'biweekly', 'monthly'
    UNIQUE (user_id, day_of_week, start_time)
);

-- Tabla de Sesiones
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER REFERENCES mentors(user_id) ON DELETE SET NULL,
    mentee_id INTEGER REFERENCES mentees(user_id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'scheduled', 'completed', 'cancelled', 'no-show'
    meeting_link VARCHAR(255),
    calendar_event_id VARCHAR(255), -- ID del evento en Google Calendar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Feedback de Sesiones
CREATE TABLE session_feedback (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL, -- 1-5
    comments TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Notificaciones
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'session_reminder', 'session_cancelled', etc.
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_mentor_id ON sessions(mentor_id);
CREATE INDEX idx_sessions_mentee_id ON sessions(mentee_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
