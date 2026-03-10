"""
Script para agregar las tablas visitas_autoridades y alertas a la base de datos
Ejecutar: python add_visitas_autoridades_table.py
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from app.core.database import Base, engine
from app.models import VisitaAutoridad, Alerta  # This will register the models

def create_table():
    """Crear las tablas visitas_autoridades y alertas si no existen"""
    
    # Crear todas las tablas que no existen
    Base.metadata.create_all(bind=engine, checkfirst=True)
    
    print("✅ Tablas creadas o ya existían:")
    
    # Verificar que las tablas existen
    with engine.connect() as conn:
        # Verificar visitas_autoridades
        result = conn.execute(text(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='visitas_autoridades'"
        ))
        if result.fetchone():
            print("  ✅ visitas_autoridades")
        else:
            print("  ❌ visitas_autoridades ERROR")
        
        # Verificar alertas
        result = conn.execute(text(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='alertas'"
        ))
        if result.fetchone():
            print("  ✅ alertas")
        else:
            print("  ❌ alertas ERROR")

if __name__ == "__main__":
    create_table()
