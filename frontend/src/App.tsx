import React from 'react';
import { AppRoutes } from './routes';
import { WebSocketProvider } from './context/WebSocketContext';

const App = () => {
    return (
        <WebSocketProvider>
            <AppRoutes />
        </WebSocketProvider>
    );
};

export default App;
