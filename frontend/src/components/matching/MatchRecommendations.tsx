import React, { useEffect } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Box,
    Chip,
    Rating,
    Stack,
} from "@mui/material";
import { useMatching } from "../../hooks/useMatching";
import { MatchScore } from "../../types/matching";

interface MatchCardProps {
    match: MatchScore;
    onAccept: (id: number) => void;
    onReject: (id: number) => void;
    isMentor: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onAccept, onReject, isMentor }) => {
    const profileId = isMentor ? match.mentee_id : match.mentor_id;
    
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Match Score: {(match.total_score * 100).toFixed(1)}%
                </Typography>
                
                <Stack direction="row" spacing={1} mb={2}>
                    <Chip 
                        label={`Skills: ${(match.skill_match_score * 100).toFixed(1)}%`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip 
                        label={`Availability: ${(match.availability_score * 100).toFixed(1)}%`}
                        color="primary"
                        variant="outlined"
                    />
                </Stack>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Matching Skills:
                </Typography>
                <Box sx={{ mb: 2 }}>
                    {match.match_details.matching_skills.map((skill) => (
                        <Chip 
                            key={skill}
                            label={skill}
                            size="small"
                            sx={{ m: 0.5 }}
                        />
                    ))}
                </Box>

                <Typography variant="body2" color="text.secondary">
                    Available Time Slots: {match.match_details.matching_availability}
                </Typography>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onAccept(match.id)}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => onReject(match.id)}
                    >
                        Decline
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export const MatchRecommendations: React.FC = () => {
    const {
        suggestions,
        loading,
        error,
        loadSuggestions,
        acceptMatch,
        rejectMatch,
        isMentor
    } = useMatching();

    useEffect(() => {
        loadSuggestions();
    }, [loadSuggestions]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!suggestions.length) {
        return (
            <Alert severity="info">
                No matching suggestions available at the moment.
            </Alert>
        );
    }

    return (
        <Grid container spacing={3}>
            {suggestions.map((match) => (
                <Grid item xs={12} sm={6} md={4} key={match.id}>
                    <MatchCard
                        match={match}
                        onAccept={acceptMatch}
                        onReject={rejectMatch}
                        isMentor={isMentor}
                    />
                </Grid>
            ))}
        </Grid>
    );
};
