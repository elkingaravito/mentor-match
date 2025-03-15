from app.core.database import engine
from app.models import base, user, matching, availability, match_algorithm, statistics

def init_db():
    # Create all tables
    base.Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Database tables created successfully!")
