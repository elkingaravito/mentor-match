import React from 'react';
import { Box, Typography } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useGetSessionsQuery } from '../services/api';

const locales = {
  'es': require('date-fns/locale/es'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useGetSessionsQuery(undefined, {
    skip: !user,
  });

  const events = sessions?.map(session => ({
    title: `Sesión con ${user?.role === 'mentor' ? 'Mentil' : 'Mentor'}`,
    start: new Date(session.start_time),
    end: new Date(session.end_time),
  })) || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mi Calendario
      </Typography>
      {isLoading ? (
        <Typography>Cargando calendario...</Typography>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      )}
    </Box>
  );
};

export default CalendarPage;