import { Request, Response } from 'express';

// Mock data para notificaciones
let notifications = [
    {
        id: 1,
        title: "Nueva sesión programada",
        message: "Tu próxima sesión está programada para mañana a las 15:00",
        type: "session_scheduled",
        read: false,
        created_at: new Date().toISOString(),
        related_id: 123
    },
    {
        id: 2,
        title: "Match sugerido",
        message: "Tenemos un nuevo mentor que coincide con tus intereses",
        type: "match_suggested",
        read: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        related_id: 456
    },
    {
        id: 3,
        title: "Feedback recibido",
        message: "Has recibido una nueva evaluación de tu última sesión",
        type: "feedback_received",
        read: true,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        related_id: 789
    }
];

export const getNotifications = async (req: Request, res: Response) => {
    try {
        // En una implementación real, esto vendría de la base de datos
        // y estaría filtrado por el usuario actual
        res.json({
            data: notifications,
            message: "Notificaciones recuperadas exitosamente"
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({
            error: "Error al obtener las notificaciones"
        });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notificationId = parseInt(id);

        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) {
            return res.status(404).json({
                error: "Notificación no encontrada"
            });
        }

        notification.read = true;
        
        res.json({
            data: null,
            message: "Notificación marcada como leída"
        });
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        res.status(500).json({
            error: "Error al marcar la notificación como leída"
        });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        notifications = notifications.map(n => ({
            ...n,
            read: true
        }));

        res.json({
            data: null,
            message: "Todas las notificaciones marcadas como leídas"
        });
    } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        res.status(500).json({
            error: "Error al marcar todas las notificaciones como leídas"
        });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notificationId = parseInt(id);

        const notificationIndex = notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) {
            return res.status(404).json({
                error: "Notificación no encontrada"
            });
        }

        notifications.splice(notificationIndex, 1);

        res.json({
            data: null,
            message: "Notificación eliminada exitosamente"
        });
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({
            error: "Error al eliminar la notificación"
        });
    }
};