// Variables globales para almacenar las habilidades disponibles
let availableSkills = [];
let currentMentorSkills = [];
let currentMenteeInterests = [];

// Función para cargar las habilidades disponibles
async function loadAvailableSkills() {
    try {
        const response = await fetch('http://localhost:8000/api/v1/skills/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            availableSkills = await response.json();
            console.log('Habilidades disponibles cargadas:', availableSkills);
        } else {
            console.error('Error al cargar habilidades:', await response.json());
        }
    } catch (error) {
        console.error('Error al cargar habilidades:', error);
    }
}

// Función para mostrar el modal de selección de habilidad
function showSkillSelectionModal(isMentor = true) {
    // Crear el modal si no existe
    let modal = document.getElementById('skillSelectionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'skillSelectionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2 class="modal-title">Seleccionar Habilidad</h2>
                    <button type="button" class="modal-close" onclick="closeModal('skillSelectionModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="skillSelect" class="form-label">Habilidad</label>
                        <select id="skillSelect" class="form-control">
                            <option value="">Seleccione una habilidad</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="skillLevelSelect" class="form-label">Nivel</label>
                        <select id="skillLevelSelect" class="form-control">
                            <option value="1">Básico</option>
                            <option value="2">Intermedio</option>
                            <option value="3">Avanzado</option>
                            <option value="4">Experto</option>
                            <option value="5">Maestro</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('skillSelectionModal')">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="confirmSkillBtn">Añadir</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Agregar evento al botón de confirmar
        document.getElementById('confirmSkillBtn').addEventListener('click', function() {
            const skillId = document.getElementById('skillSelect').value;
            const skillLevel = document.getElementById('skillLevelSelect').value;
            
            if (!skillId) {
                alert('Por favor, seleccione una habilidad.');
                return;
            }
            
            const selectedSkill = availableSkills.find(s => s.id == skillId);
            if (!selectedSkill) {
                alert('Habilidad no encontrada.');
                return;
            }
            
            // Añadir la habilidad al contenedor correspondiente
            if (isMentor) {
                addSkillToMentor(selectedSkill, skillLevel);
            } else {
                addInterestToMentee(selectedSkill, skillLevel);
            }
            
            closeModal('skillSelectionModal');
        });
    }
    
    // Llenar el selector de habilidades
    const skillSelect = document.getElementById('skillSelect');
    skillSelect.innerHTML = '<option value="">Seleccione una habilidad</option>';
    
    // Filtrar habilidades que ya están asignadas
    let assignedSkillIds = [];
    if (isMentor) {
        assignedSkillIds = Array.from(document.querySelectorAll('#mentorSkillsContainer > div'))
            .map(div => parseInt(div.getAttribute('data-skill-id')));
    } else {
        assignedSkillIds = Array.from(document.querySelectorAll('#menteeInterestsContainer > div'))
            .map(div => parseInt(div.getAttribute('data-skill-id')));
    }
    
    // Añadir solo habilidades no asignadas
    availableSkills.forEach(skill => {
        if (!assignedSkillIds.includes(skill.id)) {
            const option = document.createElement('option');
            option.value = skill.id;
            option.textContent = skill.name;
            skillSelect.appendChild(option);
        }
    });
    
    // Cambiar el título según el tipo
    document.querySelector('#skillSelectionModal .modal-title').textContent = 
        isMentor ? 'Añadir Habilidad' : 'Añadir Interés';
    
    // Cambiar las etiquetas de nivel según el tipo
    const levelSelect = document.getElementById('skillLevelSelect');
    levelSelect.innerHTML = '';
    
    if (isMentor) {
        const levels = [
            { value: 1, text: 'Básico' },
            { value: 2, text: 'Intermedio' },
            { value: 3, text: 'Avanzado' },
            { value: 4, text: 'Experto' },
            { value: 5, text: 'Maestro' }
        ];
        
        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level.value;
            option.textContent = level.text;
            levelSelect.appendChild(option);
        });
    } else {
        const levels = [
            { value: 1, text: 'Bajo' },
            { value: 2, text: 'Medio-Bajo' },
            { value: 3, text: 'Medio' },
            { value: 4, text: 'Medio-Alto' },
            { value: 5, text: 'Alto' }
        ];
        
        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level.value;
            option.textContent = level.text;
            levelSelect.appendChild(option);
        });
    }
    
    // Mostrar el modal
    openModal('skillSelectionModal');
}

// Función para añadir una habilidad al mentor
function addSkillToMentor(skill, level) {
    const skillsContainer = document.getElementById('mentorSkillsContainer');
    
    // Crear elemento de habilidad
    const skillElement = document.createElement('div');
    skillElement.style = 'display: flex; align-items: center; margin-bottom: 10px;';
    skillElement.setAttribute('data-skill-id', skill.id);
    skillElement.setAttribute('data-is-new', 'true');
    
    skillElement.innerHTML = `
        <input type="text" class="form-control" value="${skill.name}" readonly style="margin-right: 10px;">
        <select class="form-select skill-level" style="width: 150px; margin-right: 10px;">
            <option value="1" ${level == 1 ? 'selected' : ''}>Básico</option>
            <option value="2" ${level == 2 ? 'selected' : ''}>Intermedio</option>
            <option value="3" ${level == 3 ? 'selected' : ''}>Avanzado</option>
            <option value="4" ${level == 4 ? 'selected' : ''}>Experto</option>
            <option value="5" ${level == 5 ? 'selected' : ''}>Maestro</option>
        </select>
        <button type="button" class="btn btn-secondary remove-skill-btn">Eliminar</button>
    `;
    
    // Agregar evento al botón de eliminar
    skillElement.querySelector('.remove-skill-btn').addEventListener('click', function() {
        skillElement.remove();
    });
    
    // Añadir al contenedor
    skillsContainer.appendChild(skillElement);
}

// Función para añadir un interés al mentil
function addInterestToMentee(skill, level) {
    const interestsContainer = document.getElementById('menteeInterestsContainer');
    
    // Crear elemento de interés
    const interestElement = document.createElement('div');
    interestElement.style = 'display: flex; align-items: center; margin-bottom: 10px;';
    interestElement.setAttribute('data-skill-id', skill.id);
    interestElement.setAttribute('data-is-new', 'true');
    
    interestElement.innerHTML = `
        <input type="text" class="form-control" value="${skill.name}" readonly style="margin-right: 10px;">
        <select class="form-select interest-level" style="width: 150px; margin-right: 10px;">
            <option value="1" ${level == 1 ? 'selected' : ''}>Bajo</option>
            <option value="2" ${level == 2 ? 'selected' : ''}>Medio-Bajo</option>
            <option value="3" ${level == 3 ? 'selected' : ''}>Medio</option>
            <option value="4" ${level == 4 ? 'selected' : ''}>Medio-Alto</option>
            <option value="5" ${level == 5 ? 'selected' : ''}>Alto</option>
        </select>
        <button type="button" class="btn btn-secondary remove-interest-btn">Eliminar</button>
    `;
    
    // Agregar evento al botón de eliminar
    interestElement.querySelector('.remove-interest-btn').addEventListener('click', function() {
        interestElement.remove();
    });
    
    // Añadir al contenedor
    interestsContainer.appendChild(interestElement);
}

// Función para guardar las habilidades del mentor
async function saveMentorSkills(mentorId) {
    const skillsContainer = document.getElementById('mentorSkillsContainer');
    if (!skillsContainer) {
        console.log('No se encontró el contenedor de habilidades del mentor');
        return;
    }
    
    const skillElements = skillsContainer.querySelectorAll('div[data-skill-id]');
    const currentSkillIds = Array.from(skillElements).map(el => parseInt(el.getAttribute('data-skill-id')));
    
    console.log('Habilidades actuales:', currentMentorSkills);
    console.log('Habilidades en el formulario:', currentSkillIds);
    
    // Eliminar habilidades que ya no están en el formulario
    for (const skill of currentMentorSkills) {
        if (!currentSkillIds.includes(skill.skill_id)) {
            try {
                console.log(`Eliminando habilidad ${skill.skill_id}`);
                const response = await fetch(`http://localhost:8000/api/v1/skills/mentor/${mentorId}/${skill.skill_id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    console.log(`Habilidad ${skill.skill_id} eliminada`);
                } else {
                    console.error(`Error al eliminar habilidad ${skill.skill_id}:`, await response.json());
                }
            } catch (error) {
                console.error(`Error al eliminar habilidad ${skill.skill_id}:`, error);
            }
        }
    }
    
    // Actualizar o añadir habilidades
    for (const skillElement of skillElements) {
        const skillId = parseInt(skillElement.getAttribute('data-skill-id'));
        const levelSelect = skillElement.querySelector('.skill-level');
        
        if (!levelSelect) {
            console.error(`No se encontró el selector de nivel para la habilidad ${skillId}`);
            continue;
        }
        
        const proficiencyLevel = parseInt(levelSelect.value);
        const isNew = skillElement.getAttribute('data-is-new') === 'true';
        
        try {
            if (isNew) {
                // Añadir nueva habilidad
                console.log(`Añadiendo nueva habilidad ${skillId} con nivel ${proficiencyLevel}`);
                const response = await fetch(`http://localhost:8000/api/v1/skills/mentor/${mentorId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        skill_id: skillId,
                        proficiency_level: proficiencyLevel
                    })
                });
                
                if (response.ok) {
                    console.log(`Nueva habilidad ${skillId} añadida`);
                } else {
                    console.error(`Error al añadir habilidad ${skillId}:`, await response.json());
                }
            } else {
                // Actualizar habilidad existente
                console.log(`Actualizando habilidad ${skillId} con nivel ${proficiencyLevel}`);
                const response = await fetch(`http://localhost:8000/api/v1/skills/mentor/${mentorId}/${skillId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        proficiency_level: proficiencyLevel
                    })
                });
                
                if (response.ok) {
                    console.log(`Habilidad ${skillId} actualizada`);
                } else {
                    console.error(`Error al actualizar habilidad ${skillId}:`, await response.json());
                }
            }
        } catch (error) {
            console.error(`Error al guardar habilidad ${skillId}:`, error);
        }
    }
}

// Función para guardar los intereses del mentil
async function saveMenteeInterests(menteeId) {
    const interestsContainer = document.getElementById('menteeInterestsContainer');
    if (!interestsContainer) {
        console.log('No se encontró el contenedor de intereses del mentil');
        return;
    }
    
    const interestElements = interestsContainer.querySelectorAll('div[data-skill-id]');
    const currentInterestIds = Array.from(interestElements).map(el => parseInt(el.getAttribute('data-skill-id')));
    
    console.log('Intereses actuales:', currentMenteeInterests);
    console.log('Intereses en el formulario:', currentInterestIds);
    
    // Eliminar intereses que ya no están en el formulario
    for (const interest of currentMenteeInterests) {
        if (!currentInterestIds.includes(interest.skill_id)) {
            try {
                console.log(`Eliminando interés ${interest.skill_id}`);
                const response = await fetch(`http://localhost:8000/api/v1/skills/mentee/${menteeId}/${interest.skill_id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    console.log(`Interés ${interest.skill_id} eliminado`);
                } else {
                    console.error(`Error al eliminar interés ${interest.skill_id}:`, await response.json());
                }
            } catch (error) {
                console.error(`Error al eliminar interés ${interest.skill_id}:`, error);
            }
        }
    }
    
    // Actualizar o añadir intereses
    for (const interestElement of interestElements) {
        const skillId = parseInt(interestElement.getAttribute('data-skill-id'));
        const levelSelect = interestElement.querySelector('.interest-level');
        
        if (!levelSelect) {
            console.error(`No se encontró el selector de nivel para el interés ${skillId}`);
            continue;
        }
        
        const interestLevel = parseInt(levelSelect.value);
        const isNew = interestElement.getAttribute('data-is-new') === 'true';
        
        try {
            if (isNew) {
                // Añadir nuevo interés
                console.log(`Añadiendo nuevo interés ${skillId} con nivel ${interestLevel}`);
                const response = await fetch(`http://localhost:8000/api/v1/skills/mentee/${menteeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        skill_id: skillId,
                        interest_level: interestLevel
                    })
                });
                
                if (response.ok) {
                    console.log(`Nuevo interés ${skillId} añadido`);
                } else {
                    console.error(`Error al añadir interés ${skillId}:`, await response.json());
                }
            } else {
                // Actualizar interés existente
                console.log(`Actualizando interés ${skillId} con nivel ${interestLevel}`);
                const response = await fetch(`http://localhost:8000/api/v1/skills/mentee/${menteeId}/${skillId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        interest_level: interestLevel
                    })
                });
                
                if (response.ok) {
                    console.log(`Interés ${skillId} actualizado`);
                } else {
                    console.error(`Error al actualizar interés ${skillId}:`, await response.json());
                }
            }
        } catch (error) {
            console.error(`Error al guardar interés ${skillId}:`, error);
        }
    }
}

// Inicializar eventos cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar habilidades disponibles
    loadAvailableSkills();
    
    // Evento para el botón de añadir habilidad
    const addSkillBtn = document.getElementById('addSkillBtn');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', function() {
            showSkillSelectionModal(true);
        });
    }
    
    // Evento para el botón de añadir interés
    const addInterestBtn = document.getElementById('addInterestBtn');
    if (addInterestBtn) {
        addInterestBtn.addEventListener('click', function() {
            showSkillSelectionModal(false);
        });
    }
    
    // Modificar la función editMentor para guardar las habilidades actuales
    const originalEditMentor = window.editMentor;
    if (originalEditMentor) {
        window.editMentor = async function(id) {
            await originalEditMentor(id);
            
            // Guardar las habilidades actuales
            try {
                const skillsResponse = await fetch(`http://localhost:8000/api/v1/skills/mentor/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (skillsResponse.ok) {
                    currentMentorSkills = await skillsResponse.json();
                    console.log('Habilidades actuales del mentor cargadas:', currentMentorSkills);
                    
                    // Marcar las habilidades existentes como no nuevas
                    const skillElements = document.querySelectorAll('#mentorSkillsContainer > div');
                    skillElements.forEach(el => {
                        el.setAttribute('data-is-new', 'false');
                    });
                }
            } catch (error) {
                console.error('Error al cargar habilidades del mentor:', error);
            }
        };
    }
    
    // Modificar la función editMentee para guardar los intereses actuales
    const originalEditMentee = window.editMentee;
    if (originalEditMentee) {
        window.editMentee = async function(id) {
            await originalEditMentee(id);
            
            // Guardar los intereses actuales
            try {
                const interestsResponse = await fetch(`http://localhost:8000/api/v1/skills/mentee/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (interestsResponse.ok) {
                    currentMenteeInterests = await interestsResponse.json();
                    console.log('Intereses actuales del mentil cargados:', currentMenteeInterests);
                    
                    // Marcar los intereses existentes como no nuevos
                    const interestElements = document.querySelectorAll('#menteeInterestsContainer > div');
                    interestElements.forEach(el => {
                        el.setAttribute('data-is-new', 'false');
                    });
                }
            } catch (error) {
                console.error('Error al cargar intereses del mentil:', error);
            }
        };
    }
    
    // Modificar el evento del botón de guardar
    const saveUserBtn = document.getElementById('saveUserBtn');
    if (saveUserBtn) {
        // Eliminar eventos existentes
        const newSaveUserBtn = saveUserBtn.cloneNode(true);
        saveUserBtn.parentNode.replaceChild(newSaveUserBtn, saveUserBtn);
        
        newSaveUserBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            
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
                        
                        if (mentorResponse.ok) {
                            // Guardar habilidades del mentor
                            await saveMentorSkills(actualUserId);
                        } else {
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
                        
                        const menteeResponse = await fetch(`http://localhost:8000/api/v1/users/${actualUserId}/mentee`, {
                            method: userId ? 'PUT' : 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(menteeData)
                        });
                        
                        if (menteeResponse.ok) {
                            // Guardar intereses del mentil
                            await saveMenteeInterests(actualUserId);
                        } else {
                            console.error('Error al guardar perfil de mentil:', await menteeResponse.json());
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
    }
});
