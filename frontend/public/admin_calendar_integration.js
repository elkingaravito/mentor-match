// Función para verificar y configurar la integración con Google Calendar
window.setupCalendarIntegration = async function(mentorId) {
    try {
        // Obtener URL de autorización
        const response = await fetch('http://localhost:8000/api/v1/calendar/auth-url', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Abrir ventana de autorización
            const authWindow = window.open(data.auth_url, '_blank', 'width=800,height=600');
            
            // Mostrar mensaje al usuario
            alert('Se ha abierto una ventana para autorizar el acceso a Google Calendar. Por favor, complete el proceso de autorización y luego cierre la ventana.');
            
            // Verificar periódicamente si la integración se ha completado
            const checkIntegration = setInterval(async () => {
                try {
                    const checkResponse = await fetch('http://localhost:8000/api/v1/calendar/check-integration', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (checkResponse.ok) {
                        const checkData = await checkResponse.json();
                        
                        if (checkData.integrated) {
                            clearInterval(checkIntegration);
                            
                            // Actualizar el perfil del mentor con la integración
                            const mentorResponse = await fetch(`http://localhost:8000/api/v1/users/${mentorId}/mentor`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    calendar_integration: JSON.stringify({
                                        integrated: true,
                                        integration_date: new Date().toISOString()
                                    })
                                })
                            });
                            
                            if (mentorResponse.ok) {
                                alert('Integración con Google Calendar completada correctamente.');
                                
                                // Recargar la lista de mentores
                                loadMentors();
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error al verificar integración:', error);
                }
            }, 5000); // Verificar cada 5 segundos
            
            // Detener la verificación después de 2 minutos
            setTimeout(() => {
                clearInterval(checkIntegration);
            }, 120000);
        }
    } catch (error) {
        console.error('Error al configurar integración con Google Calendar:', error);
        alert('Error al configurar integración con Google Calendar. Por favor, inténtelo de nuevo.');
    }
};

// Agregar botón de integración con Google Calendar en la tabla de mentores
function addCalendarIntegrationButton() {
    // Obtener todas las filas de mentores
    const mentorRows = document.querySelectorAll('#mentorsTable tr');
    
    // Para cada fila, agregar un botón de integración con Google Calendar
    mentorRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            const mentorId = cells[0].textContent;
            const actionsCell = cells[cells.length - 1];
            
            // Verificar si ya existe un botón de integración
            if (!actionsCell.querySelector('.calendar-integration-btn')) {
                const actionButtons = actionsCell.querySelector('.action-buttons');
                
                if (actionButtons) {
                    const integrationButton = document.createElement('button');
                    integrationButton.className = 'action-button calendar-integration-btn';
                    integrationButton.innerHTML = '<span class="material-icons">event_available</span>';
                    integrationButton.title = 'Configurar integración con Google Calendar';
                    integrationButton.onclick = function() {
                        setupCalendarIntegration(mentorId);
                    };
                    
                    actionButtons.appendChild(integrationButton);
                }
            }
        }
    });
}

// Modificar la función loadMentors para agregar el botón de integración
const originalLoadMentors = window.loadMentors;
window.loadMentors = async function() {
    await originalLoadMentors();
    addCalendarIntegrationButton();
};
