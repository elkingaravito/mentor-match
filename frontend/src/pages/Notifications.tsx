import { Box, Paper, Typography } from '@mui/material';

const Notifications = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Notifications content will go here</Typography>
      </Paper>
    </Box>
  );
};

export default Notifications;