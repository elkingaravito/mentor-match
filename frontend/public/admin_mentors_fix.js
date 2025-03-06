// Función corregida para cargar mentores
async function loadMentors() {
    try {
        // Obtener todos los usuarios
        const response = await fetch('http://localhost:8000/api/v1/users/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const mentorsTable = document.getElementById('mentorsTable');
            
            // Filtrar solo los usuarios con rol de mentor
            const mentors = users.filter(user => user.role === 'mentor');
            
            if (mentors.length === 0) {
                mentorsTable.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center;">No hay mentores registrados</td>
                    </tr>
                `;
                return;
            }
            
            mentorsTable.innerHTML = '';
            
            // Para cada mentor, obtener su perfil detallado
            for (const mentor of mentors) {
                try {
                    const mentorProfileResponse = await fetch(`http://localhost:8000/api/v1/users/${mentor.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (mentorProfileResponse.ok) {
                        const mentorProfile = await mentorProfileResponse.json();
                        
                        // Obtener las habilidades del mentor
                        const skillsResponse = await fetch(`http://localhost:8000/api/v1/skills/mentor/${mentor.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        let skillsText = 'N/A';
                        if (skillsResponse.ok) {
                            const skills = await skillsResponse.json();
                            if (skills && skills.length > 0) {
                                skillsText = skills.map(s => s.skill.name).join(', ');
                            }
                        }
                        
                        mentorsTable.innerHTML += `
                            <tr>
                                <td>${mentor.id}</td>
                                <td>${mentor.name}</td>
                                <td>${mentor.email}</td>
                                <td>${mentorProfile.mentor ? mentorProfile.mentor.position || 'N/A' : 'N/A'}</td>
                                <td>${mentorProfile.mentor ? mentorProfile.mentor.company || 'N/A' : 'N/A'}</td>
                                <td>${mentorProfile.mentor ? mentorProfile.mentor.experience_years || 0 : 0} años</td>
                                <td>${skillsText}</td>
                                <td><span class="status-badge status-active">Activo</span></td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-button" onclick="editMentor(${mentor.id})">
                                            <span class="material-icons">edit</span>
                                        </button>
                                        <button class="action-button" onclick="deleteMentor(${mentor.id})">
                                            <span class="material-icons">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }
                } catch (error) {
                    console.error(`Error al cargar perfil del mentor ${mentor.id}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar mentores:', error);
    }
}

// Función corregida para cargar mentiles
async function loadMentees() {
    try {
        // Obtener todos los usuarios
        const response = await fetch('http://localhost:8000/api/v1/users/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const menteesTable = document.getElementById('menteesTable');
            
            // Filtrar solo los usuarios con rol de mentil
            const mentees = users.filter(user => user.role === 'mentee');
            
            if (mentees.length === 0) {
                menteesTable.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center;">No hay mentiles registrados</td>
                    </tr>
                `;
                return;
            }
            
            menteesTable.innerHTML = '';
            
            // Para cada mentil, obtener su perfil detallado
            for (const mentee of mentees) {
                try {
                    const menteeProfileResponse = await fetch(`http://localhost:8000/api/v1/users/${mentee.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (menteeProfileResponse.ok) {
                        const menteeProfile = await menteeProfileResponse.json();
                        
                        // Obtener los intereses del mentil
                        const interestsResponse = await fetch(`http://localhost:8000/api/v1/skills/mentee/${mentee.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        let interestsText = 'N/A';
                        if (interestsResponse.ok) {
                            const interests = await interestsResponse.json();
                            if (interests && interests.length > 0) {
                                interestsText = interests.map(i => i.skill.name).join(', ');
                            }
                        }
                        
                        menteesTable.innerHTML += `
                            <tr>
                                <td>${mentee.id}</td>
                                <td>${mentee.name}</td>
                                <td>${mentee.email}</td>
                                <td>${menteeProfile.mentee ? menteeProfile.mentee.current_position || 'N/A' : 'N/A'}</td>
                                <td>${menteeProfile.mentee ? menteeProfile.mentee.goals || 'N/A' : 'N/A'}</td>
                                <td>${interestsText}</td>
                                <td><span class="status-badge status-active">Activo</span></td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-button" onclick="editMentee(${mentee.id})">
                                            <span class="material-icons">edit</span>
                                        </button>
                                        <button class="action-button" onclick="deleteMentee(${mentee.id})">
                                            <span class="material-icons">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }
                } catch (error) {
                    console.error(`Error al cargar perfil del mentil ${mentee.id}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar mentiles:', error);
    }
}

// Función corregida para cargar mentores y mentiles en el formulario de sesión
async function loadMentorsAndMentees() {
    try {
        // Obtener todos los usuarios
        const usersResponse = await fetch('http://localhost:8000/api/v1/users/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            
            // Filtrar mentores y mentiles
            const mentors = users.filter(user => user.role === 'mentor');
            const mentees = users.filter(user => user.role === 'mentee');
            
            // Actualizar select de mentores
            const mentorSelect = document.getElementById('sessionMentor');
            mentorSelect.innerHTML = '<option value="">Seleccionar mentor</option>';
            
            for (const mentor of mentors) {
                mentorSelect.innerHTML += `
                    <option value="${mentor.id}">${mentor.name}</option>
                `;
            }
            
            // Actualizar select de mentiles
            const menteeSelect = document.getElementById('sessionMentee');
            menteeSelect.innerHTML = '<option value="">Seleccionar mentil</option>';
            
            for (const mentee of mentees) {
                menteeSelect.innerHTML += `
                    <option value="${mentee.id}">${mentee.name}</option>
                `;
            }
        }
    } catch (error) {
        console.error('Error al cargar mentores y mentiles:', error);
    }
}
