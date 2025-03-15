import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box mb={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Notificaciones</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => navigate("/notifications/settings")}
                    >
                        Configuración
                    </Button>
                </Box>
                <NotificationCenter />
            </Box>
        </Container>
    );
};

export default NotificationsPage;
