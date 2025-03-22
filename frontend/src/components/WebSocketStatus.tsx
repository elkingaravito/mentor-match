import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { useWebSocket } from '../context/WebSocketContext';

export const WebSocketStatus: React.FC = () => {
  const { isConnected } = useWebSocket();

  return (
    <Tooltip title={isConnected ? 'Connected' : 'Disconnected'}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isConnected ? 'success.main' : 'error.main',
        }}
      />
    </Tooltip>
  );
};