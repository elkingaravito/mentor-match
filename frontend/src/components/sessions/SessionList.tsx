import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    MoreVert as MoreVertIcon,
    Event as EventIcon,
    VideoCall as VideoCallIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Session, SessionStatus } from "../../types/session";
import { useSession } from "../../hooks/useSession";
import { SessionFilters } from "./SessionFilters";
import { SessionStats } from "./SessionStats";

const statusColors: Record<SessionStatus, "default" | "primary" | "success" | "error"> = {
    scheduled: "primary",
    in_progress: "primary",
    completed: "success",
    cancelled: "error",
};

const statusLabels: Record<SessionStatus, string> = {
    scheduled: "Programada",
    in_progress: "En Progreso",
    completed: "Completada",
    cancelled: "Cancelada",
};

export const SessionList: React.FC = () => {
    const {
        sessions,
        stats,
        loading,
        error,
        filters,
        setFilters,
        completeSession,
        cancelSession,
        rescheduleSession,
        isAdmin,
        userId
    } = useSession();

    const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
    const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
    const [feedbackDialog, setFeedbackDialog] = React.useState(false);
    const [feedback, setFeedback] = React.useState("");
    const [cancelDialog, setCancelDialog] = React.useState(false);
    const [cancelReason, setCancelReason] = React.useState("");

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, session: Session) => {
        setSelectedSession(session);
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleComplete = async () => {
        if (selectedSession) {
            await completeSession(selectedSession.id, feedback);
            setFeedbackDialog(false);
            setFeedback("");
            handleMenuClose();
        }
    };

    const handleCancel = async () => {
        if (selectedSession) {
            await cancelSession(selectedSession.id, cancelReason);
            setCancelDialog(false);
            setCancelReason("");
            handleMenuClose();
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <SessionStats stats={stats} />
                </Grid>
                <Grid item xs={12}>
                    <SessionFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        {sessions.map((session) => (
                            <Grid item xs={12} md={6} lg={4} key={session.id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6">{session.title}</Typography>
                                            <IconButton
                                                onClick={(e) => handleMenuClick(e, session)}
                                                disabled={session.status === "cancelled"}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            {format(new Date(session.start_time), "PPp")}
                                        </Typography>
                                        <Box mt={1}>
                                            <Chip
                                                label={statusLabels[session.status]}
                                                color={statusColors[session.status]}
                                                size="small"
                                            />
                                        </Box>
                                        {session.meeting_link && (
                                            <Button
                                                startIcon={<VideoCallIcon />}
                                                href={session.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                fullWidth
                                                variant="outlined"
                                                sx={{ mt: 2 }}
                                            >
                                                Unirse a la reunión
                                            </Button>
                                        )}
                                        {session.calendar_link && (
                                            <Button
                                                startIcon={<EventIcon />}
                                                href={session.calendar_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                fullWidth
                                                variant="outlined"
                                                sx={{ mt: 1 }}
                                            >
                                                Ver en calendario
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                {selectedSession?.status === "scheduled" && (
                    <>
                        <MenuItem onClick={() => setFeedbackDialog(true)}>
                            Marcar como completada
                        </MenuItem>
                        <MenuItem onClick={() => setCancelDialog(true)}>
                            Cancelar sesión
                        </MenuItem>
                    </>
                )}
            </Menu>

            <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)}>
                <DialogTitle>Completar Sesión</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Feedback"
                        fullWidth
                        multiline
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFeedbackDialog(false)}>Cancelar</Button>
                    <Button onClick={handleComplete} variant="contained">
                        Completar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
                <DialogTitle>Cancelar Sesión</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Razón de cancelación"
                        fullWidth
                        multiline
                        rows={4}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialog(false)}>Volver</Button>
                    <Button onClick={handleCancel} color="error" variant="contained">
                        Cancelar Sesión
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
