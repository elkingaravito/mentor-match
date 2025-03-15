/**
 * Verifica si un mentor tiene integración con Google Calendar y muestra un aviso si es necesario
 */
async function checkMentorCalendarIntegration() {
    const mentorId = document.getElementById('sessionMentor').value;
    if (!mentorId) return;

    try {
        const token = localStorage.getItem('token');
        
        // Primero intentamos obtener la información del usuario/mentor directamente
        const response = await fetch(`http://localhost:8000/api/v1/users/${mentorId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            // Manejo de CORS
            mode: 'cors',
            credentials: 'include'
        }).catch(error => {
            console.log("Error en la solicitud inicial:", error);
            return { ok: false };
        });

        if (response.ok) {
            const data = await response.json();
            const hasCalendarIntegration = data.mentor && data.mentor.calendar_integration;
            
            // Eliminar advertencia anterior si existe
            const existingWarning = document.getElementById('calendarIntegrationWarning');
            if (existingWarning) {
                existingWarning.remove();
            }

            // Si no tiene integración, mostrar advertencia
            if (!hasCalendarIntegration) {
                const warningElement = document.createElement('div');
                warningElement.id = 'calendarIntegrationWarning';
                warningElement.style.backgroundColor = '#fff3cd';
                warningElement.style.color = '#856404';
                warningElement.style.padding = '10px';
                warningElement.style.borderRadius = '4px';
                warningElement.style.marginTop = '10px';
                warningElement.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <span class="material-icons" style="margin-right: 5px;">warning</span>
                        <span>El mentor seleccionado no tiene integración con Google Calendar. Las invitaciones no se enviarán automáticamente.</span>
                    </div>
                    <button type="button" class="btn btn-secondary" style="margin-top: 5px;" onclick="startCalendarIntegration(${mentorId})">
                        Configurar integración
                    </button>
                `;

                // Agregar la advertencia después del selector de mentor
                const mentorSelect = document.getElementById('sessionMentor');
                mentorSelect.parentNode.appendChild(warningElement);
            }
        } else {
            // Manejo en caso de error en la llamada API
            console.error("No se pudo verificar la integración con el calendario. El API podría estar caído o hay un problema de CORS.");
        }
    } catch (error) {
        console.error('Error al verificar integración con Google Calendar:', error);
    }
}


// También podemos añadir un método alternativo que use el backend existente si es que está disponible
async function setupCalendarIntegration(mentorId) {
    try {
        // Primero verificamos si la función global startCalendarIntegration existe
        if (typeof window.startCalendarIntegration === 'function') {
            window.startCalendarIntegration(mentorId);
            return;
        }
        
        // Si no existe, usamos la implementación alternativa
        const token = localStorage.getItem('token');
        alert('Iniciando configuración de integración con Google Calendar para el mentor #' + mentorId);
        
        // Aquí iría la lógica de redirección a la página de autorización de Google Calendar
        // Como fallback básico, abrimos una ventana y mostramos un mensaje
        const authWindow = window.open('about:blank', '_blank', 'width=800,height=600');
        if (authWindow) {
            authWindow.document.write(`
                <html>
                <head>
                    <title>Configuración de Google Calendar</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                        .notice { background-color: #e8f5e9; padding: 15px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Configuración de Google Calendar</h1>
                    <div class="notice">
                        <p>Para completar la integración con Google Calendar, el backend debe proporcionar una URL de autorización.</p>
                        <p>Por favor, contacte al administrador del sistema para habilitar esta funcionalidad.</p>
                    </div>
                    <p>Puede cerrar esta ventana cuando termine.</p>
                </body>
                </html>
            `);
        } else {
            alert('No se pudo abrir la ventana de configuración. Por favor, asegúrese de que las ventanas emergentes estén permitidas en su navegador.');
        }
    } catch (error) {
        console.error('Error al iniciar la integración con Google Calendar:', error);
        alert('Error al iniciar la integración con Google Calendar: ' + error.message);
    }
}

// Exportar funciones globalmente
window.checkMentorCalendarIntegration = checkMentorCalendarIntegration;
window.setupCalendarIntegration = setupCalendarIntegration;

// Agregar event listener al selector de mentor
document.getElementById('sessionMentor').addEventListener('change', checkMentorCalendarIntegration);

// Modificar la función editSession para verificar la integración con Google Calendar
const originalEditSession = window.editSession;
window.editSession = async function(id) {
    await originalEditSession(id);
    
    // Verificar la integración con Google Calendar después de cargar los datos de la sesión
    setTimeout(checkMentorCalendarIntegration, 500);
};

// Modificar la función para abrir el modal de creación de sesión
document.getElementById('createSessionBtn').addEventListener('click', function() {
    document.getElementById('sessionModalTitle').textContent = 'Crear Sesión';
    document.getElementById('sessionForm').reset();
    document.getElementById('sessionId').value = '';
    loadMentorsAndMentees();
    openModal('sessionModal');
    
    // Eliminar advertencia si existe
    const existingWarning = document.getElementById('calendarIntegrationWarning');
    if (existingWarning) {
        existingWarning.remove();
    }
});
