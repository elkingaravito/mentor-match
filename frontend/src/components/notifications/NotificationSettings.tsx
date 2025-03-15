import React from "react";
import {
    Box,
    Paper,
    Typography,
    FormControl,
    FormControlLabel,
    Switch,
    Slider,
    Button,
    Alert,
    CircularProgress,
    Divider,
} from "@mui/material";
import { useNotifications } from "../../hooks/useNotifications";

export const NotificationSettings: React.FC = () => {
    const { settings, loading, error, updateSettings } = useNotifications();
    const [localSettings, setLocalSettings] = React.useState(settings);
    const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "success" | "error">("idle");

    React.useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleChange = (field: keyof typeof localSettings, value: any) => {
        setLocalSettings((prev) => ({
            ...prev!,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        if (!localSettings) return;

        try {
            setSaveStatus("saving");
            await updateSettings(localSettings);
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    if (loading || !localSettings) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Configuración de Notificaciones
            </Typography>

            <Box my={3}>
                <Typography variant="subtitle1" gutterBottom>
                    Canales de Notificación
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={localSettings.email_notifications}
                            onChange={(e) => handleChange("email_notifications", e.target.checked)}
                        />
                    }
                    label="Notificaciones por Email"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={localSettings.push_notifications}
                            onChange={(e) => handleChange("push_notifications", e.target.checked)}
                        />
                    }
                    label="Notificaciones Push"
                />
            </Box>

            <Divider />

            <Box my={3}>
                <Typography variant="subtitle1" gutterBottom>
                    Tipos de Notificación
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={localSettings.session_reminders}
                            onChange={(e) => handleChange("session_reminders", e.target.checked)}
                        />
                    }
                    label="Recordatorios de Sesiones"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={localSettings.match_notifications}
                            onChange={(e) => handleChange("match_notifications", e.target.checked)}
                        />
                    }
                    label="Notificaciones de Matches"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={localSettings.feedback_notifications}
                            onChange={(e) => handleChange("feedback_notifications", e.target.checked)}
                        />
                    }
                    label="Notificaciones de Feedback"
                />
            </Box>

            <Divider />

            <Box my={3}>
                <Typography variant="subtitle1" gutterBottom>
                    Tiempo de Recordatorio
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Minutos antes de la sesión para recibir el recordatorio
                </Typography>
                <Box px={2}>
                    <Slider
                        value={localSettings.reminder_time}
                        onChange={(_, value) => handleChange("reminder_time", value)}
                        step={5}
                        marks
                        min={5}
                        max={60}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value} min`}
                    />
                </Box>
            </Box>

            <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saveStatus === "saving"}
                >
                    {saveStatus === "saving" ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </Box>

            {saveStatus === "success" && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Configuración guardada exitosamente
                </Alert>
            )}
            {saveStatus === "error" && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Error al guardar la configuración
                </Alert>
            )}
        </Paper>
    );
};
