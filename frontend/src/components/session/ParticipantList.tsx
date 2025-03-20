import React from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Box,
    Chip,
    Tooltip,
    Skeleton
} from '@mui/material';
import { useGetSessionParticipantsQuery } from '../../services/sessionActivity';
import { PresenceIndicator } from '../presence/PresenceIndicator';
import { TypingIndicator } from '../presence/TypingIndicator';

interface ParticipantListProps {
    sessionId: number;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ sessionId }) => {
    const {
        data: participants,
        isLoading
    } = useGetSessionParticipantsQuery(sessionId);

    if (isLoading) {
        return (
            <List>
                {Array(2).fill(0).map((_, index) => (
                    <ListItem key={index}>
                        <ListItemAvatar>
                            <Skeleton variant="circular" width={40} height={40} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={<Skeleton variant="text" width="60%" />}
                            secondary={<Skeleton variant="text" width="40%" />}
                        />
                    </ListItem>
                ))}
            </List>
        );
    }

    return (
        <List>
            {participants?.map((participant) => (
                <ListItem key={participant.userId}>
                    <ListItemAvatar>
                        <PresenceIndicator
                            presence={{
                                userId: participant.userId,
                                status: participant.lastActivity ? 'online' : 'away',
                                lastSeen: participant.lastActivity || new Date().toISOString()
                            }}
                        />
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">
                                    {participant.userId} {/* Replace with actual user name */}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={participant.role}
                                    color={participant.role === 'mentor' ? 'primary' : 'secondary'}
                                />
                            </Box>
                        }
                        secondary={
                            participant.activeTab && (
                                <Tooltip title={`Viewing: ${participant.activeTab}`}>
                                    <Typography variant="caption" color="text.secondary">
                                        {participant.activeTab}
                                    </Typography>
                                </Tooltip>
                            )
                        }
                    />
                    {participant.viewingActivity && (
                        <TypingIndicator
                            indicator={{
                                userId: participant.userId,
                                targetId: sessionId,
                                context: participant.viewingActivity.type,
                                timestamp: Date.now()
                            }}
                        />
                    )}
                </ListItem>
            ))}
        </List>
    );
};