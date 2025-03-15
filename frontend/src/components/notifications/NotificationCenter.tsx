import React from "react";
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondary,
    IconButton,
    Button,
    Divider,
    Badge,
    Chip,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    Event as EventIcon,
    People as PeopleIcon,
    Star as StarIcon,
    Info as InfoIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationType } from "../../types/notification";

const notificationIcons: Record<NotificationType, React.ReactElement> = {
    session_scheduled: <EventIcon />,
    session_reminder: <EventIcon />,
    session_cancelled: <EventIcon color="error" />,
    match_suggested: <PeopleIcon />,
    match_accepted: <PeopleIcon color="success" />,
    feedback_received: <StarIcon color="primary" />,
    system: <InfoIcon />,
};

const notificationColors: Record<NotificationType, string> = {
    session_scheduled: "#1976d2",
    session_reminder: "#ed6c02",
    session_cancelled: "#d32f2f",
    match_suggested: "#2e7d32",
    match_accepted: "#2e7d32",
    feedback_received: "#9c27b0",
    system: "#757575",
};

export const NotificationCenter: React.FC = () => {
    const {
        notifications,
        stats,
        loading,
        error,
        filters,
        setFilters,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                        Centro de Notificaciones
                    </Typography>
                    <Box>
                        <Badge badgeContent={stats?.unread || 0} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </Box>
                </Box>
                <Box display="flex" gap={2} mb={2}>
                    <Chip
                        label={`Total: ${stats?.total || 0}`}
                        variant="outlined"
                    />
                    <Chip
                        label={`Sin leer: ${stats?.unread || 0}`}
                        color="error"
                        variant="outlined"
                    />
                    <Chip
                        label={`Hoy: ${stats?.today || 0}`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="outlined"
                        onClick={() => markAllAsRead()}
                        disabled={!stats?.unread}
                    >
                        Marcar todas como leídas
                    </Button>
                </Box>
            </Paper>

            <NotificationFilters
                filters={filters}
                onFiltersChange={setFilters}
            />

            <Paper>
                <List>
                    {notifications.map((notification, index) => (
                        <React.Fragment key={notification.id}>
                            {index > 0 && <Divider />}
                            <ListItem
                                sx={{
                                    backgroundColor: notification.read ? "inherit" : "action.hover",
                                }}
                                secondaryAction={
                                    <Box>
                                        {!notification.read && (
                                            <IconButton
                                                edge="end"
                                                onClick={() => markAsRead(notification.id)}
                                                sx={{ mr: 1 }}
                                            >
                                                <CheckCircleIcon />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            edge="end"
                                            onClick={() => deleteNotification(notification.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {React.cloneElement(
                                                notificationIcons[notification.type],
                                                { sx: { color: notificationColors[notification.type] } }
                                            )}
                                            <Typography
                                                variant="subtitle1"
                                                color={notification.read ? "text.primary" : "primary"}
                                            >
                                                {notification.title}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {notification.message}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                component="div"
                                            >
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        </React.Fragment>
                    ))}
                    {notifications.length === 0 && (
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Typography align="center" color="text.secondary">
                                        No hay notificaciones
                                    </Typography>
                                }
                            />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Box>
    );
};
