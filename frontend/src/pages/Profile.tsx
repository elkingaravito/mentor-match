import { Box, Paper, Typography } from '@mui/material';

const Profile = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Profile content will go here</Typography>
      </Paper>
    </Box>
  );
};

export default Profile;