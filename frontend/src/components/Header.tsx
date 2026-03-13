import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, MessageSquare } from 'lucide-react';
import { notificacionesApi } from '../api/client';
import { Notificacion } from '../types';
import AlertasPanel from './AlertasPanel';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  user: any;
  currentPeriod: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentPeriod, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificacionesApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.leida).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const toggleNotifPanel = () => {
    setNotifPanelOpen(!notifPanelOpen);
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificacionesApi.markAllRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getUserAvatar = () => {
    if (user.rol === 'admin') return 'A';
    if (user.sector) return user.sector.charAt(0).toUpperCase();
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <header>
      <div className="header-left">
        <div className="logo-badge">
          <img src="/logo.png" alt="Logo Delegacion Presidencial del Maule" />
        </div>
        <div>
          <div className="header-title">Delegación Presidencial del Maule</div>
          <div className="header-sub">Sistema de Reportería Sectorial · Gobierno Regional</div>
        </div>
      </div>
      <div className="header-right">
        <div className="period-badge">{currentPeriod}</div>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        {/* Alertas del sistema - Rojo/Naranja */}
        <div style={{ position: 'relative' }}>
          <AlertasPanel />
        </div>
        
        {/* Notificaciones de usuario - Azul */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <div className="notif-btn" onClick={toggleNotifPanel} title="Notificaciones personales">
            <MessageSquare size={18} />
            {unreadCount > 0 && (
              <div className="notif-badge">{unreadCount}</div>
            )}
          </div>
          <div className={`notif-panel ${notifPanelOpen ? 'open' : ''}`}>
            <div className="notif-panel-head">
              <div className="notif-panel-title">Notificaciones</div>
              <div className="notif-panel-actions">
                <button className="notif-panel-btn" onClick={markAllNotificationsRead}>
                  Marcar todas
                </button>
              </div>
            </div>
            <div className="notif-panel-body">
              {notifications.length === 0 ? (
                <div className="notif-empty">No hay notificaciones</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`notif-item ${!notif.leida ? 'unread' : ''}`}>
                    <div className="notif-message">{notif.mensaje || notif.titulo}</div>
                    <div className="notif-date">{new Date(notif.creadoEn).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="user-chip">
          <div className={`user-avatar ${user.rol === 'admin' ? 'admin' : ''}`}>
            {getUserAvatar()}
          </div>
          <div>
            <div className="user-name">{user.nombre || user.username}</div>
            <div className="user-role">{user.cargo || (user.rol === 'admin' ? 'Delegado Presidencial' : 'SEREMI')}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Salir</button>
      </div>
    </header>
  );
};

export default Header;