// Función para manejar correctamente el cambio de rol de usuario
async function handleUserRoleChange(userId, newRole, userData) {
    try {
        // 1. Primero actualizar el rol del usuario
        const userUpdateResponse = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        });

        if (!userUpdateResponse.ok) {
            const error = await userUpdateResponse.json();
            throw new Error(`Error al actualizar el rol del usuario: ${error.detail || 'Error desconocido'}`);
        }

        const updatedUser = await userUpdateResponse.json();

        // 2. Luego crear el perfil correspondiente según el nuevo rol
        if (newRole === 'mentor') {
            const mentorData = {
                bio: userData.bio || '',
                experience_years: userData.experience_years || 0,
                company: userData.company || '',
                position: userData.position || '',
                linkedin_url: userData.linkedin_url || ''
            };

            // Intentar crear un nuevo perfil de mentor
            const mentorResponse = await fetch(`http://localhost:8000/api/v1/users/${userId}/mentor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(mentorData)
            });

            if (!mentorResponse.ok) {
                const error = await mentorResponse.json();
                console.warn(`No se pudo crear el perfil de mentor: ${error.detail}`);
                
                // Si el perfil ya existe, intentar actualizarlo
                if (error.detail === "Mentor profile already exists") {
                    const updateResponse = await fetch(`http://localhost:8000/api/v1/users/${userId}/mentor`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(mentorData)
                    });
                    
                    if (!updateResponse.ok) {
                        const updateError = await updateResponse.json();
                        throw new Error(`Error al actualizar el perfil de mentor: ${updateError.detail || 'Error desconocido'}`);
                    }
                }
            }
        } else if (newRole === 'mentee') {
            const menteeData = {
                bio: userData.bio || '',
                goals: userData.goals || '',
                current_position: userData.current_position || '',
                linkedin_url: userData.linkedin_url || ''
            };

            // Intentar crear un nuevo perfil de mentil
            const menteeResponse = await fetch(`http://localhost:8000/api/v1/users/${userId}/mentee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(menteeData)
            });

            if (!menteeResponse.ok) {
                const error = await menteeResponse.json();
                console.warn(`No se pudo crear el perfil de mentil: ${error.detail}`);
                
                // Si el perfil ya existe, intentar actualizarlo
                if (error.detail === "Mentee profile already exists") {
                    const updateResponse = await fetch(`http://localhost:8000/api/v1/users/${userId}/mentee`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(menteeData)
                    });
                    
                    if (!updateResponse.ok) {
                        const updateError = await updateResponse.json();
                        throw new Error(`Error al actualizar el perfil de mentil: ${updateError.detail || 'Error desconocido'}`);
                    }
                }
            }
        }

        return updatedUser;
    } catch (error) {
        console.error('Error al cambiar el rol del usuario:', error);
        throw error;
    }
}

// Función para editar usuario con manejo de cambio de rol
window.editUserWithRoleChange = async function(userId) {
    try {
        // Obtener datos del usuario
        const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            
            // Configurar el modal para editar usuario
            document.getElementById('userModalTitle').textContent = 'Editar Usuario';
            document.getElementById('userId').value = user.id;
            document.getElementById('userNameInput').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPassword').value = ''; // No mostrar contraseña
            document.getElementById('userRoleSelect').value = user.role;
            
            // Mostrar campos según el rol
            document.getElementById('mentorFields').style.display = user.role === 'mentor' ? 'block' : 'none';
            document.getElementById('menteeFields').style.display = user.role === 'mentee' ? 'block' : 'none';
            
            // Llenar campos de mentor si existe
            if (user.mentor) {
                document.getElementById('mentorBio').value = user.mentor.bio || '';
                document.getElementById('mentorExperience').value = user.mentor.experience_years || '';
                document.getElementById('mentorCompany').value = user.mentor.company || '';
                document.getElementById('mentorPosition').value = user.mentor.position || '';
                document.getElementById('mentorLinkedin').value = user.mentor.linkedin_url || '';
            }
            
            // Llenar campos de mentil si existe
            if (user.mentee) {
                document.getElementById('menteeBio').value = user.mentee.bio || '';
                document.getElementById('menteeGoals').value = user.mentee.goals || '';
                document.getElementById('menteePosition').value = user.mentee.current_position || '';
                document.getElementById('menteeLinkedin').value = user.mentee.linkedin_url || '';
            }
            
            openModal('userModal');
        } else {
            alert('Error al cargar datos del usuario');
        }
    } catch (error) {
        console.error('Error al editar usuario:', error);
        alert('Error al editar usuario');
    }
};

// Función para guardar usuario con manejo de cambio de rol
window.saveUserWithRoleChange = async function() {
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userNameInput').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRoleSelect').value;
    
    if (!name || !email || (!userId && !password) || !role) {
        alert('Por favor, complete todos los campos obligatorios');
        return;
    }
    
    try {
        // Datos básicos del usuario
        const userData = {
            name: name,
            email: email
        };
        
        if (password) {
            userData.password = password;
        }
        
        let user;
        
        if (userId) {
            // Si estamos editando un usuario existente
            const currentUserResponse = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (currentUserResponse.ok) {
                const currentUser = await currentUserResponse.json();
                
                // Si el rol ha cambiado, manejar el cambio de rol
                if (currentUser.role !== role) {
                    // Recopilar datos de perfil según el nuevo rol
                    let profileData = {};
                    
                    if (role === 'mentor') {
                        profileData = {
                            bio: document.getElementById('mentorBio').value,
                            experience_years: parseInt(document.getElementById('mentorExperience').value) || 0,
                            company: document.getElementById('mentorCompany').value,
                            position: document.getElementById('mentorPosition').value,
                            linkedin_url: document.getElementById('mentorLinkedin').value
                        };
                    } else if (role === 'mentee') {
                        profileData = {
                            bio: document.getElementById('menteeBio').value,
                            goals: document.getElementById('menteeGoals').value,
                            current_position: document.getElementById('menteePosition').value,
                            linkedin_url: document.getElementById('menteeLinkedin').value
                        };
                    }
                    
                    // Manejar el cambio de rol
                    user = await handleUserRoleChange(userId, role, profileData);
                } else {
                    // Si el rol no ha cambiado, actualizar datos básicos
                    const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(userData)
                    });
                    
                    if (response.ok) {
                        user = await response.json();
                        
                        // Actualizar perfil según el rol
                        if (role === 'mentor') {
                            const mentorData = {
                                bio: document.getElementById('mentorBio').value,
                                experience_years: parseInt(document.getElementById('mentorExperience').value) || 0,
                                company: document.getElementById('mentorCompany').value,
                                position: document.getElementById('mentorPosition').value,
                                linkedin_url: document.getElementById('mentorLinkedin').value
                            };
                            
                            const mentorResponse = await fetch(`http://localhost:8000/api/v1/users/${userId}/mentor`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(mentorData)
                            });
                            
                            if (!mentorResponse.ok) {
                                console.error('Error al actualizar perfil de mentor:', await mentorResponse.json());
                            }
                        } else if (role === 'mentee') {
                            const menteeData = {
                                bio: document.getElementById('menteeBio').value,
                                goals: document.getElementById('menteeGoals').value,
                                current_position: document.getElementById('menteePosition').value,
                                linkedin_url: document.getElementById('menteeLinkedin').value
                            };
                            
                            const menteeResponse = await fetch(`http://localhost:8000/api/v1/users/${userId}/mentee`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(menteeData)
                            });
                            
                            if (!menteeResponse.ok) {
                                console.error('Error al actualizar perfil de mentil:', await menteeResponse.json());
                            }
                        }
                    } else {
                        throw new Error('Error al actualizar usuario');
                    }
                }
            } else {
                throw new Error('Error al obtener información del usuario actual');
            }
        } else {
            // Si estamos creando un nuevo usuario
            userData.role = role;
            
            const response = await fetch('http://localhost:8000/api/v1/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...userData, password: password })
            });
            
            if (response.ok) {
                user = await response.json();
                
                // Crear perfil según el rol
                if (role === 'mentor') {
                    const mentorData = {
                        bio: document.getElementById('mentorBio').value,
                        experience_years: parseInt(document.getElementById('mentorExperience').value) || 0,
                        company: document.getElementById('mentorCompany').value,
                        position: document.getElementById('mentorPosition').value,
                        linkedin_url: document.getElementById('mentorLinkedin').value
                    };
                    
                    const mentorResponse = await fetch(`http://localhost:8000/api/v1/users/${user.id}/mentor`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(mentorData)
                    });
                    
                    if (!mentorResponse.ok) {
                        console.error('Error al crear perfil de mentor:', await mentorResponse.json());
                    }
                } else if (role === 'mentee') {
                    const menteeData = {
                        bio: document.getElementById('menteeBio').value,
                        goals: document.getElementById('menteeGoals').value,
                        current_position: document.getElementById('menteePosition').value,
                        linkedin_url: document.getElementById('menteeLinkedin').value
                    };
                    
                    const menteeResponse = await fetch(`http://localhost:8000/api/v1/users/${user.id}/mentee`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(menteeData)
                    });
                    
                    if (!menteeResponse.ok) {
                        console.error('Error al crear perfil de mentil:', await menteeResponse.json());
                    }
                }
            } else {
                throw new Error('Error al crear usuario');
            }
        }
        
        closeModal('userModal');
        alert('Usuario guardado correctamente');
        
        // Recargar datos
        if (document.querySelector('.tab.active').getAttribute('data-tab') === 'mentors') {
            loadMentors();
        } else if (document.querySelector('.tab.active').getAttribute('data-tab') === 'mentees') {
            loadMentees();
        } else {
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        alert(`Error al guardar usuario: ${error.message}`);
    }
};
