import { Box, Tooltip } from '@mui/material';
import { useWebSocket } from '../context/WebSocketContext';
import { Wifi as WifiIcon, WifiOff as WifiOffIcon } from '@mui/icons-material';

export const WebSocketStatus = () => {
  const { isConnected } = useWebSocket();

  return (
    <Tooltip title={isConnected ? 'Connected' : 'Disconnected'}>
      <Box 
        component="span" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: isConnected ? 'success.main' : 'error.main'
        }}
      >
        {isConnected ? <WifiIcon /> : <WifiOffIcon />}
      </Box>
    </Tooltip>
  );
};