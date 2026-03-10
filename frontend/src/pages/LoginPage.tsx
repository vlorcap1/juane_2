import { useState } from 'react';
import { useAuth } from '../hooks/useApi';

const LoginPage = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password) {
      setError('Usuario y contraseña son requeridos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(credentials);
      // La navegación se maneja en App.tsx
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-top">
          <div className="login-logo">M</div>
          <div className="login-title">SEREMIS Maule</div>
          <div className="login-sub">Sistema de Reportería</div>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Ingresa tu usuario"
              value={credentials.username}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Ingresa tu contraseña"
              value={credentials.password}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          
          <div className="login-hint">
            <strong>Credenciales de acceso:</strong><br />
            Admin: <code>admin / admin123</code><br />
            SEREMI: <code>seremi / seremi123</code>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
