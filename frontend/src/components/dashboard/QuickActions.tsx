import { Paper, Typography, Button, Stack } from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Find a Mentor',
      icon: SearchIcon,
      action: () => navigate('/mentors'),
      color: 'primary',
    },
    {
      title: 'Schedule Session',
      icon: CalendarIcon,
      action: () => navigate('/calendar'),
      color: 'secondary',
    },
    {
      title: 'Send Message',
      icon: MessageIcon,
      action: () => navigate('/messages'),
      color: 'info',
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Stack spacing={2}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant="outlined"
              color={action.color}
              startIcon={<Icon />}
              onClick={action.action}
              fullWidth
            >
              {action.title}
            </Button>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default QuickActions;