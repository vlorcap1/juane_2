import React, { useState, FormEvent, useEffect } from 'react';
import { authApi } from '../api/client';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(1);

  // Slideshow automático de las imágenes de fondo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev % 10) + 1);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      console.log('Attempting login...');
      const response = await authApi.login({ username, password });
      console.log('Login response:', response);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        rol: response.rol,
        nombre: response.nombre,
        cargo: response.cargo,
        sector: response.seremiId
      }));
      
      console.log('Tokens saved:', {
        authToken: localStorage.getItem('authToken'),
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user')
      });
      
      onLoginSuccess({
        id: response.id,
        username: response.username,
        rol: response.rol,
        nombre: response.nombre,
        cargo: response.cargo,
        sector: response.seremiId,
        token: response.token
      });
    } catch (error) {
      console.error('Login error:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Slideshow de fondo */}
      <div className="login-background">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <div
            key={num}
            className={`login-bg-image ${currentImage === num ? 'active' : ''}`}
            style={{
              backgroundImage: `url(/imagenes_login/${num}.png)`
            }}
          />
        ))}
        <div className="login-overlay" />
      </div>

      {/* Formulario de login */}
      <div className="login-box">
        <div className="login-top">
          <div className="login-logo">M</div>
          <div className="login-title">Delegación Presidencial del Maule</div>
          <div className="login-sub">Sistema de Reportes Sectorial - Gobernación Regional</div>
        </div>
        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <div className={`login-error ${error ? 'visible' : ''}`}>
              Usuario o contraseña incorrectos.
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};