from app.config import settings
from app.db.session import SessionLocal, engine, get_db

SQLALCHEMY_DATABASE_URL = settings.database_url