import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { NotificationSettings } from "../components/notifications/NotificationSettings";

const NotificationSettingsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box mb={4}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/notifications")}
                        sx={{ mr: 2 }}
                    >
                        Volver
                    </Button>
                    <Typography variant="h4">Configuración de Notificaciones</Typography>
                </Box>
                <NotificationSettings />
            </Box>
        </Container>
    );
};

export default NotificationSettingsPage;
