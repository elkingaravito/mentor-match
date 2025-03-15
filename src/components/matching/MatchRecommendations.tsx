import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Grid,
    Button,
    Chip,
    Skeleton,
    Stack
} from '@mui/material';
import { MatchRecommendationsProps, MentorMatch } from '../../types/matching';

const MatchCard: React.FC<{
    match: MentorMatch;
    onSelect: (match: MentorMatch) => void;
    onSchedule: (match: MentorMatch, slot: Availability) => void;
}> = ({ match, onSelect, onSchedule }) => {
    const { mentor, matchScore, availableSlots } = match;

    return (
        <Card sx={{ mb: 2, cursor: 'pointer' }}>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Avatar
                            src={mentor.profilePicture}
                            alt={mentor.name}
                            sx={{ width: 64, height: 64 }}
                        />
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h6">{mentor.name}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            {mentor.expertise.map((exp) => (
                                <Chip
                                    key={exp.id}
                                    label={`${exp.name} (${exp.level})`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6" color="primary">
                            {Math.round(matchScore.score * 100)}% Match
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => onSelect(match)}
                            sx={{ mt: 1 }}
                        >
                            View Profile
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const MatchRecommendations: React.FC<MatchRecommendationsProps> = ({
    mentorMatches,
    isLoading,
    onMatchSelect,
    onScheduleMeeting
}) => {
    if (isLoading) {
        return (
            <Box>
                {[1, 2, 3].map((i) => (
                    <Card key={i} sx={{ mb: 2 }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    <Skeleton variant="circular" width={64} height={64} />
                                </Grid>
                                <Grid item xs>
                                    <Skeleton variant="text" width="60%" />
                                    <Skeleton variant="text" width="40%" />
                                </Grid>
                                <Grid item>
                                    <Skeleton variant="rectangular" width={100} height={36} />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    }

    if (!mentorMatches?.length) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                    No mentor matches found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Try adjusting your preferences or check back later
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Recommended Mentors
            </Typography>
            {mentorMatches.map((match) => (
                <MatchCard
                    key={match.mentor.id}
                    match={match}
                    onSelect={onMatchSelect}
                    onSchedule={onScheduleMeeting}
                />
            ))}
        </Box>
    );
};

export default MatchRecommendations;