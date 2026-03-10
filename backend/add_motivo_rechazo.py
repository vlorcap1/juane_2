"""
Script de migración: Agregar campo motivoRechazo a la tabla contrataciones
Ejecutar: python add_motivo_rechazo.py
"""
import sqlite3
import os

# Obtener ruta de la base de datos  
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'seremis.db')
print(f"📁 Ruta de la base de datos: {DB_PATH}")

def add_motivo_rechazo_column():
    """Agregar columna motivoRechazo a la tabla contrataciones"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Listar todas las tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"\n📋 Tablas en la base de datos: {[t[0] for t in tables]}\n")
        
        # Verificar si la columna ya existe
        cursor.execute("PRAGMA table_info(contrataciones)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'motivoRechazo' not in columns:
            print("➕ Agregando columna 'motivoRechazo' a tabla contrataciones...")
            cursor.execute("ALTER TABLE contrataciones ADD COLUMN motivoRechazo TEXT")
            conn.commit()
            print("✅ Columna 'motivoRechazo' agregada exitosamente")
        else:
            print("✓ La columna 'motivoRechazo' ya existe")
        
        conn.close()
        print("\n✅ Migración completada")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🔄 MIGRACIÓN: Agregar campo motivoRechazo")
    print("=" * 60)
    add_motivo_rechazo_column()
