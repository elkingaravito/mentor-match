import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import { useAuth } from '../context/AuthContext';
import { useGetSessionsQuery } from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'es': es };

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
    id: session.id,
    title: `Sesión con ${user?.role === 'mentor' ? 'Mentee' : 'Mentor'}`,
    start: new Date(session.start_time),
    end: new Date(session.end_time),
    status: session.status,
  })) || [];

  const handleSelectEvent = (event: any) => {
    // Aquí puedes agregar la lógica para mostrar detalles de la sesión
    console.log('Sesión seleccionada:', event);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mi Calendario
      </Typography>
      <Box sx={{ 
        height: 'calc(100vh - 200px)', 
        backgroundColor: 'background.paper',
        borderRadius: 1,
        p: 2,
        '& .rbc-event': {
          backgroundColor: 'primary.main',
        },
      }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          defaultView="week"
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día"
          }}
        />
      </Box>
    </Box>
  );
};
export default CalendarPage;