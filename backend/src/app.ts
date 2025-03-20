import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from './websocket';
import notificationRoutes from './routes/notificationRoutes';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configurar CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

// Inicializar WebSocket
const wsServer = new WebSocketServer(server);

// API routes
app.get('/api', (req, res) => {
    res.json({ message: 'Mentor Match API' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/notifications', notificationRoutes);

// Rutas de autenticación mock
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Mock login - en producción esto debería validar credenciales
    res.json({
        data: {
            token: 'mock-jwt-token',
            user: {
                id: 1,
                name: 'Usuario de Prueba',
                email: email,
                role: 'mentor'
            }
        }
    });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Manejo de errores global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server available at ws://localhost:${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

export { app, server, wsServer };
