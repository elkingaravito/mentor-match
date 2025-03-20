# Primero importamos de user.py (con las clases en el orden correcto)
from .user import (
    UserBase, UserCreate, UserUpdate, UserInDB, UserComplete,
    MentorProfile, MentorProfileCreate, MentorProfileUpdate,
    MenteeProfile, MenteeProfileCreate, MenteeProfileUpdate,
    Token, TokenPayload,
    User, UserWithProfile, Mentor, MentorCreate, MentorUpdate,
    Mentee, MenteeCreate, MenteeUpdate
)

# Luego importamos las clases de skill.py
from .skill import (
    Skill, SkillCreate, SkillUpdate, SkillList,
    MentorSkill, MentorSkillCreate, MentorSkillUpdate,
    MenteeInterest, MenteeInterestCreate, MenteeInterestUpdate,
    MentorSkillWithDetails, MenteeInterestWithDetails
)

# Finalmente importamos las clases de session.py
from .session import (
    Availability, AvailabilityCreate, AvailabilityUpdate, AvailabilityList,
    Session, SessionCreate, SessionUpdate, SessionList,
    SessionFeedback, SessionFeedbackCreate, SessionFeedbackUpdate,
    Notification, NotificationCreate, NotificationUpdate, NotificationList
)

# Exportamos todas las clases
__all__ = [
    "UserBase", "UserCreate", "UserUpdate", "UserInDB", "UserComplete",
    "MentorProfile", "MentorProfileCreate", "MentorProfileUpdate",
    "MenteeProfile", "MenteeProfileCreate", "MenteeProfileUpdate",
    "User", "UserWithProfile", "Mentor", "MentorCreate", "MentorUpdate",
    "Mentee", "MenteeCreate", "MenteeUpdate", "Token", "TokenPayload",
    "Skill", "SkillCreate", "SkillUpdate", "SkillList",
    "MentorSkill", "MentorSkillCreate", "MentorSkillUpdate",
    "MentorSkillWithDetails", "MenteeInterestWithDetails",
    "MenteeInterest", "MenteeInterestCreate", "MenteeInterestUpdate",
    "Availability", "AvailabilityCreate", "AvailabilityUpdate", "AvailabilityList",
    "Session", "SessionCreate", "SessionUpdate", "SessionList",
    "SessionFeedback", "SessionFeedbackCreate", "SessionFeedbackUpdate",
    "Notification", "NotificationCreate", "NotificationUpdate", "NotificationList"
]