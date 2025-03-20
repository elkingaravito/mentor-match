import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondary,
    Typography,
    Box,
    Chip,
    Skeleton,
    Alert,
    IconButton,
    useTheme
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useGetActiveMentorsQuery } from '../../services/api';
import { useGetUserPresenceQuery } from '../../services/presence';
import { PresenceIndicator } from '../presence/PresenceIndicator';
import { TypingIndicator } from '../presence/TypingIndicator';

interface ActiveMentor {
    id: number;
    name: string;
    currentSession?: {
        id: number;
        startTime: string;
        endTime: string;
        menteeId: number;
        menteeName: string;
        topic: string;
    };
    availability: {
        nextSlot: string;
        totalHoursToday: number;
    };
}

const MentorSkeleton: React.FC = () => (
    <ListItem>
        <ListItemAvatar>
            <Skeleton variant="circular" width={40} height={40} />
        </ListItemAvatar>
        <ListItemText
            primary={<Skeleton variant="text" width="60%" />}
            secondary={<Skeleton variant="text" width="40%" />}
        />
    </ListItem>
);

interface MentorItemProps {
    mentor: ActiveMentor;
    presence: any; // Using the actual UserPresence type from your presence service
}

const MentorItem: React.FC<MentorItemProps> = ({ mentor, presence }) => {
    const theme = useTheme();

    const getActivityChip = () => {
        if (mentor.currentSession) {
            return (
                <Chip
                    size="small"
                    color="primary"
                    label={`In session: ${mentor.currentSession.topic}`}
                />
            );
        }
        if (presence?.currentActivity) {
            return (
                <Chip
                    size="small"
                    color="info"
                    label={presence.currentActivity.details || presence.currentActivity.type}
                />
            );
        }
        return (
            <Chip
                size="small"
                color="success"
                label={`Available in ${new Date(mentor.availability.nextSlot).toLocaleTimeString()}`}
            />
        );
    };

    return (
        <ListItem
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2
            }}
        >
            <ListItemAvatar>
                <PresenceIndicator presence={presence} showAvatar={true} />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography variant="subtitle1">
                        {mentor.name}
                    </Typography>
                }
                secondary={
                    <Box sx={{ mt: 0.5 }}>
                        {getActivityChip()}
                    </Box>
                }
            />
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                    Hours today: {mentor.availability.totalHoursToday}
                </Typography>
            </Box>
        </ListItem>
    );
};

export const ActiveMentorsCard: React.FC = () => {
    const {
        data: mentorsResponse,
        isLoading: isMentorsLoading,
        isError: isMentorsError,
        error: mentorsError,
        refetch: refetchMentors
    } = useGetActiveMentorsQuery();

    const mentors = mentorsResponse?.data || [];
    const mentorIds = mentors.map(mentor => mentor.id);

    const {
        data: presenceResponse,
        isLoading: isPresenceLoading
    } = useGetUserPresenceQuery(mentorIds, {
        skip: mentorIds.length === 0
    });

    const presenceMap = new Map(
        presenceResponse?.data.map(presence => [presence.userId, presence])
    );

    if (isMentorsError) {
        return (
            <Card>
                <CardContent>
                    <Alert
                        severity="error"
                        action={
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => refetchMentors()}
                            >
                                <RefreshIcon />
                            </IconButton>
                        }
                    >
                        {mentorsError instanceof Error ? mentorsError.message : 'Failed to load active mentors'}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader
                title="Active Mentors"
                subheader="Currently online and available mentors"
            />
            <CardContent sx={{ p: 0 }}>
                <List>
                    {(isMentorsLoading || isPresenceLoading) ? (
                        Array(3).fill(0).map((_, index) => (
                            <MentorSkeleton key={index} />
                        ))
                    ) : mentors.map(mentor => (
                        <MentorItem
                            key={mentor.id}
                            mentor={mentor}
                            presence={presenceMap.get(mentor.id)}
                        />
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};