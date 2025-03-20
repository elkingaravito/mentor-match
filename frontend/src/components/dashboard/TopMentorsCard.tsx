import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Rating,
    Skeleton,
    Alert,
    IconButton,
    Chip,
    Box,
    Divider
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useGetTopMentorsQuery } from '../../services/api';
import { Mentor } from '../../types';

const MentorSkeleton: React.FC = () => (
    <ListItem>
        <ListItemAvatar>
            <Skeleton variant="circular" width={40} height={40} />
        </ListItemAvatar>
        <ListItemText
            primary={<Skeleton variant="text" width="60%" />}
            secondary={<Skeleton variant="text" width="40%" />}
        />
        <Skeleton variant="text" width={100} />
    </ListItem>
);

interface MentorItemProps {
    mentor: Mentor & {
        completed_sessions: number;
        average_rating: number;
    };
}

const MentorItem: React.FC<MentorItemProps> = ({ mentor }) => {
    const { data: presenceResponse } = useGetUserPresenceQuery([mentor.id]);
    const presence = presenceResponse?.data?.[0];

    return (
    <ListItem
        divider
        sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1
        }}
    >
                <ListItemAvatar>
                    <PresenceIndicator
                        presence={presence || {
                            userId: mentor.id,
                            status: 'offline',
                            lastSeen: new Date().toISOString()
                        }}
                        showAvatar={true}
                    />
                </ListItemAvatar>
        <ListItemText
            primary={
                <Typography variant="subtitle1" component="div">
                    {mentor.name}
                </Typography>
            }
            secondary={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        {mentor.position} at {mentor.company}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {mentor.expertise.slice(0, 3).map((exp) => (
                            <Chip
                                key={exp.id}
                                label={exp.name}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>
            }
        />
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            minWidth: 120
        }}>
            <Rating
                value={mentor.average_rating}
                precision={0.5}
                size="small"
                readOnly
            />
            <Typography variant="body2" color="text.secondary">
                {mentor.completed_sessions} sessions
            </Typography>
        </Box>
    </ListItem>
);

export const TopMentorsCard: React.FC = () => {
    const {
        data: response,
        isLoading,
        isError,
        error,
        refetch
    } = useGetTopMentorsQuery();

    const mentors = response?.data;

    if (isError) {
        return (
            <Card>
                <CardContent>
                    <Alert
                        severity="error"
                        action={
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => refetch()}
                            >
                                <RefreshIcon />
                            </IconButton>
                        }
                    >
                        {error instanceof Error ? error.message : 'Failed to load top mentors'}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader 
                title="Top Mentors"
                subheader="Most active and highly rated mentors"
            />
            <CardContent sx={{ p: 0 }}>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                            <React.Fragment key={index}>
                                <MentorSkeleton />
                                {index < 4 && <Divider />}
                            </React.Fragment>
                        ))
                    ) : mentors ? (
                        mentors.map((mentor, index) => (
                            <React.Fragment key={mentor.id}>
                                <MentorItem mentor={mentor} />
                                {index < mentors.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
                    ) : null}
                </List>
            </CardContent>
        </Card>
    );
};
