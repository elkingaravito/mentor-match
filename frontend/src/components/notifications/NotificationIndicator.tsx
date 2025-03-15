import React from "react";
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Button,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

export const NotificationIndicator: React.FC = () => {
    const navigate = useNavigate();
    const { notifications, stats, markAsRead } = useNotifications({ unread_only: true });
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notificationId: number) => {
        await markAsRead(notificationId);
        handleClose();
        // Aquí podrías agregar lógica para navegar a diferentes rutas según el tipo de notificación
    };

    const handleViewAll = () => {
        navigate("/notifications");
        handleClose();
    };

    const handleSettings = () => {
        navigate("/notifications/settings");
        handleClose();
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={stats?.unread || 0} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        maxHeight: 400,
                        width: 360,
                    },
                }}
            >
                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6">Notificaciones</Typography>
                    <IconButton size="small" onClick={handleSettings}>
                        <SettingsIcon />
                    </IconButton>
                </Box>

                <Divider />

                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            No hay notificaciones nuevas
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.slice(0, 5).map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id)}
                            sx={{
                                whiteSpace: "normal",
                                py: 1,
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle2">
                                    {notification.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}

                <Divider />

                <Box sx={{ p: 1 }}>
                    <Button fullWidth onClick={handleViewAll}>
                        Ver todas las notificaciones
                    </Button>
                </Box>
            </Menu>
        </>
    );
};
