"""Migration: add 'minuta' TEXT column to agenda table."""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'seremis.db')

conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

cols = [row[1] for row in cur.execute("PRAGMA table_info(agenda)").fetchall()]
if 'minuta' not in cols:
    cur.execute("ALTER TABLE agenda ADD COLUMN minuta TEXT")
    conn.commit()
    print("✓ Columna 'minuta' agregada a 'agenda' exitosamente.")
else:
    print("ℹ  La columna 'minuta' ya existe en 'agenda'. Nada que hacer.")

conn.close()
