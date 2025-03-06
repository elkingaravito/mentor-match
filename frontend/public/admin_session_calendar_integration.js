// Función para verificar la integración con Google Calendar del mentor seleccionado
async function checkMentorCalendarIntegration() {
    const mentorId = document.getElementById('sessionMentor').value;
    
    if (!mentorId) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8000/api/v1/users/${mentorId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const mentor = await response.json();
            
            // Verificar si el mentor tiene integración con Google Calendar
            if (!mentor.mentor || !mentor.mentor.calendar_integration) {
                // Mostrar un mensaje de advertencia
                const warningElement = document.createElement('div');
                warningElement.id = 'calendarIntegrationWarning';
                warningElement.style.color = '#f44336';
                warningElement.style.marginTop = '10px';
                warningElement.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <span class="material-icons" style="margin-right: 5px;">warning</span>
                        <span>El mentor seleccionado no tiene integración con Google Calendar. Las invitaciones no se enviarán automáticamente.</span>
                    </div>
                    <button type="button" class="btn btn-secondary" style="margin-top: 5px;" onclick="setupCalendarIntegration(${mentorId})">
                        Configurar integración
                    </button>
                `;
                
                // Eliminar advertencia anterior si existe
                const existingWarning = document.getElementById('calendarIntegrationWarning');
                if (existingWarning) {
                    existingWarning.remove();
                }
                
                // Agregar la advertencia después del selector de mentor
                const mentorSelect = document.getElementById('sessionMentor');
                mentorSelect.parentNode.appendChild(warningElement);
            } else {
                // Eliminar advertencia si existe
                const existingWarning = document.getElementById('calendarIntegrationWarning');
                if (existingWarning) {
                    existingWarning.remove();
                }
            }
        }
    } catch (error) {
        console.error('Error al verificar integración con Google Calendar:', error);
    }
}

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
