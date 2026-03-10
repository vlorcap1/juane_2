"""
Script para crear todas las tablas de la base de datos
Ejecutar: python create_tables.py
"""
import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import engine, Base
import app.models  # Import all models to register them

def create_tables():
    """Crear todas las tablas en la base de datos"""
    try:
        print("=" * 60)
        print("🔄 CREANDO TABLAS EN LA BASE DE DATOS")
        print("=" * 60)
        print(f"\n📁 Base de datos: {engine.url.database}\n")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Todas las tablas han sido creadas exitosamente\n")
        
        # List tables
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = [row[0] for row in result]
            print(f"📋 Tablas creadas: {', '.join(tables)}\n")
        
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error al crear las tablas: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_tables()
