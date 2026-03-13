import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './components/Login';
import Header from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { Dashboard } from './components/Dashboard';
import { MiSeremi } from './components/MiSeremi';
import { ContratacionesPage } from './components/ContratacionesPage';
import { UsuariosPage } from './components/UsuariosPage';
import { IndicadoresPage } from './components/IndicadoresPage';
import { ForoPage } from './components/ForoPage';
import VisitasAutoridadesPage from './components/VisitasAutoridadesPage';
import SEIAProyectosPage from './components/SEIAProyectosPage';
import NoticiasPage from './components/NoticiasPage';
import { ToastProvider } from './components/ui/Toast';
import { FilterProvider } from './context/FilterContext';
import { NuevoRegistroProvider } from './context/NuevoRegistroContext';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { NuevoRegistroModal } from './components/modals/NuevoRegistroModal';

// POR esto:
interface User {
  id: string;
  username: string;
  rol: string;
  nombre: string;
  cargo: string;
  sector: string;
  token: string;
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="login-container">
        <div style={{ color: 'var(--text)', fontSize: '14px' }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <ThemeProvider>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <FilterProvider>
          <NuevoRegistroProvider>
            <AppContent user={user} onLogout={handleLogout} />
          </NuevoRegistroProvider>
        </FilterProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

// Component to use hooks inside providers
interface AppContentProps {
  user: User;
  onLogout: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Auto-logout after 30 minutes of inactivity
  useSessionTimeout(() => {
    onLogout();
  });

  const getCurrentPeriod = () => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'miseremi':
        return <MiSeremi user={user} />;
      case 'contrataciones':
        return <ContratacionesPage user={user} />;
      case 'autoridades':
        return <VisitasAutoridadesPage />;
      case 'usuarios':
        return <UsuariosPage user={user} />;
      case 'kpis':
        return <IndicadoresPage user={user} />;
      case 'foro':
        return <ForoPage user={user} />;
      case 'seia':
        return <SEIAProyectosPage />;
      case 'noticias':
        return <NoticiasPage user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div>
      <Header 
        user={user} 
        currentPeriod={getCurrentPeriod()} 
        onLogout={onLogout}
      />
      <TabNavigation 
        user={user} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
      {renderTabContent()}
      
      {/* Global modals */}
      <NuevoRegistroModal />
    </div>
  );
};

export default App;