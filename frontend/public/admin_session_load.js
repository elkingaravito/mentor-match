// Función para cargar sesiones
async function loadSessions() {
    try {
        const response = await fetch('http://localhost:8000/api/v1/sessions/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const sessions = await response.json();
            const sessionsTable = document.getElementById('sessionsTable');
            
            if (sessions.length === 0) {
                sessionsTable.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center;">No hay sesiones registradas</td>
                    </tr>
                `;
                return;
            }
            
            sessionsTable.innerHTML = '';
            
            for (const session of sessions) {
                const startDate = new Date(session.start_time);
                const endDate = new Date(session.end_time);
                const formattedDate = startDate.toLocaleDateString('es-ES');
                const formattedTime = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const durationMinutes = Math.round((endDate - startDate) / (1000 * 60));
                
                let statusClass = '';
                let statusText = '';
                
                switch (session.status) {
                    case 'scheduled':
                        statusClass = 'status-active';
                        statusText = 'Programada';
                        break;
                    case 'completed':
                        statusClass = 'status-active';
                        statusText = 'Completada';
                        break;
                    case 'cancelled':
                        statusClass = 'status-inactive';
                        statusText = 'Cancelada';
                        break;
                    case 'no-show':
                        statusClass = 'status-inactive';
                        statusText = 'No asistió';
                        break;
                }
                
                sessionsTable.innerHTML += `
                    <tr>
                        <td>${session.id}</td>
                        <td>Mentor #${session.mentor_id}</td>
                        <td>Mentil #${session.mentee_id}</td>
                        <td>${formattedDate}</td>
                        <td>${formattedTime}</td>
                        <td>${durationMinutes} min</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-button" onclick="editSession(${session.id})">
                                    <span class="material-icons">edit</span>
                                </button>
                                <button class="action-button" onclick="deleteSession(${session.id})">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    } catch (error) {
        console.error('Error al cargar sesiones:', error);
    }
}
