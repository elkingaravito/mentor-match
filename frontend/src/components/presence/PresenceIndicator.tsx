import React from 'react';
import { Box, Tooltip, Badge, Avatar, styled } from '@mui/material';
import { UserPresence } from '../../services/presence';

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const getStatusColor = (status: UserPresence['status']) => {
    const colors = {
        online: '#44b700',
        offline: '#bdbdbd',
        away: '#ffa726',
        busy: '#e57373'
    };
    return colors[status];
};

interface PresenceIndicatorProps {
    presence: UserPresence;
    showAvatar?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
    presence,
    showAvatar = true,
    size = 'medium'
}) => {
    const badgeSize = {
        small: 8,
        medium: 12,
        large: 16
    }[size];

    const avatarSize = {
        small: 24,
        medium: 40,
        large: 56
    }[size];

    const getTooltipContent = () => {
        const status = presence.status.charAt(0).toUpperCase() + presence.status.slice(1);
        if (presence.currentActivity) {
            return `${status} - ${presence.currentActivity.type} ${presence.currentActivity.details || ''}`;
        }
        return status;
    };

    return (
        <Tooltip title={getTooltipContent()}>
            <Box>
                {showAvatar ? (
                    <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: getStatusColor(presence.status),
                                width: badgeSize,
                                height: badgeSize,
                            }
                        }}
                    >
                        <Avatar
                            alt={`User ${presence.userId}`}
                            sx={{ width: avatarSize, height: avatarSize }}
                        />
                    </StyledBadge>
                ) : (
                    <Box
                        sx={{
                            width: badgeSize,
                            height: badgeSize,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(presence.status),
                            boxShadow: 1
                        }}
                    />
                )}
            </Box>
        </Tooltip>
    );
};