import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(authenticateToken);

// Obtener todas las notificaciones
router.get('/', getNotifications);

// Marcar una notificación como leída
router.put('/:id/read', markAsRead);

// Marcar todas las notificaciones como leídas
router.put('/read-all', markAllAsRead);

// Eliminar una notificación
router.delete('/:id', deleteNotification);

export default router;