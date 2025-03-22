import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Box,
    Chip,
    Rating,
    CircularProgress,
} from '@mui/material';
import { Match } from '../../types';
import { useGetMenteeMatchesQuery, useGetMentorMatchesQuery } from '../../services/api';

const MatchRecommendations: React.FC<{ 
    userRole: 'mentor' | 'mentee' | 'admin';
    onMatchConnect?: (matchId: number) => Promise<void>;
}> = ({ userRole, onMatchConnect }) => {
    const {
        data: menteeMatches,
        isLoading: isMenteeLoading,
        error: menteeError
    } = useGetMenteeMatchesQuery();

    const {
        data: mentorMatches,
        isLoading: isMentorLoading,
        error: mentorError
    } = useGetMentorMatchesQuery();

    const matches = userRole === 'mentor' ? mentorMatches : menteeMatches;
    const isLoading = userRole === 'mentor' ? isMentorLoading : isMenteeLoading;
    const error = userRole === 'mentor' ? mentorError : menteeError;

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error">
                Error al cargar las recomendaciones
            </Typography>
        );
    }

    const validateMatch = (match: Match): boolean => {
        const MIN_COMPATIBILITY = 0.6; // 60% minimum compatibility
        const MIN_COMMON_INTERESTS = 2;
        
        return (
            match.compatibility_score >= MIN_COMPATIBILITY &&
            match.common_interests.length >= MIN_COMMON_INTERESTS &&
            match.status === 'pending'
        );
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Recomendaciones de {userRole === 'mentor' ? 'Mentees' : 'Mentores'}
                </Typography>
                <List>
                    {matches?.map((match: Match) => (
                        <ListItem
                            key={userRole === 'mentor' ? match.mentee.id : match.mentor.id}
                            divider
                            alignItems="flex-start"
                        >
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="subtitle1">
                                            {userRole === 'mentor' ? match.mentee.name : match.mentor.name}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={`${Math.round(match.compatibility_score * 100)}% compatible`}
                                            color="primary"
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Intereses comunes:
                                        </Typography>
                                        <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                                            {match.common_interests.map((interest, index) => (
                                                <Chip
                                                    key={index}
                                                    label={interest}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                        {userRole === 'mentee' && match.mentor.rating && (
                                            <Box display="flex" alignItems="center" mt={1}>
                                                <Rating
                                                    value={match.mentor.rating}
                                                    readOnly
                                                    size="small"
                                                />
                                                <Typography variant="body2" ml={1}>
                                                    ({match.mentor.total_sessions} sesiones)
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                }
                            />
                            <Box sx={{ ml: 2, alignSelf: 'center' }}>
                                {userRole === 'admin' ? (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => onMatchConnect?.(match.match_score.id)}
                                        disabled={match.status !== 'pending'}
                                    >
                                        {match.status === 'pending' ? 'Aprobar Match' : 
                                         match.status === 'accepted' ? 'Match Aprobado' : 'Match Rechazado'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => onMatchConnect?.(match.match_score.id)}
                                        disabled={match.status !== 'pending'}
                                    >
                                        Conectar
                                    </Button>
                                )}
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default MatchRecommendations;
