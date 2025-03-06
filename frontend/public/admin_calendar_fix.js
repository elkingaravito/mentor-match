// Función corregida para verificar la integración con Google Calendar del mentor seleccionado
async function checkMentorCalendarIntegration() {
    const mentorId = document.getElementById('sessionMentor').value;
    if (!mentorId) return;

    try {
        // Usar el endpoint de usuarios para obtener la información del mentor
        const response = await fetch(`http://localhost:8000/api/v1/users/${mentorId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            // Verificar si el usuario tiene un perfil de mentor y si tiene integración con el calendario
            if (!userData.mentor || !userData.mentor.calendar_integration) {
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
                
                // Eliminar advertencia existente si hay una
                const existingWarning = document.getElementById('calendarIntegrationWarning');
                if (existingWarning) {
                    existingWarning.remove();
                }
                
                // Añadir la nueva advertencia después del selector de mentor
                const mentorSelect = document.getElementById('sessionMentor');
                mentorSelect.parentNode.appendChild(warningElement);
            } else {
                // Si tiene integración, eliminar cualquier advertencia existente
                const existingWarning = document.getElementById('calendarIntegrationWarning');
                if (existingWarning) {
                    existingWarning.remove();
                }
            }
        } else {
            console.error('Error al verificar la integración con el calendario:', await response.text());
        }
    } catch (error) {
        console.error('Error al verificar la integración con el calendario:', error);
    }
}

// Función para configurar la integración con Google Calendar
window.setupCalendarIntegration = async function(mentorId) {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/calendar/auth-url`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // Guardar el ID del mentor en localStorage para usarlo después del callback
            localStorage.setItem('pendingCalendarIntegrationMentorId', mentorId);
            // Abrir la URL de autorización en una nueva ventana
            window.open(data.auth_url, '_blank');
        } else {
            alert('Error al obtener la URL de autorización de Google Calendar');
        }
    } catch (error) {
        console.error('Error al configurar la integración con Google Calendar:', error);
        alert('Error al configurar la integración con Google Calendar');
    }
};
