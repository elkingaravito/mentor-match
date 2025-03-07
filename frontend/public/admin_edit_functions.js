/**
 * Funciones para edición y eliminación de usuarios en el panel de administración
 */

// Función para editar un mentor
window.editMentor = async function(id) {
    try {
        // Obtener información del mentor
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            
            // Configurar el modal para edición
            document.getElementById('userModalTitle').textContent = 'Editar Mentor';
            document.getElementById('userId').value = user.id;
            document.getElementById('userNameInput').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPassword').value = ''; // No mostrar la contraseña
            document.getElementById('userRoleSelect').value = user.role;
            
            // Mostrar campos específicos de mentor
            document.getElementById('mentorFields').style.display = 'block';
            document.getElementById('menteeFields').style.display = 'none';
            
            // Llenar campos de mentor si existen
            if (user.mentor) {
                document.getElementById('mentorBio').value = user.mentor.bio || '';
                document.getElementById('mentorExperience').value = user.mentor.experience_years || '';
                document.getElementById('mentorCompany').value = user.mentor.company || '';
                document.getElementById('mentorPosition').value = user.mentor.position || '';
                document.getElementById('mentorLinkedin').value = user.mentor.linkedin_url || '';
            }
            
            // Cargar habilidades del mentor
            try {
                const skillsResponse = await fetch(`http://localhost:8000/api/v1/skills/mentor/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
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
                                <div class="skill-item" style="display: flex; align-items: center; margin-bottom: 10px;" data-skill-id="${skill.skill_id}">
                                    <input type="text" class="form-control" value="${skill.skill.name}" readonly style="margin-right: 10px;">
                                    <select class="form-select skill-level" style="width: 150px; margin-right: 10px;">
                                        <option value="1" ${skill.proficiency_level === 1 ? 'selected' : ''}>Básico</option>
                                        <option value="2" ${skill.proficiency_level === 2 ? 'selected' : ''}>Intermedio</option>
                                        <option value="3" ${skill.proficiency_level === 3 ? 'selected' : ''}>Avanzado</option>
                                        <option value="4" ${skill.proficiency_level === 4 ? 'selected' : ''}>Experto</option>
                                        <option value="5" ${skill.proficiency_level === 5 ? 'selected' : ''}>Maestro</option>
                                    </select>
                                    <button type="button" class="btn btn-secondary remove-skill-btn" onclick="removeSkillItem(this)">Eliminar</button>
                                </div>
                            `;
                        }
                    }
                }
            } catch (error) {
                console.error('Error al cargar habilidades del mentor:', error);
            }
            
            // Abrir el modal
            openModal('userModal');
        }
    } catch (error) {
        console.error('Error al cargar información del mentor:', error);
        alert('Error al cargar información del mentor. Por favor, inténtelo de nuevo.');
    }
};

// Función para eliminar un elemento de habilidad o interés
window.removeSkillItem = function(button) {
    const skillItem = button.closest('.skill-item');
    if (skillItem) {
        // Guardar el ID de la habilidad para eliminación en el servidor al guardar
        const skillId = skillItem.getAttribute('data-skill-id');
        if (skillId) {
            // Añadir a una lista de habilidades a eliminar
            if (!window.skillsToRemove) {
                window.skillsToRemove = [];
            }
            window.skillsToRemove.push(skillId);
        }
        skillItem.remove();
    }
};

window.removeInterestItem = function(button) {
    const interestItem = button.closest('.interest-item');
    if (interestItem) {
        // Guardar el ID del interés para eliminación en el servidor al guardar
        const skillId = interestItem.getAttribute('data-skill-id');
        if (skillId) {
            // Añadir a una lista de intereses a eliminar
            if (!window.interestsToRemove) {
                window.interestsToRemove = [];
            }
            window.interestsToRemove.push(skillId);
        }
        interestItem.remove();
    }
};

// Función para editar un mentil
window.editMentee = async function(id) {
    try {
        // Obtener información del mentil
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            
            // Configurar el modal para edición
            document.getElementById('userModalTitle').textContent = 'Editar Mentil';
            document.getElementById('userId').value = user.id;
            document.getElementById('userNameInput').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPassword').value = ''; // No mostrar la contraseña
            document.getElementById('userRoleSelect').value = user.role;
            
            // Mostrar campos específicos de mentil
            document.getElementById('mentorFields').style.display = 'none';
            document.getElementById('menteeFields').style.display = 'block';
            
            // Llenar campos de mentil si existen
            if (user.mentee) {
                document.getElementById('menteeBio').value = user.mentee.bio || '';
                document.getElementById('menteeGoals').value = user.mentee.goals || '';
                document.getElementById('menteePosition').value = user.mentee.current_position || '';
                document.getElementById('menteeLinkedin').value = user.mentee.linkedin_url || '';
            }
            
            // Cargar intereses del mentil
            try {
                const interestsResponse = await fetch(`http://localhost:8000/api/v1/skills/mentee/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
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
                                <div class="interest-item" style="display: flex; align-items: center; margin-bottom: 10px;" data-skill-id="${interest.skill_id}">
                                    <input type="text" class="form-control" value="${interest.skill.name}" readonly style="margin-right: 10px;">
                                    <select class="form-select interest-level" style="width: 150px; margin-right: 10px;">
                                        <option value="1" ${interest.interest_level === 1 ? 'selected' : ''}>Bajo</option>
                                        <option value="2" ${interest.interest_level === 2 ? 'selected' : ''}>Medio-Bajo</option>
                                        <option value="3" ${interest.interest_level === 3 ? 'selected' : ''}>Medio</option>
                                        <option value="4" ${interest.interest_level === 4 ? 'selected' : ''}>Medio-Alto</option>
                                        <option value="5" ${interest.interest_level === 5 ? 'selected' : ''}>Alto</option>
                                    </select>
                                    <button type="button" class="btn btn-secondary remove-interest-btn" onclick="removeInterestItem(this)">Eliminar</button>
                                </div>
                            `;
                        }
                    }
                }
            } catch (error) {
                console.error('Error al cargar intereses del mentil:', error);
            }
            
            // Abrir el modal
            openModal('userModal');
        }
    } catch (error) {
        console.error('Error al cargar información del mentil:', error);
        alert('Error al cargar información del mentil. Por favor, inténtelo de nuevo.');
    }
};

// Función para añadir una nueva habilidad a un mentor
window.addSkill = function() {
    // Obtener el valor de la habilidad seleccionada o ingresada
    const skillInput = document.getElementById('newSkillInput');
    const skillValue = skillInput.value.trim();
    
    if (!skillValue) {
        alert('Por favor, ingrese una habilidad.');
        return;
    }
    
    // Obtener el contenedor de habilidades
    const skillsContainer = document.getElementById('mentorSkillsContainer');
    
    // Añadir la nueva habilidad al contenedor
    skillsContainer.innerHTML += `
        <div class="skill-item" style="display: flex; align-items: center; margin-bottom: 10px;" data-skill-name="${skillValue}">
            <input type="text" class="form-control" value="${skillValue}" readonly style="margin-right: 10px;">
            <select class="form-select skill-level" style="width: 150px; margin-right: 10px;">
                <option value="1">Básico</option>
                <option value="2">Intermedio</option>
                <option value="3" selected>Avanzado</option>
                <option value="4">Experto</option>
                <option value="5">Maestro</option>
            </select>
            <button type="button" class="btn btn-secondary remove-skill-btn" onclick="removeSkillItem(this)">Eliminar</button>
        </div>
    `;
    
    // Limpiar el campo de entrada
    skillInput.value = '';
};

// Función para añadir un nuevo interés a un mentil
window.addInterest = function() {
    // Obtener el valor del interés seleccionado o ingresado
    const interestInput = document.getElementById('newInterestInput');
    const interestValue = interestInput.value.trim();
    
    if (!interestValue) {
        alert('Por favor, ingrese un interés.');
        return;
    }
    
    // Obtener el contenedor de intereses
    const interestsContainer = document.getElementById('menteeInterestsContainer');
    
    // Añadir el nuevo interés al contenedor
    interestsContainer.innerHTML += `
        <div class="interest-item" style="display: flex; align-items: center; margin-bottom: 10px;" data-skill-name="${interestValue}">
            <input type="text" class="form-control" value="${interestValue}" readonly style="margin-right: 10px;">
            <select class="form-select interest-level" style="width: 150px; margin-right: 10px;">
                <option value="1">Bajo</option>
                <option value="2">Medio-Bajo</option>
                <option value="3" selected>Medio</option>
                <option value="4">Medio-Alto</option>
                <option value="5">Alto</option>
            </select>
            <button type="button" class="btn btn-secondary remove-interest-btn" onclick="removeInterestItem(this)">Eliminar</button>
        </div>
    `;
    
    // Limpiar el campo de entrada
    interestInput.value = '';
};

// Función para eliminar un mentor
window.deleteMentor = async function(id) {
    if (confirm('¿Está seguro de que desea eliminar este mentor?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                loadMentors();
                loadDashboardData();
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
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                loadMentees();
                loadDashboardData();
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

// Función para guardar cambios en el usuario
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar arrays para almacenar habilidades e intereses a eliminar
    window.skillsToRemove = [];
    window.interestsToRemove = [];
    
    // Añadir event listener para los botones de añadir habilidad e interés
    const addSkillBtn = document.getElementById('addSkillBtn');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', addSkill);
    }
    
    const addInterestBtn = document.getElementById('addInterestBtn');
    if (addInterestBtn) {
        addInterestBtn.addEventListener('click', addInterest);
    }
    
    // Event listener para el guardado de usuario
    document.getElementById('saveUserBtn').addEventListener('click', async function() {
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
                    body: JSON.stringify({...userData, password: password})
                });
            }
            
            if (response.ok) {
                const user = await response.json();
                const actualUserId = userId || user.id;
                
                // Si es un mentor, actualizar perfil de mentor
                if (role === 'mentor' && document.getElementById('mentorFields').style.display === 'block') {
                    const mentorData = {
                        bio: document.getElementById('mentorBio').value,
                        experience_years: parseInt(document.getElementById('mentorExperience').value) || 0,
                        company: document.getElementById('mentorCompany').value,
                        position: document.getElementById('mentorPosition').value,
                        linkedin_url: document.getElementById('mentorLinkedin').value
                    };
                    
                    const mentorResponse = await fetch(`http://localhost:8000/api/v1/users/${actualUserId}/mentor`, {
                        method: userId ? 'PUT' : 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(mentorData)
                    });
                    
                    if (!mentorResponse.ok) {
                        console.error('Error al guardar perfil de mentor:', await mentorResponse.json());
                    } else {
                        // Actualizar habilidades del mentor
                        const skillElements = document.querySelectorAll('#mentorSkillsContainer > div.skill-item');
                        
                        // Procesar cada habilidad
                        for (const skillElement of skillElements) {
                            const skillId = skillElement.getAttribute('data-skill-id');
                            const skillName = skillElement.getAttribute('data-skill-name');
                            const proficiencyLevel = parseInt(skillElement.querySelector('.skill-level').value);
                            
                            if (skillId) {
                                // Actualizar habilidad existente
                                await fetch(`http://localhost:8000/api/v1/skills/mentor/${actualUserId}/${skillId}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        proficiency_level: proficiencyLevel
                                    })
                                }).catch(error => {
                                    console.error(`Error al actualizar habilidad ${skillId}:`, error);
                                });
                            } else if (skillName) {
                                // Crear nueva habilidad
                                await fetch(`http://localhost:8000/api/v1/skills/mentor/${actualUserId}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        skill_name: skillName,
                                        proficiency_level: proficiencyLevel
                                    })
                                }).catch(error => {
                                    console.error(`Error al crear habilidad ${skillName}:`, error);
                                });
                            }
                        }
                        
                        // Eliminar habilidades marcadas para eliminación
                        if (window.skillsToRemove && window.skillsToRemove.length > 0) {
                            for (const skillId of window.skillsToRemove) {
                                await fetch(`http://localhost:8000/api/v1/skills/mentor/${actualUserId}/${skillId}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                }).catch(error => {
                                    console.error(`Error al eliminar habilidad ${skillId}:`, error);
                                });
                            }
                            // Limpiar la lista de habilidades a eliminar
                            window.skillsToRemove = [];
                        }
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
                    
                    const menteeResponse = await fetch(`http://localhost:8000/api/v1/users/${actualUserId}/mentee`, {
                        method: userId ? 'PUT' : 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(menteeData)
                    });
                    
                    if (!menteeResponse.ok) {
                        console.error('Error al guardar perfil de mentil:', await menteeResponse.json());
                    } else {
                        // Actualizar intereses del mentil
                        const interestElements = document.querySelectorAll('#menteeInterestsContainer > div.interest-item');
                        
                        // Procesar cada interés
                        for (const interestElement of interestElements) {
                            const skillId = interestElement.getAttribute('data-skill-id');
                            const skillName = interestElement.getAttribute('data-skill-name');
                            const interestLevel = parseInt(interestElement.querySelector('.interest-level').value);
                            
                            if (skillId) {
                                // Actualizar interés existente
                                await fetch(`http://localhost:8000/api/v1/skills/mentee/${actualUserId}/${skillId}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        interest_level: interestLevel
                                    })
                                }).catch(error => {
                                    console.error(`Error al actualizar interés ${skillId}:`, error);
                                });
                            } else if (skillName) {
                                // Crear nuevo interés
                                await fetch(`http://localhost:8000/api/v1/skills/mentee/${actualUserId}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        skill_name: skillName,
                                        interest_level: interestLevel
                                    })
                                }).catch(error => {
                                    console.error(`Error al crear interés ${skillName}:`, error);
                                });
                            }
                        }
                        
                        // Eliminar intereses marcados para eliminación
                        if (window.interestsToRemove && window.interestsToRemove.length > 0) {
                            for (const skillId of window.interestsToRemove) {
                                await fetch(`http://localhost:8000/api/v1/skills/mentee/${actualUserId}/${skillId}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                }).catch(error => {
                                    console.error(`Error al eliminar interés ${skillId}:`, error);
                                });
                            }
                            // Limpiar la lista de intereses a eliminar
                            window.interestsToRemove = [];
                        }
                    }
                }
                
                closeModal('userModal');
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
    });
    
    // Listener para el cambio de rol (mentor/mentil)
    const roleSelect = document.getElementById('userRoleSelect');
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            const role = this.value;
            document.getElementById('mentorFields').style.display = role === 'mentor' ? 'block' : 'none';
            document.getElementById('menteeFields').style.display = role === 'mentee' ? 'block' : 'none';
        });
    }
    
    // Al cerrar modal, limpiar listas de elementos a eliminar
    const closeButtons = document.querySelectorAll('.modal-close, #cancelUserBtn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.skillsToRemove = [];
            window.interestsToRemove = [];
        });
    });
});