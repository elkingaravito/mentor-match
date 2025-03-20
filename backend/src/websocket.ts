import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './utils/auth';
import { User } from './types';

interface AuthenticatedSocket extends Socket {
    user?: User;
}

export class WebSocketServer {
    private io: Server;
    private connectedUsers: Map<number, Set<string>> = new Map();

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            },
            path: '/socket.io'
        });

        // Middleware de autenticación
        this.io.use(async (socket: AuthenticatedSocket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication token missing'));
                }

                const user = await verifyToken(token);
                if (!user) {
                    return next(new Error('Invalid token'));
                }

                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket: AuthenticatedSocket) => {
            console.log(`[WebSocket] Client connected: ${socket.id}`);
            
            if (socket.user) {
                this.handleUserConnection(socket.user.id, socket.id);

                // Manejar presencia
                socket.on('presence_update', (data) => {
                    this.handlePresenceUpdate(socket, data);
                });

                // Manejar actividad de sesión
                socket.on('session_activity', (data) => {
                    this.handleSessionActivity(socket, data);
                });

                // Manejar indicadores de escritura
                socket.on('typing_indicator', (data) => {
                    this.handleTypingIndicator(socket, data);
                });

                socket.on('disconnect', () => {
                    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
                    this.handleUserDisconnection(socket.user!.id, socket.id);
                });
            }
        });
    }

    private handleUserConnection(userId: number, socketId: string) {
        if (!this.connectedUsers.has(userId)) {
            this.connectedUsers.set(userId, new Set());
        }
        this.connectedUsers.get(userId)?.add(socketId);

        // Notificar a otros usuarios
        this.broadcastUserPresence(userId, true);
    }

    private handleUserDisconnection(userId: number, socketId: string) {
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            userSockets.delete(socketId);
            if (userSockets.size === 0) {
                this.connectedUsers.delete(userId);
                // Notificar a otros usuarios
                this.broadcastUserPresence(userId, false);
            }
        }
    }

    private handlePresenceUpdate(socket: AuthenticatedSocket, data: any) {
        if (socket.user) {
            this.io.emit('presence_update', {
                userId: socket.user.id,
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    }

    private handleSessionActivity(socket: AuthenticatedSocket, data: any) {
        if (socket.user) {
            this.io.to(`session:${data.sessionId}`).emit('session_activity', {
                userId: socket.user.id,
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    }

    private handleTypingIndicator(socket: AuthenticatedSocket, data: any) {
        if (socket.user) {
            this.io.to(`session:${data.sessionId}`).emit('typing_indicator', {
                userId: socket.user.id,
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    }

    private broadcastUserPresence(userId: number, isOnline: boolean) {
        this.io.emit('presence_update', {
            userId,
            status: isOnline ? 'online' : 'offline',
            timestamp: new Date().toISOString()
        });
    }

    // Métodos públicos para enviar mensajes desde otras partes de la aplicación
    public broadcastToAll(event: string, data: any) {
        this.io.emit(event, data);
    }

    public sendToUser(userId: number, event: string, data: any) {
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            userSockets.forEach(socketId => {
                this.io.to(socketId).emit(event, data);
            });
        }
    }

    public sendToSession(sessionId: number, event: string, data: any) {
        this.io.to(`session:${sessionId}`).emit(event, data);
    }
}