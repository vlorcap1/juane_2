"""Fix admin password - hash it properly with bcrypt"""
import sys
import os
from pathlib import Path

# Add the parent directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User

def fix_admin_password():
    """Update admin password to properly hashed version"""
    db = SessionLocal()
    
    try:
        # Find admin user
        admin = db.query(User).filter(User.username == "admin").first()
        
        if not admin:
            print("❌ Usuario admin no encontrado")
            print("Creando usuario admin...")
            
            # Create admin user with hashed password
            from app.core.security import get_password_hash
            new_admin = User(
                id="admin",
                username="admin",
                pass_=get_password_hash("admin123"),
                rol="admin",
                nombre="Administrador Regional",
                cargo="Admin",
                email="admin@gore-maule.cl",
                seremiId=None
            )
            db.add(new_admin)
            db.commit()
            print("✅ Usuario admin creado con contraseña hasheada")
        else:
            print(f"✓ Usuario admin encontrado (ID: {admin.id})")
            print(f"  Username: {admin.username}")
            print(f"  Rol: {admin.rol}")
            print(f"  Nombre: {admin.nombre}")
            
            # Check if password is already hashed (bcrypt hashes start with $2b$)
            if admin.pass_.startswith('$2b$'):
                print("✓ La contraseña ya está hasheada correctamente")
            else:
                print("❌ La contraseña NO está hasheada (texto plano detectado)")
                print("Actualizando contraseña a versión hasheada...")
                
                # Update password to hashed version
                admin.pass_ = get_password_hash("admin123")
                db.commit()
                
                print("✅ Contraseña actualizada correctamente")
                print("   Ahora puedes hacer login con: admin / admin123")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    print("═" * 60)
    print("  CORRIGIENDO CONTRASEÑA DE ADMIN")
    print("═" * 60)
    fix_admin_password()
    print("═" * 60)
