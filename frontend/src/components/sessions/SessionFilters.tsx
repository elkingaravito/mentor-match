import React from "react";
import {
    Box,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { SessionFilters as SessionFiltersType } from "../../types/session";

interface SessionFiltersProps {
    filters?: SessionFiltersType;
    onFiltersChange: (filters: SessionFiltersType) => void;
}

export const SessionFilters: React.FC<SessionFiltersProps> = ({
    filters,
    onFiltersChange,
}) => {
    const handleChange = (field: keyof SessionFiltersType, value: any) => {
        onFiltersChange({
            ...filters,
            [field]: value,
        });
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                        label="Fecha inicio"
                        value={filters?.startDate || null}
                        onChange={(date) => handleChange("startDate", date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                        label="Fecha fin"
                        value={filters?.endDate || null}
                        onChange={(date) => handleChange("endDate", date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={filters?.status || ""}
                            onChange={(e) => handleChange("status", e.target.value)}
                            label="Estado"
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="scheduled">Programada</MenuItem>
                            <MenuItem value="in_progress">En Progreso</MenuItem>
                            <MenuItem value="completed">Completada</MenuItem>
                            <MenuItem value="cancelled">Cancelada</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Rol</InputLabel>
                        <Select
                            value={filters?.role || ""}
                            onChange={(e) => handleChange("role", e.target.value)}
                            label="Rol"
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="mentor">Mentor</MenuItem>
                            <MenuItem value="mentee">Mentee</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );
};
