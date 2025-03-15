import React from "react";
import {
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { NotificationFilters as NotificationFiltersType } from "../../types/notification";

interface NotificationFiltersProps {
    filters?: NotificationFiltersType;
    onFiltersChange: (filters: NotificationFiltersType) => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
    filters,
    onFiltersChange,
}) => {
    const handleChange = (field: keyof NotificationFiltersType, value: any) => {
        onFiltersChange({
            ...filters,
            [field]: value,
        });
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            value={filters?.type || ""}
                            onChange={(e) => handleChange("type", e.target.value)}
                            label="Tipo"
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="session_scheduled">Sesiones Programadas</MenuItem>
                            <MenuItem value="session_reminder">Recordatorios</MenuItem>
                            <MenuItem value="session_cancelled">Sesiones Canceladas</MenuItem>
                            <MenuItem value="match_suggested">Sugerencias de Match</MenuItem>
                            <MenuItem value="match_accepted">Matches Aceptados</MenuItem>
                            <MenuItem value="feedback_received">Feedback Recibido</MenuItem>
                            <MenuItem value="system">Sistema</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                        label="Desde"
                        value={filters?.startDate || null}
                        onChange={(date) => handleChange("startDate", date)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                        label="Hasta"
                        value={filters?.endDate || null}
                        onChange={(date) => handleChange("endDate", date)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={filters?.unread_only || false}
                                onChange={(e) => handleChange("unread_only", e.target.checked)}
                            />
                        }
                        label="Solo no leídas"
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};
