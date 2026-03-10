import sqlite3
c = sqlite3.connect('seremis.db')
rows = c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print([r[0] for r in rows])
c.close()
