/**
 * Funciones para la integración con Google Calendar
 * Este archivo contiene las funciones necesarias para manejar la integración
 * con Google Calendar para las sesiones de mentoría.
 */

/**
 * Verifica si un mentor tiene integración con Google Calendar
 * @param {number} mentorId - ID del mentor a verificar
 * @returns {Promise<boolean>} - Promesa que resuelve a true si el mentor tiene integración, false en caso contrario
 */
async function hasMentorCalendarIntegration(mentorId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/v1/users/${mentorId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.mentor && data.mentor.calendar_integration;
        }
        
        return false;
    } catch (error) {
        console.error('Error al verificar integración con Google Calendar:', error);
        return false;
    }
}

/**
 * Crea un evento en Google Calendar para una sesión
 * @param {Object} sessionData - Datos de la sesión
 * @returns {Promise<Object>} - Promesa que resuelve a la respuesta del servidor
 */
async function createCalendarEvent(sessionData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/v1/calendar/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                mentor_id: sessionData.mentor_id,
                mentee_id: sessionData.mentee_id,
                session_id: sessionData.id,
                start_time: sessionData.start_time,
                end_time: sessionData.end_time,
                title: `Sesión de Mentoría: ${sessionData.mentor_name} y ${sessionData.mentee_name}`,
                description: sessionData.notes || 'Sesión de mentoría a través de Mentor Match'
            })
        });

        return await response.json();
    } catch (error) {
        console.error('Error al crear evento en Google Calendar:', error);
        throw error;
    }
}

/**
 * Actualiza un evento en Google Calendar para una sesión
 * @param {Object} sessionData - Datos de la sesión
 * @returns {Promise<Object>} - Promesa que resuelve a la respuesta del servidor
 */
async function updateCalendarEvent(sessionData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/v1/calendar/events/${sessionData.calendar_event_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                start_time: sessionData.start_time,
                end_time: sessionData.end_time,
                title: `Sesión de Mentoría: ${sessionData.mentor_name} y ${sessionData.mentee_name}`,
                description: sessionData.notes || 'Sesión de mentoría a través de Mentor Match',
                status: sessionData.status
            })
        });

        return await response.json();
    } catch (error) {
        console.error('Error al actualizar evento en Google Calendar:', error);
        throw error;
    }
}

/**
 * Elimina un evento en Google Calendar para una sesión
 * @param {string} eventId - ID del evento en Google Calendar
 * @returns {Promise<boolean>} - Promesa que resuelve a true si se eliminó correctamente
 */
async function deleteCalendarEvent(eventId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/v1/calendar/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error('Error al eliminar evento en Google Calendar:', error);
        return false;
    }
}

/**
 * Inicia el proceso de autorización para integrar Google Calendar
 * @param {number} mentorId - ID del mentor
 */
function startCalendarIntegration(mentorId) {
    const token = localStorage.getItem('token');
    const redirectUri = encodeURIComponent(window.location.origin + '/admin_calendar_callback.html');
    
    window.location.href = `http://localhost:8000/api/v1/calendar/auth?mentor_id=${mentorId}&token=${token}&redirect_uri=${redirectUri}`;
}

// Exportar funciones globalmente
window.hasMentorCalendarIntegration = hasMentorCalendarIntegration;
window.createCalendarEvent = createCalendarEvent;
window.updateCalendarEvent = updateCalendarEvent;
window.deleteCalendarEvent = deleteCalendarEvent;
window.startCalendarIntegration = startCalendarIntegration;