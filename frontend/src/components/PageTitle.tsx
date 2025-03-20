import React from 'react';
import { Typography, Box, SxProps, Theme } from '@mui/material';

interface PageTitleProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    sx?: SxProps<Theme>;
}

export const PageTitle: React.FC<PageTitleProps> = ({
    icon,
    title,
    subtitle,
    action,
    sx = {}
}) => {
    return (
        <Box
            sx={{
                mb: 3,
                display: 'flex',
                flexDirection: 'column',
                ...sx
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: subtitle ? 1 : 0
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {icon}
                    <Typography variant="h4" component="h1">
                        {title}
                    </Typography>
                </Box>
                {action}
            </Box>
            {subtitle && (
                <Typography variant="subtitle1" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};