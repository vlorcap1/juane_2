"""Migración: añade columna 'hora' a la tabla agenda"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine
from sqlalchemy import text

def run():
    with engine.connect() as conn:
        # Verificar si la columna ya existe
        result = conn.execute(text("PRAGMA table_info(agenda)"))
        columns = [row[1] for row in result.fetchall()]
        if 'hora' in columns:
            print("✓ Columna 'hora' ya existe en 'agenda'.")
            return
        conn.execute(text("ALTER TABLE agenda ADD COLUMN hora VARCHAR"))
        conn.commit()
        print("✓ Columna 'hora' agregada a 'agenda' exitosamente.")

if __name__ == '__main__':
    run()
