import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
    Tooltip,
    Tab,
    Tabs,
} from '@mui/material';
import {
    Event as EventIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    VideoCall as VideoCallIcon,
    Assessment as AssessmentIcon,
    Notes as NotesIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { 
    Session, 
    SessionStatus, 
    SessionType,
    SessionUpdateRequest,
    SessionFilter 
} from '../../types/sessions';
import { useSessionManagement } from '../../hooks/useSessionManagement';

const getStatusColor = (status: SessionStatus): string => {
    switch (status) {
        case 'scheduled':
            return '#2196f3';
        case 'in_progress':
            return '#4caf50';
        case 'completed':
            return '#8bc34a';
        case 'cancelled':
            return '#f44336';
        case 'rescheduled':
            return '#ff9800';
        case 'no_show':
            return '#9c27b0';
        default:
            return '#757575';
    }
};

interface SessionDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SessionUpdateRequest) => Promise<void>;
    session?: Session;
}

const SessionDialog: React.FC<SessionDialogProps> = ({
    open,
    onClose,
    onSubmit,
    session,
}) => {
    const [status, setStatus] = useState<SessionStatus>(session?.status || 'scheduled');
    const [startTime, setStartTime] = useState<Date | null>(
        session ? parseISO(session.startTime) : null
    );
    const [endTime, setEndTime] = useState<Date | null>(
        session ? parseISO(session.endTime) : null
    );
    const [meetingUrl, setMeetingUrl] = useState(session?.meetingUrl || '');
    const [notes, setNotes] = useState(session?.notes?.[0]?.content || '');

    const handleSubmit = async () => {
        if (!session || !startTime || !endTime) return;

        await onSubmit({
            id: session.id,
            status,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            meetingUrl,
            notes: notes ? [{
                userId: 0, // Admin user ID
                content: notes,
                visibility: 'admin',
            }] : undefined,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Update Session
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as SessionStatus)}
                        >
                            {Object.values(SessionStatus).map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s.replace(/_/g, ' ')}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <DateTimePicker
                        label="Start Time"
                        value={startTime}
                        onChange={setStartTime}
                    />
                    <DateTimePicker
                        label="End Time"
                        value={endTime}
                        onChange={setEndTime}
                    />
                    <TextField
                        fullWidth
                        label="Meeting URL"
                        value={meetingUrl}
                        onChange={(e) => setMeetingUrl(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Admin Notes"
                        multiline
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!startTime || !endTime}
                >
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const SessionManagement: React.FC = () => {
    const {
        sessions,
        loading,
        error,
        summary,
        updateSession,
        deleteSession,
    } = useSessionManagement();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | undefined>();
    const [filters, setFilters] = useState<SessionFilter>({});

    const columns: GridColDef[] = [
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value.replace(/_/g, ' ')}
                    sx={{
                        backgroundColor: getStatusColor(params.value),
                        color: 'white',
                    }}
                />
            ),
        },
        {
            field: 'startTime',
            headerName: 'Start Time',
            width: 180,
            valueFormatter: (params) => 
                format(parseISO(params.value), 'PPp'),
        },
        {
            field: 'duration',
            headerName: 'Duration',
            width: 100,
            valueFormatter: (params) => `${params.value}min`,
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value.replace(/_/g, ' ')}
                    variant="outlined"
                    size="small"
                />
            ),
        },
        {
            field: 'participants',
            headerName: 'Participants',
            width: 250,
            renderCell: (params) => (
                <Box>
                    {params.value.map((p: SessionParticipant) => (
                        <Typography key={p.id} variant="body2">
                            {p.name} ({p.role})
                        </Typography>
                    ))}
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setSelectedSession(params.row);
                            setDialogOpen(true);
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDeleteSession(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                    {params.row.meetingUrl && (
                        <IconButton
                            size="small"
                            onClick={() => window.open(params.row.meetingUrl, '_blank')}
                        >
                            <VideoCallIcon />
                        </IconButton>
                    )}
                </Box>
            ),
        },
    ];

    const handleUpdateSession = async (data: SessionUpdateRequest) => {
        await updateSession(data);
        setDialogOpen(false);
        setSelectedSession(undefined);
    };

    const handleDeleteSession = async (sessionId: number) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            await deleteSession(sessionId);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Session Management</Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<AssessmentIcon />}
                    >
                        Export Report
                    </Button>
                </Box>
            </Box>

            {summary && (
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Total Sessions
                            </Typography>
                            <Typography variant="h4">
                                {summary.totalSessions}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Completed Sessions
                            </Typography>
                            <Typography variant="h4">
                                {summary.completedSessions}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Upcoming Sessions
                            </Typography>
                            <Typography variant="h4">
                                {summary.upcomingSessions}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Average Rating
                            </Typography>
                            <Typography variant="h4">
                                {summary.averageRating.toFixed(1)}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <DataGrid
                rows={sessions}
                columns={columns}
                loading={loading}
                autoHeight
                pagination
                disableSelectionOnClick
                getRowId={(row) => row.id}
            />

            {selectedSession && (
                <SessionDialog
                    open={dialogOpen}
                    onClose={() => {
                        setDialogOpen(false);
                        setSelectedSession(undefined);
                    }}
                    onSubmit={handleUpdateSession}
                    session={selectedSession}
                />
            )}
        </Box>
    );
};