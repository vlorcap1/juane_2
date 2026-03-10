"""
Script para verificar las columnas de una tabla
Ejecutar: python verify_columns.py contrataciones
"""
import sqlite3
import sys
import os

# Obtener ruta de la base de datos
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'seremis.db')

def verify_table_columns(table_name='contrataciones'):
    """Verificar las columnas de una tabla"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        print("=" * 60)
        print(f"📋 COLUMNAS DE LA TABLA: {table_name}")
        print("=" * 60)
        print(f"\n{'ID':<5} {'Nombre':<20} {'Tipo':<15} {'Not Null':<10} {'Default'}")
        print("-" * 60)
        
        for col in columns:
            cid, name, col_type, notnull, default_val, pk = col
            print(f"{cid:<5} {name:<20} {col_type:<15} {notnull:<10} {default_val}")
        
        print("\n" + "=" * 60)
        
        # Verificar si existe motivoRechazo
        column_names = [col[1] for col in columns]
        if 'motivoRechazo' in column_names:
            print("\n✅ La columna 'motivoRechazo' EXISTE en la tabla")
        else:
            print("\n❌ La columna 'motivoRechazo' NO EXISTE en la tabla")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    table_name = sys.argv[1] if len(sys.argv) > 1 else 'contrataciones'
    verify_table_columns(table_name)
