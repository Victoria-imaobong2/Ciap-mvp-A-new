import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Default fallback to localhost if not provided
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/ciap_db"
)

# Create the SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency generator for FastAPI endpoints to get a DB session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
