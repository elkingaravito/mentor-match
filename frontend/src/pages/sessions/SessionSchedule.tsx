import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetMentorQuery, useScheduleSessionMutation } from '../../services/api';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const SessionSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentorId');
  const { user } = useAuth();

  const { data: mentorData, isLoading: isMentorLoading } = useGetMentorQuery(mentorId || '');
  const [scheduleSession, { isLoading: isScheduling }] = useScheduleSessionMutation();

  const [sessionData, setSessionData] = React.useState({
    startTime: null as Date | null,
    duration: 60,
    topic: '',
    description: '',
  });

  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionData.startTime || !sessionData.topic) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await scheduleSession({
        mentorId: mentorId!,
        startTime: sessionData.startTime.toISOString(),
        duration: sessionData.duration,
        topic: sessionData.topic,
        description: sessionData.description,
      }).unwrap();

      navigate('/sessions');
    } catch (err) {
      setError('Failed to schedule session. Please try again.');
    }
  };

  if (isMentorLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!mentorData) {
    return (
      <Alert severity="error">
        Mentor not found. Please try again.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Schedule Session
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Session with {mentorData.data.name}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Session Start Time"
                value={sessionData.startTime}
                onChange={(newValue) => setSessionData(prev => ({ ...prev, startTime: newValue }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={sessionData.duration}
                  onChange={(e) => setSessionData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  label="Duration"
                >
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={90}>1.5 hours</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Topic"
                required
                value={sessionData.topic}
                onChange={(e) => setSessionData(prev => ({ ...prev, topic: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={sessionData.description}
                onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isScheduling}
                >
                  {isScheduling ? <CircularProgress size={24} /> : 'Schedule Session'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default SessionSchedule;