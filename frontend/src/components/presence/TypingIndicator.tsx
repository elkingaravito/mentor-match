import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { TypingIndicator as TypingIndicatorType } from '../../services/presence';

const bounce = keyframes`
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-5px); }
`;

interface TypingIndicatorProps {
    indicator: TypingIndicatorType;
    userName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
    indicator,
    userName
}) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {userName && (
                <Typography variant="caption" color="text.secondary">
                    {userName}
                </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            animation: `${bounce} 1s infinite`,
                            animationDelay: `${i * 0.1}s`
                        }}
                    />
                ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
                is typing...
            </Typography>
        </Box>
    );
};