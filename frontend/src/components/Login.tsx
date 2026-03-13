import React, { useState, FormEvent, useEffect } from 'react';
import { authApi } from '../api/client';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
}

interface NewsItem {
  title: string;
  link: string;
  published: string;
  summary: string;
}

interface WeatherCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
}

interface WeatherDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

interface WeatherData {
  current: WeatherCurrent;
  daily: WeatherDaily;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── Weather helpers ──────────────────────────────────────────
function weatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return code === 1 ? '🌤️' : code === 2 ? '⛅' : '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '❄️';
  if (code <= 82) return '🌧️';
  return '⛈️';
}

function weatherDesc(code: number): string {
  const map: Record<number, string> = {
    0: 'Despejado', 1: 'Principalmente despejado', 2: 'Parcialmente nublado',
    3: 'Nublado', 45: 'Niebla', 48: 'Niebla con escarcha',
    51: 'Llovizna ligera', 53: 'Llovizna moderada', 55: 'Llovizna intensa',
    61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia fuerte',
    71: 'Nevada ligera', 73: 'Nevada moderada', 75: 'Nevada fuerte',
    80: 'Chubascos ligeros', 81: 'Chubascos moderados', 82: 'Chubascos fuertes',
    95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta intensa',
  };
  return map[code] ?? 'Variable';
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function formatPublished(raw: string): string {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return raw;
  }
}

// ── Component ────────────────────────────────────────────────
export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(1);

  // News state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string>('');

  // Slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev % 10) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch news from backend proxy
  useEffect(() => {
    fetch(`${API_BASE}/api/public/rss-feed`)
      .then((r) => r.json())
      .then((data) => {
        setNews(data.items || []);
        setNewsLoading(false);
      })
      .catch(() => {
        setNewsLoading(false);
      });
  }, []);

  // Fetch weather via geolocation → Open-Meteo
  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocalización no disponible');
      setWeatherLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocoding with Nominatim (free, no key)
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'es' } }
          );
          const geoData = await geoRes.json();
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.county ||
            'Tu ubicación';
          setCityName(city);

          // Open-Meteo (free, no API key)
          const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min',
            timezone: 'auto',
            forecast_days: '5',
          });
          const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
          const wData = await wRes.json();
          setWeather(wData);
          setWeatherLoading(false);
        } catch {
          setWeatherError('No se pudo obtener el clima');
          setWeatherLoading(false);
        }
      },
      () => {
        setWeatherError('Permite la ubicación para ver el clima');
        setWeatherLoading(false);
      }
    );
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const response = await authApi.login({ username, password });
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        rol: response.rol,
        nombre: response.nombre,
        cargo: response.cargo,
        sector: response.seremiId,
      }));
      onLoginSuccess({
        id: response.id,
        username: response.username,
        rol: response.rol,
        nombre: response.nombre,
        cargo: response.cargo,
        sector: response.seremiId,
        token: response.token,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background slideshow */}
      <div className="login-background">
        {[1,2,3,4,5,6,7,8,9,10].map((num) => (
          <div
            key={num}
            className={`login-bg-image ${currentImage === num ? 'active' : ''}`}
            style={{ backgroundImage: `url(/imagenes_login/${num}.png)` }}
          />
        ))}
        <div className="login-overlay" />
      </div>

      {/* 3-column panels */}
      <div className="login-panels">

        {/* ── LEFT: News ────────────────────────────── */}
        <div className="login-side-panel login-news-panel">
          <div className="lsp-header">
            <span className="lsp-icon">📰</span>
            <span className="lsp-title">Noticias Recientes</span>
          </div>
          <div className="lsp-body">
            {newsLoading ? (
              <div className="lsp-loading">Cargando noticias…</div>
            ) : news.length === 0 ? (
              <div className="lsp-empty">Sin noticias disponibles</div>
            ) : (
              news.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-item"
                >
                  <div className="news-title">{item.title}</div>
                  {item.published && (
                    <div className="news-date">{formatPublished(item.published)}</div>
                  )}
                </a>
              ))
            )}
          </div>
          <div className="lsp-footer">
            Fuente: Google Alerts
          </div>
        </div>

        {/* ── CENTER: Login form ─────────────────────── */}
        <div className="login-box">
          <div className="login-top">
            <div className="login-logo">M</div>
            <div className="login-title">Delegación Presidencial del Maule</div>
            <div className="login-sub">Sistema de Reportes Sectorial · Gobernación Regional</div>
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
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Weather ────────────────────────── */}
        <div className="login-side-panel login-weather-panel">
          <div className="lsp-header">
            <span className="lsp-icon">🌡️</span>
            <span className="lsp-title">Clima actual</span>
          </div>
          <div className="lsp-body">
            {weatherLoading ? (
              <div className="lsp-loading">Obteniendo clima…</div>
            ) : weatherError ? (
              <div className="lsp-empty">{weatherError}</div>
            ) : weather ? (
              <>
                {/* City */}
                {cityName && (
                  <div className="weather-city">📍 {cityName}</div>
                )}

                {/* Current */}
                <div className="weather-current">
                  <div className="weather-main-icon">
                    {weatherIcon(weather.current.weather_code)}
                  </div>
                  <div className="weather-temp">
                    {Math.round(weather.current.temperature_2m)}°C
                  </div>
                  <div className="weather-desc">
                    {weatherDesc(weather.current.weather_code)}
                  </div>
                </div>

                {/* Details */}
                <div className="weather-details">
                  <div className="weather-detail-item">
                    <span className="wdi-icon">💧</span>
                    <span className="wdi-label">Humedad</span>
                    <span className="wdi-value">{weather.current.relative_humidity_2m}%</span>
                  </div>
                  <div className="weather-detail-item">
                    <span className="wdi-icon">💨</span>
                    <span className="wdi-label">Viento</span>
                    <span className="wdi-value">{Math.round(weather.current.wind_speed_10m)} km/h</span>
                  </div>
                </div>

                {/* 5-day forecast */}
                <div className="weather-forecast-title">Próximos días</div>
                <div className="weather-forecast">
                  {weather.daily.time.map((dateStr, i) => {
                    const d = new Date(dateStr + 'T12:00:00');
                    const dayName = i === 0 ? 'Hoy' : DAY_NAMES[d.getDay()];
                    return (
                      <div key={i} className="forecast-day">
                        <div className="fc-day-name">{dayName}</div>
                        <div className="fc-icon">{weatherIcon(weather.daily.weather_code[i])}</div>
                        <div className="fc-temps">
                          <span className="fc-max">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                          <span className="fc-min">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
          <div className="lsp-footer">
            Fuente: Open-Meteo · Nominatim OSM
          </div>
        </div>

      </div>
    </div>
  );
};
