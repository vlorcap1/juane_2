"""Test database connection"""
import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal, engine
from app.core.config import settings
from app.models.user import User

def test_db_connection():
    """Test the database connection"""
    try:
        print(f"Database URL from settings: {settings.DATABASE_URL}")
        print(f"Engine URL: {engine.url}")
        print(f"Engine URL.database: {engine.url.database}")
        
        # Check if the database file actually exists
        db_file_path = str(engine.url.database)
        print(f"Database file path: {db_file_path}")
        print(f"Database file exists: {os.path.exists(db_file_path)}")
        
        # Create a session
        db = SessionLocal()
        
        # Test connection with raw SQL first
        from sqlalchemy import text
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = result.fetchall()
        print(f"Tables found: {[table[0] for table in tables]}")
        
        # Test query
        user = db.query(User).first()
        
        print("Database connection successful!")
        if user:
            print(f"Found user: {user.username}")
        else:
            print("No users found in database")
            
        db.close()
        
    except Exception as e:
        print(f"Database error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_db_connection()