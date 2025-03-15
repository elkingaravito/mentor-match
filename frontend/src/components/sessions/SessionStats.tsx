import React from "react";
import {
    Box,
    Paper,
    Grid,
    Typography,
    CircularProgress,
} from "@mui/material";
import {
    Timeline as TimelineIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { SessionStats as SessionStatsType } from "../../types/session";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Paper sx={{ p: 2 }}>
        <Box display="flex" alignItems="center">
            <Box
                sx={{
                    backgroundColor: `${color}15`,
                    borderRadius: "50%",
                    p: 1,
                    mr: 2,
                }}
            >
                {React.cloneElement(icon as React.ReactElement, {
                    sx: { color },
                })}
            </Box>
            <Box>
                <Typography variant="body2" color="textSecondary">
                    {title}
                </Typography>
                <Typography variant="h6">{value}</Typography>
            </Box>
        </Box>
    </Paper>
);

interface SessionStatsProps {
    stats: SessionStatsType | null;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ stats }) => {
    if (!stats) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                    title="Total Sesiones"
                    value={stats.total}
                    icon={<TimelineIcon />}
                    color="#1976d2"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                    title="Completadas"
                    value={stats.completed}
                    icon={<CheckCircleIcon />}
                    color="#2e7d32"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                    title="Canceladas"
                    value={stats.cancelled}
                    icon={<CancelIcon />}
                    color="#d32f2f"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                    title="Próximas"
                    value={stats.upcoming}
                    icon={<ScheduleIcon />}
                    color="#ed6c02"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                    title="Horas Totales"
                    value={`${stats.totalHours}h`}
                    icon={<AccessTimeIcon />}
                    color="#9c27b0"
                />
            </Grid>
        </Grid>
    );
};
