// Función mejorada para guardar sesión
document.getElementById('saveSessionBtn').addEventListener('click', async function() {
    const sessionId = document.getElementById('sessionId').value;
    const mentorId = document.getElementById('sessionMentor').value;
    const menteeId = document.getElementById('sessionMentee').value;
    const date = document.getElementById('sessionDate').value;
    const time = document.getElementById('sessionTime').value;
    const duration = document.getElementById('sessionDuration').value;
    const status = document.getElementById('sessionStatus').value;
    const notes = document.getElementById('sessionNotes').value;
    
    if (!mentorId || !menteeId || !date || !time || !duration) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }
    
    // Crear objetos de fecha para inicio y fin
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const sessionData = {
        mentor_id: parseInt(mentorId),
        mentee_id: parseInt(menteeId),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: status,
        notes: notes
    };
    
    try {
        let response;
        
        if (sessionId) {
            // Actualizar sesión existente
            response = await fetch(`http://localhost:8000/api/v1/sessions/${sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sessionData)
            });
        } else {
            // Crear nueva sesión
            response = await fetch('http://localhost:8000/api/v1/sessions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sessionData)
            });
        }
        
        if (response.ok) {
            const sessionResponse = await response.json();
            
            // Verificar si se creó el evento en el calendario
            if (!sessionResponse.calendar_event_id && !sessionResponse.meeting_link) {
                // Si no se creó el evento en el calendario, mostrar un mensaje de advertencia
                alert(sessionId ? 
                    'Sesión actualizada correctamente, pero no se pudo enviar la invitación al calendario. Verifique que el mentor tenga integración con Google Calendar.' : 
                    'Sesión creada correctamente, pero no se pudo enviar la invitación al calendario. Verifique que el mentor tenga integración con Google Calendar.');
            } else {
                alert(sessionId ? 
                    'Sesión actualizada correctamente. Se ha enviado una invitación al calendario.' : 
                    'Sesión creada correctamente. Se ha enviado una invitación al calendario.');
            }
            
            closeModal('sessionModal');
            loadSessions();
            loadDashboardData();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'No se pudo guardar la sesión.'}`);
        }
    } catch (error) {
        console.error('Error al guardar la sesión:', error);
        alert('Error al guardar la sesión. Por favor, inténtelo de nuevo.');
    }
});
