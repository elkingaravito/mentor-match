import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

const PublicLayout = () => {
  return (
    <Box>
      <PublicNavbar />
      <Box component="main">
        <Outlet />
      </Box>
    </Box>
  );
};

export default PublicLayout;
