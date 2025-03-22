import React, { useMemo } from 'react';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Box,
    Chip,
    Badge,
    Tooltip,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Event as EventIcon,
    Warning as WarningIcon,
    Flag as FlagIcon,
    Handshake as HandshakeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Notification, NotificationType, NotificationPriority } from '../../types/notifications';
import { useNavigate } from 'react-router-dom';

interface AdminNotificationsListProps {
    notifications: Notification[];
    onNotificationAction: (notification: Notification, action: string) => Promise<void>;
}

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'session_request':
        case 'session_update':
            return EventIcon;
        case 'mentor_application':
            return PersonIcon;
        case 'match_suggestion':
            return HandshakeIcon;
        case 'system_alert':
            return WarningIcon;
        case 'user_report':
            return FlagIcon;
        default:
            return NotificationsIcon;
    }
};

const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
        case 'urgent':
            return 'error';
        case 'high':
            return 'warning';
        case 'medium':
            return 'info';
        case 'low':
            return 'success';
        default:
            return 'default';
    }
};

const getActionButtons = (notification: Notification) => {
    switch (notification.type) {
        case 'session_request':
            return [
                { label: 'Approve', action: 'approve' },
                { label: 'Reject', action: 'reject' }
            ];
        case 'mentor_application':
            return [
                { label: 'Review', action: 'review' },
                { label: 'Approve', action: 'approve' },
                { label: 'Reject', action: 'reject' }
            ];
        case 'user_report':
            return [
                { label: 'Investigate', action: 'investigate' },
                { label: 'Dismiss', action: 'dismiss' }
            ];
        default:
            return [{ label: 'View', action: 'view' }];
    }
};

export const AdminNotificationsList: React.FC<AdminNotificationsListProps> = ({
    notifications,
    onNotificationAction
}) => {
    const navigate = useNavigate();

    const handleAction = async (notification: Notification, action: string) => {
        await onNotificationAction(notification, action);
        
        // Navigate based on notification type and action
        switch (notification.type) {
            case 'session_request':
                navigate(`/admin/sessions/${(notification as SessionNotification).sessionId}`);
                break;
            case 'mentor_application':
                navigate(`/admin/applications/${(notification as MentorApplicationNotification).applicationId}`);
                break;
            case 'user_report':
                navigate(`/admin/reports/${(notification as UserReportNotification).reportId}`);
                break;
        }
    };

    const groupedNotifications = useMemo(() => {
        return notifications.reduce((acc, notification) => {
            const priority = notification.priority;
            if (!acc[priority]) {
                acc[priority] = [];
            }
            acc[priority].push(notification);
            return acc;
        }, {} as Record<NotificationPriority, Notification[]>);
    }, [notifications]);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Administrative Notifications
            </Typography>
            {(['urgent', 'high', 'medium', 'low'] as NotificationPriority[]).map(priority => (
                groupedNotifications[priority]?.length > 0 && (
                    <Box key={priority} mb={2}>
                        <Typography variant="subtitle2" color={getPriorityColor(priority)} gutterBottom>
                            {priority.toUpperCase()} Priority
                        </Typography>
                        <List>
                            {groupedNotifications[priority].map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <ListItem
                                        sx={{
                                            bgcolor: 'background.paper',
                                            mb: 1,
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Badge
                                                color={getPriorityColor(priority)}
                                                variant="dot"
                                                invisible={notification.read}
                                            >
                                                {React.createElement(getNotificationIcon(notification.type))}
                                            </Badge>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={notification.message}
                                            secondary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Chip
                                                        size="small"
                                                        label={notification.type.replace('_', ' ')}
                                                    />
                                                    <Typography variant="caption">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {getActionButtons(notification).map(({ label, action }) => (
                                                <Tooltip key={action} title={label}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAction(notification, action)}
                                                    >
                                                        {React.createElement(getNotificationIcon(notification.type))}
                                                    </IconButton>
                                                </Tooltip>
                                            ))}
                                        </Box>
                                    </ListItem>
                                </motion.div>
                            ))}
                        </List>
                    </Box>
                )
            ))}
        </Paper>
    );
};