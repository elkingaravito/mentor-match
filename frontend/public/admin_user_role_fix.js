/**
 * Funciones para la gestión de usuarios en el panel de administración
 * Este archivo contiene las funciones necesarias para editar, guardar y eliminar usuarios,
 * así como para manejar la integración con Google Calendar.
 */

// Función para editar usuario con cambio de rol
window.editUserWithRoleChange = async function(id) {
    try {
        // Obtener información del usuario
        const response = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const user = await response.json();

            // Configurar el modal para edición
            document.getElementById('userModalTitle').textContent = `Editar ${user.role === 'mentor' ? 'Mentor' : user.role === 'mentee' ? 'Mentil' : 'Usuario'}`;
            document.getElementById('userId').value = user.id;
            document.getElementById('userNameInput').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPassword').value = '';
            document.getElementById('userRoleSelect').value = user.role;

            // Mostrar campos específicos según el rol
            document.getElementById('mentorFields').style.display = user.role === 'mentor' ? 'block' : 'none';
            document.getElementById('menteeFields').style.display = user.role === 'mentee' ? 'block' : 'none';

            // Llenar campos de mentor si existen
            if (user.role === 'mentor' && user.mentor) {
                document.getElementById('mentorBio').value = user.mentor.bio || '';
                document.getElementById('mentorExperience').value = user.mentor.experience_years || '';
                document.getElementById('mentorCompany').value = user.mentor.company || '';
                document.getElementById('mentorPosition').value = user.mentor.position || '';
                document.getElementById('mentorLinkedin').value = user.mentor.linkedin_url || '';

                // Cargar habilidades del mentor
                try {
                    const skillsResponse = await fetch(`http://localhost:8000/api/v1/skills/mentor/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (skillsResponse.ok) {
                        const skills = await skillsResponse.json();
                        const skillsContainer = document.getElementById('mentorSkillsContainer');

                        // Limpiar contenedor de habilidades
                        skillsContainer.innerHTML = '';

                        // Añadir habilidades existentes
                        if (skills && skills.length > 0) {
                            for (const skill of skills) {
                                skillsContainer.innerHTML += `
                                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                        <input type="text" class="form-control" value="${skill.skill.name}" readonly style="margin-right: 10px;">
                                        <select class="form-select" style="width: 150px; margin-right: 10px;">
                                            <option value="1" ${skill.proficiency_level === 1 ? 'selected' : ''}>Básico</option>
                                            <option value="2" ${skill.proficiency_level === 2 ? 'selected' : ''}>Intermedio</option>
                                            <option value="3" ${skill.proficiency_level === 3 ? 'selected' : ''}>Avanzado</option>
                                            <option value="4" ${skill.proficiency_level === 4 ? 'selected' : ''}>Experto</option>
                                            <option value="5" ${skill.proficiency_level === 5 ? 'selected' : ''}>Maestro</option>
                                        </select>
                                        <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()">Eliminar</button>
                                    </div>
                                `;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar habilidades del mentor:', error);
                }
            }

            // Llenar campos de mentil si existen
            if (user.role === 'mentee' && user.mentee) {
                document.getElementById('menteeBio').value = user.mentee.bio || '';
                document.getElementById('menteeGoals').value = user.mentee.goals || '';
                document.getElementById('menteePosition').value = user.mentee.current_position || '';
                document.getElementById('menteeLinkedin').value = user.mentee.linkedin_url || '';

                // Cargar intereses del mentil
                try {
                    const interestsResponse = await fetch(`http://localhost:8000/api/v1/skills/mentee/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (interestsResponse.ok) {
                        const interests = await interestsResponse.json();
                        const interestsContainer = document.getElementById('menteeInterestsContainer');

                        // Limpiar contenedor de intereses
                        interestsContainer.innerHTML = '';

                        // Añadir intereses existentes
                        if (interests && interests.length > 0) {
                            for (const interest of interests) {
                                interestsContainer.innerHTML += `
                                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                        <input type="text" class="form-control" value="${interest.skill.name}" readonly style="margin-right: 10px;">
                                        <select class="form-select" style="width: 150px; margin-right: 10px;">
                                            <option value="1" ${interest.interest_level === 1 ? 'selected' : ''}>Bajo</option>
                                            <option value="2" ${interest.interest_level === 2 ? 'selected' : ''}>Medio-Bajo</option>
                                            <option value="3" ${interest.interest_level === 3 ? 'selected' : ''}>Medio</option>
                                            <option value="4" ${interest.interest_level === 4 ? 'selected' : ''}>Medio-Alto</option>
                                            <option value="5" ${interest.interest_level === 5 ? 'selected' : ''}>Alto</option>
                                        </select>
                                        <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()">Eliminar</button>
                                    </div>
                                `;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar intereses del mentil:', error);
                }
            }

            // Abrir el modal
            openModal('userModal');
        }
    } catch (error) {
        console.error('Error al cargar información del usuario:', error);
        alert('Error al cargar información del usuario. Por favor, inténtelo de nuevo.');
    }
};

// Función para guardar usuario con cambio de rol
window.saveUserWithRoleChange = async function() {
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userNameInput').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRoleSelect').value;

    if (!name || !email || (!userId && !password) || !role) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    // Crear objeto de datos del usuario
    const userData = {
        name: name,
        email: email,
        role: role
    };

    // Añadir contraseña solo si se proporciona
    if (password) {
        userData.password = password;
    }

    try {
        let response;
        const token = localStorage.getItem('token');

        if (userId) {
            // Actualizar usuario existente
            response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Crear nuevo usuario
            response = await fetch('http://localhost:8000/api/v1/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...userData, password: password })
            });
        }

        if (response.ok) {
            const user = await response.json();

            // Si es un mentor, actualizar perfil de mentor
            if (role === 'mentor' && document.getElementById('mentorFields').style.display === 'block') {
                const mentorData = {
                    bio: document.getElementById('mentorBio').value,
                    experience_years: parseInt(document.getElementById('mentorExperience').value) || 0,
                    company: document.getElementById('mentorCompany').value,
                    position: document.getElementById('mentorPosition').value,
                    linkedin_url: document.getElementById('mentorLinkedin').value
                };

                const mentorResponse = await fetch(`http://localhost:8000/api/v1/users/${user.id}/mentor`, {
                    method: userId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(mentorData)
                });

                if (!mentorResponse.ok) {
                    console.error('Error al guardar perfil de mentor:', await mentorResponse.json());
                }
            }

            // Si es un mentil, actualizar perfil de mentil
            if (role === 'mentee' && document.getElementById('menteeFields').style.display === 'block') {
                const menteeData = {
                    bio: document.getElementById('menteeBio').value,
                    goals: document.getElementById('menteeGoals').value,
                    current_position: document.getElementById('menteePosition').value,
                    linkedin_url: document.getElementById('menteeLinkedin').value
                };

                const menteeResponse = await fetch(`http://localhost:8000/api/v1/users/${user.id}/mentee`, {
                    method: userId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(menteeData)
                });

                if (!menteeResponse.ok) {
                    console.error('Error al guardar perfil de mentil:', await menteeResponse.json());
                }
            }

            closeModal('userModal');
            
            // Recargar los datos
            if (typeof loadMentors === 'function') loadMentors();
            if (typeof loadMentees === 'function') loadMentees();
            if (typeof loadDashboardData === 'function') loadDashboardData();
            
            alert(userId ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'No se pudo guardar el usuario.'}`);
        }
    } catch (error) {
        console.error('Error al guardar el usuario:', error);
        alert('Error al guardar el usuario. Por favor, inténtelo de nuevo.');
    }
};

// Función para verificar la integración con Google Calendar del mentor seleccionado
window.checkMentorCalendarIntegration = async function() {
    const mentorId = document.getElementById('sessionMentor').value;
    if (!mentorId) return;

    try {
        const response = await fetch(`http://localhost:8000/api/v1/users/${mentorId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (!data.mentor || !data.mentor.calendar_integration) {
                const warningElement = document.createElement('div');
                warningElement.id = 'calendarIntegrationWarning';
                warningElement.className = 'form-group';
                warningElement.innerHTML = `
                    <div style="display: flex; align-items: center; padding: 10px; background-color: #fff3cd; border-radius: 4px; margin-top: 5px;">
                        <span class="material-icons" style="margin-right: 5px; color: #856404;">warning</span>
                        <span style="color: #856404;">El mentor seleccionado no tiene integración con Google Calendar. Las invitaciones no se enviarán automáticamente.</span>
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
};

// Función para configurar la integración con Google Calendar
window.setupCalendarIntegration = function(mentorId) {
    // Redirigir a la página de configuración de Google Calendar
    window.location.href = `admin_calendar_setup.html?mentorId=${mentorId}`;
};

// Función para eliminar un mentor
window.deleteMentor = async function(id) {
    if (confirm('¿Está seguro de que desea eliminar este mentor?')) {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                if (typeof loadMentors === 'function') loadMentors();
                if (typeof loadDashboardData === 'function') loadDashboardData();
                alert('Mentor eliminado correctamente.');
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail || 'No se pudo eliminar el mentor.'}`);
            }
        } catch (error) {
            console.error('Error al eliminar el mentor:', error);
            alert('Error al eliminar el mentor. Por favor, inténtelo de nuevo.');
        }
    }
};

// Función para eliminar un mentil
window.deleteMentee = async function(id) {
    if (confirm('¿Está seguro de que desea eliminar este mentil?')) {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                if (typeof loadMentees === 'function') loadMentees();
                if (typeof loadDashboardData === 'function') loadDashboardData();
                alert('Mentil eliminado correctamente.');
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail || 'No se pudo eliminar el mentil.'}`);
            }
        } catch (error) {
            console.error('Error al eliminar el mentil:', error);
            alert('Error al eliminar el mentil. Por favor, inténtelo de nuevo.');
        }
    }
};

// Función para eliminar un usuario general
window.deleteUser = async function(id) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                if (typeof loadMentors === 'function') loadMentors();
                if (typeof loadMentees === 'function') loadMentees();
                if (typeof loadDashboardData === 'function') loadDashboardData();
                alert('Usuario eliminado correctamente.');
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail || 'No se pudo eliminar el usuario.'}`);
            }
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            alert('Error al eliminar el usuario. Por favor, inténtelo de nuevo.');
        }
    }
};
window.editMentor = function(id) {
    editUserWithRoleChange(id);
};