import os
import sys
import random
from datetime import datetime, timedelta
import json

# Agregar el directorio actual al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.base import Base
from app.models import User, Mentor, Mentee, Skill, MentorSkill, MenteeInterest, Availability, Session as SessionModel
from app.core.security import get_password_hash

# Crear las tablas
Base.metadata.create_all(bind=engine)

# Crear una sesión de base de datos
db = SessionLocal()

# Datos de prueba
mentors_data = [
    {
        "email": "mentor1@example.com",
        "name": "Carlos Rodríguez",
        "password": "password123",
        "bio": "Desarrollador senior con 8 años de experiencia en desarrollo web y móvil. Especializado en arquitectura de software y desarrollo backend.",
        "experience_years": 8,
        "company": "TechCorp",
        "position": "Senior Developer",
        "linkedin_url": "https://linkedin.com/in/carlosrodriguez"
    },
    {
        "email": "mentor2@example.com",
        "name": "Laura Sánchez",
        "password": "password123",
        "bio": "Product Manager con experiencia en startups y empresas de tecnología. Especializada en metodologías ágiles y desarrollo de producto.",
        "experience_years": 6,
        "company": "InnovateTech",
        "position": "Product Manager",
        "linkedin_url": "https://linkedin.com/in/laurasanchez"
    },
    {
        "email": "mentor3@example.com",
        "name": "Roberto Fernández",
        "password": "password123",
        "bio": "Diseñador UX/UI con experiencia en investigación de usuarios y prototipado. Especializado en diseño centrado en el usuario.",
        "experience_years": 5,
        "company": "DesignHub",
        "position": "UX Designer",
        "linkedin_url": "https://linkedin.com/in/robertofernandez"
    },
    {
        "email": "mentor4@example.com",
        "name": "María González",
        "password": "password123",
        "bio": "CTO con experiencia en liderazgo técnico y gestión de equipos. Especializada en arquitectura de sistemas y escalabilidad.",
        "experience_years": 12,
        "company": "TechSolutions",
        "position": "CTO",
        "linkedin_url": "https://linkedin.com/in/mariagonzalez"
    },
    {
        "email": "mentor5@example.com",
        "name": "Javier López",
        "password": "password123",
        "bio": "Desarrollador full-stack con experiencia en React, Node.js y Python. Especializado en desarrollo web y aplicaciones móviles.",
        "experience_years": 7,
        "company": "CodeMasters",
        "position": "Senior Developer",
        "linkedin_url": "https://linkedin.com/in/javierlopez"
    },
    {
        "email": "mentor6@example.com",
        "name": "Ana Martínez",
        "password": "password123",
        "bio": "Product Manager con experiencia en empresas de tecnología. Especializada en desarrollo de producto y estrategia de negocio.",
        "experience_years": 9,
        "company": "ProductLab",
        "position": "Product Manager",
        "linkedin_url": "https://linkedin.com/in/anamartinez"
    },
    {
        "email": "mentor7@example.com",
        "name": "David García",
        "password": "password123",
        "bio": "Data Scientist con experiencia en machine learning y análisis de datos. Especializado en modelos predictivos y visualización de datos.",
        "experience_years": 6,
        "company": "DataMinds",
        "position": "Data Scientist",
        "linkedin_url": "https://linkedin.com/in/davidgarcia"
    },
    {
        "email": "mentor8@example.com",
        "name": "Elena Torres",
        "password": "password123",
        "bio": "DevOps Engineer con experiencia en automatización y CI/CD. Especializada en infraestructura como código y contenedores.",
        "experience_years": 5,
        "company": "CloudOps",
        "position": "DevOps Engineer",
        "linkedin_url": "https://linkedin.com/in/elenatorres"
    },
    {
        "email": "mentor9@example.com",
        "name": "Miguel Ruiz",
        "password": "password123",
        "bio": "Frontend Developer con experiencia en React, Angular y Vue. Especializado en interfaces de usuario y experiencia de usuario.",
        "experience_years": 7,
        "company": "UIExperts",
        "position": "Frontend Lead",
        "linkedin_url": "https://linkedin.com/in/miguelruiz"
    },
    {
        "email": "mentor10@example.com",
        "name": "Sofía Navarro",
        "password": "password123",
        "bio": "Backend Developer con experiencia en Python, Java y Go. Especializada en APIs y microservicios.",
        "experience_years": 8,
        "company": "BackendPro",
        "position": "Backend Lead",
        "linkedin_url": "https://linkedin.com/in/sofianavarro"
    }
]

mentees_data = [
    {
        "email": "mentee1@example.com",
        "name": "Pedro Sánchez",
        "password": "password123",
        "bio": "Estudiante de ingeniería informática interesado en desarrollo web y móvil.",
        "goals": "Aprender desarrollo web y conseguir mi primer trabajo como desarrollador.",
        "current_position": "Estudiante",
        "linkedin_url": "https://linkedin.com/in/pedrosanchez"
    },
    {
        "email": "mentee2@example.com",
        "name": "Lucía Martín",
        "password": "password123",
        "bio": "Desarrolladora junior con 1 año de experiencia en frontend.",
        "goals": "Mejorar mis habilidades en React y aprender desarrollo backend.",
        "current_position": "Frontend Developer",
        "linkedin_url": "https://linkedin.com/in/luciamartin"
    },
    {
        "email": "mentee3@example.com",
        "name": "Alejandro Díaz",
        "password": "password123",
        "bio": "Estudiante de último año de ingeniería de software interesado en inteligencia artificial.",
        "goals": "Aprender machine learning y conseguir un trabajo en data science.",
        "current_position": "Estudiante",
        "linkedin_url": "https://linkedin.com/in/alejandrodiaz"
    },
    {
        "email": "mentee4@example.com",
        "name": "Carmen López",
        "password": "password123",
        "bio": "Diseñadora gráfica interesada en UX/UI.",
        "goals": "Hacer la transición de diseño gráfico a diseño UX/UI.",
        "current_position": "Diseñadora Gráfica",
        "linkedin_url": "https://linkedin.com/in/carmenlopez"
    },
    {
        "email": "mentee5@example.com",
        "name": "Daniel Moreno",
        "password": "password123",
        "bio": "Desarrollador backend junior con experiencia en Python.",
        "goals": "Aprender arquitectura de software y patrones de diseño.",
        "current_position": "Backend Developer",
        "linkedin_url": "https://linkedin.com/in/danielmoreno"
    },
    {
        "email": "mentee6@example.com",
        "name": "Isabel Gómez",
        "password": "password123",
        "bio": "Estudiante de bootcamp de programación interesada en desarrollo web.",
        "goals": "Conseguir mi primer trabajo como desarrolladora web.",
        "current_position": "Estudiante de Bootcamp",
        "linkedin_url": "https://linkedin.com/in/isabelgomez"
    },
    {
        "email": "mentee7@example.com",
        "name": "Fernando Ruiz",
        "password": "password123",
        "bio": "Profesional en transición de carrera de marketing a desarrollo.",
        "goals": "Aprender desarrollo web y hacer la transición a una carrera técnica.",
        "current_position": "Marketing Specialist",
        "linkedin_url": "https://linkedin.com/in/fernandoruiz"
    },
    {
        "email": "mentee8@example.com",
        "name": "Marta Jiménez",
        "password": "password123",
        "bio": "Estudiante de ciencia de datos interesada en machine learning.",
        "goals": "Profundizar en algoritmos de machine learning y conseguir un trabajo en el área.",
        "current_position": "Estudiante",
        "linkedin_url": "https://linkedin.com/in/martajimenez"
    },
    {
        "email": "mentee9@example.com",
        "name": "Pablo Torres",
        "password": "password123",
        "bio": "Desarrollador frontend junior con experiencia en HTML, CSS y JavaScript.",
        "goals": "Aprender frameworks modernos como React y mejorar mis habilidades de JavaScript.",
        "current_position": "Frontend Developer",
        "linkedin_url": "https://linkedin.com/in/pablotorres"
    },
    {
        "email": "mentee10@example.com",
        "name": "Laura García",
        "password": "password123",
        "bio": "Estudiante de último año de ingeniería informática interesada en desarrollo de software.",
        "goals": "Aprender buenas prácticas de desarrollo y conseguir un trabajo como desarrolladora.",
        "current_position": "Estudiante",
        "linkedin_url": "https://linkedin.com/in/lauragarcia"
    }
]

skills_data = [
    {"name": "JavaScript", "category": "Programming"},
    {"name": "Python", "category": "Programming"},
    {"name": "Java", "category": "Programming"},
    {"name": "React", "category": "Frontend"},
    {"name": "Angular", "category": "Frontend"},
    {"name": "Vue.js", "category": "Frontend"},
    {"name": "Node.js", "category": "Backend"},
    {"name": "Django", "category": "Backend"},
    {"name": "Flask", "category": "Backend"},
    {"name": "SQL", "category": "Database"},
    {"name": "MongoDB", "category": "Database"},
    {"name": "AWS", "category": "Cloud"},
    {"name": "Docker", "category": "DevOps"},
    {"name": "Kubernetes", "category": "DevOps"},
    {"name": "Git", "category": "Tools"},
    {"name": "Machine Learning", "category": "Data Science"},
    {"name": "Data Analysis", "category": "Data Science"},
    {"name": "UX Design", "category": "Design"},
    {"name": "UI Design", "category": "Design"},
    {"name": "Product Management", "category": "Business"},
    {"name": "Agile Methodologies", "category": "Business"},
    {"name": "Leadership", "category": "Soft Skills"},
    {"name": "Communication", "category": "Soft Skills"},
    {"name": "Problem Solving", "category": "Soft Skills"}
]

# Función para crear usuarios y perfiles
def create_users_and_profiles():
    print("Creando usuarios y perfiles...")
    
    # Crear mentores
    for mentor_data in mentors_data:
        # Verificar si el usuario ya existe
        existing_user = db.query(User).filter(User.email == mentor_data["email"]).first()
        if existing_user:
            print(f"El usuario {mentor_data['email']} ya existe. Saltando...")
            continue
        
        # Crear usuario
        user = User(
            email=mentor_data["email"],
            name=mentor_data["name"],
            password_hash=get_password_hash(mentor_data["password"]),
            role="mentor"
        )
        db.add(user)
        db.flush()  # Para obtener el ID del usuario
        
        # Crear perfil de mentor
        mentor = Mentor(
            user_id=user.id,
            bio=mentor_data["bio"],
            experience_years=mentor_data["experience_years"],
            company=mentor_data["company"],
            position=mentor_data["position"],
            linkedin_url=mentor_data["linkedin_url"]
        )
        db.add(mentor)
    
    # Crear mentiles
    for mentee_data in mentees_data:
        # Verificar si el usuario ya existe
        existing_user = db.query(User).filter(User.email == mentee_data["email"]).first()
        if existing_user:
            print(f"El usuario {mentee_data['email']} ya existe. Saltando...")
            continue
        
        # Crear usuario
        user = User(
            email=mentee_data["email"],
            name=mentee_data["name"],
            password_hash=get_password_hash(mentee_data["password"]),
            role="mentee"
        )
        db.add(user)
        db.flush()  # Para obtener el ID del usuario
        
        # Crear perfil de mentil
        mentee = Mentee(
            user_id=user.id,
            bio=mentee_data["bio"],
            goals=mentee_data["goals"],
            current_position=mentee_data["current_position"],
            linkedin_url=mentee_data["linkedin_url"]
        )
        db.add(mentee)
    
    db.commit()
    print("Usuarios y perfiles creados con éxito.")

# Función para crear habilidades
def create_skills():
    print("Creando habilidades...")
    
    for skill_data in skills_data:
        # Verificar si la habilidad ya existe
        existing_skill = db.query(Skill).filter(Skill.name == skill_data["name"]).first()
        if existing_skill:
            print(f"La habilidad {skill_data['name']} ya existe. Saltando...")
            continue
        
        # Crear habilidad
        skill = Skill(
            name=skill_data["name"],
            category=skill_data["category"]
        )
        db.add(skill)
    
    db.commit()
    print("Habilidades creadas con éxito.")

# Función para asignar habilidades a mentores
def assign_skills_to_mentors():
    print("Asignando habilidades a mentores...")
    
    mentors = db.query(Mentor).all()
    skills = db.query(Skill).all()
    
    for mentor in mentors:
        # Seleccionar entre 3 y 6 habilidades aleatorias para cada mentor
        num_skills = random.randint(3, 6)
        selected_skills = random.sample(skills, num_skills)
        
        for skill in selected_skills:
            # Verificar si ya tiene esta habilidad
            existing_skill = db.query(MentorSkill).filter(
                MentorSkill.mentor_id == mentor.user_id,
                MentorSkill.skill_id == skill.id
            ).first()
            
            if existing_skill:
                continue
            
            # Asignar habilidad con nivel de competencia aleatorio (1-5)
            mentor_skill = MentorSkill(
                mentor_id=mentor.user_id,
                skill_id=skill.id,
                proficiency_level=random.randint(3, 5)  # Nivel de competencia entre 3 y 5 para mentores
            )
            db.add(mentor_skill)
    
    db.commit()
    print("Habilidades asignadas a mentores con éxito.")

# Función para asignar intereses a mentiles
def assign_interests_to_mentees():
    print("Asignando intereses a mentiles...")
    
    mentees = db.query(Mentee).all()
    skills = db.query(Skill).all()
    
    for mentee in mentees:
        # Seleccionar entre 3 y 6 habilidades aleatorias para cada mentil
        num_skills = random.randint(3, 6)
        selected_skills = random.sample(skills, num_skills)
        
        for skill in selected_skills:
            # Verificar si ya tiene este interés
            existing_interest = db.query(MenteeInterest).filter(
                MenteeInterest.mentee_id == mentee.user_id,
                MenteeInterest.skill_id == skill.id
            ).first()
            
            if existing_interest:
                continue
            
            # Asignar interés con nivel de interés aleatorio (1-5)
            mentee_interest = MenteeInterest(
                mentee_id=mentee.user_id,
                skill_id=skill.id,
                interest_level=random.randint(3, 5)  # Nivel de interés entre 3 y 5 para mentiles
            )
            db.add(mentee_interest)
    
    db.commit()
    print("Intereses asignados a mentiles con éxito.")

# Función para crear disponibilidad
def create_availability():
    print("Creando disponibilidad...")
    
    users = db.query(User).all()
    
    for user in users:
        # Crear entre 2 y 4 slots de disponibilidad para cada usuario
        num_slots = random.randint(2, 4)
        days = random.sample(range(1, 6), num_slots)  # Días de la semana (1-5, lunes a viernes)
        
        for day in days:
            # Horas de inicio aleatorias (9-17)
            start_hour = random.randint(9, 17)
            # Duración aleatoria (1-2 horas)
            duration = random.randint(1, 2)
            end_hour = start_hour + duration
            
            # Formatear horas
            start_time = f"{start_hour:02d}:00"
            end_time = f"{end_hour:02d}:00"
            
            # Verificar si ya existe esta disponibilidad
            existing_availability = db.query(Availability).filter(
                Availability.user_id == user.id,
                Availability.day_of_week == day,
                Availability.start_time == start_time
            ).first()
            
            if existing_availability:
                continue
            
            # Crear disponibilidad
            availability = Availability(
                user_id=user.id,
                day_of_week=day,
                start_time=start_time,
                end_time=end_time,
                recurrence="weekly"
            )
            db.add(availability)
    
    db.commit()
    print("Disponibilidad creada con éxito.")

# Función para crear sesiones de ejemplo
def create_sample_sessions():
    print("Creando sesiones de ejemplo...")
    
    mentors = db.query(Mentor).all()
    mentees = db.query(Mentee).all()
    
    # Crear algunas sesiones pasadas (completadas)
    for _ in range(20):
        mentor = random.choice(mentors)
        mentee = random.choice(mentees)
        
        # Fecha aleatoria en el pasado (1-30 días)
        days_ago = random.randint(1, 30)
        start_date = datetime.now() - timedelta(days=days_ago)
        start_hour = random.randint(9, 17)
        start_date = start_date.replace(hour=start_hour, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(hours=1)
        
        # Crear sesión
        session = SessionModel(
            mentor_id=mentor.user_id,
            mentee_id=mentee.user_id,
            start_time=start_date,
            end_time=end_date,
            status="completed"
        )
        db.add(session)
    
    # Crear algunas sesiones futuras (programadas)
    for _ in range(10):
        mentor = random.choice(mentors)
        mentee = random.choice(mentees)
        
        # Fecha aleatoria en el futuro (1-30 días)
        days_ahead = random.randint(1, 30)
        start_date = datetime.now() + timedelta(days=days_ahead)
        start_hour = random.randint(9, 17)
        start_date = start_date.replace(hour=start_hour, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(hours=1)
        
        # Crear sesión
        session = SessionModel(
            mentor_id=mentor.user_id,
            mentee_id=mentee.user_id,
            start_time=start_date,
            end_time=end_date,
            status="scheduled"
        )
        db.add(session)
    
    # Crear algunas sesiones canceladas
    for _ in range(5):
        mentor = random.choice(mentors)
        mentee = random.choice(mentees)
        
        # Fecha aleatoria en el pasado (1-30 días)
        days_ago = random.randint(1, 30)
        start_date = datetime.now() - timedelta(days=days_ago)
        start_hour = random.randint(9, 17)
        start_date = start_date.replace(hour=start_hour, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(hours=1)
        
        # Crear sesión
        session = SessionModel(
            mentor_id=mentor.user_id,
            mentee_id=mentee.user_id,
            start_time=start_date,
            end_time=end_date,
            status="cancelled"
        )
        db.add(session)
    
    db.commit()
    print("Sesiones de ejemplo creadas con éxito.")

# Ejecutar funciones
if __name__ == "__main__":
    create_users_and_profiles()
    create_skills()
    assign_skills_to_mentors()
    assign_interests_to_mentees()
    create_availability()
    create_sample_sessions()
    
    print("Datos de prueba creados con éxito.")
