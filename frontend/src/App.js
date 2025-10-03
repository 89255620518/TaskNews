import './App.css';
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from './component/Header/header';
import HomePage from './pages';
import CabinetPage from './pages/CabinetPage/cabinet';
import AdminPage from './pages/CabinetPage/admin';
import ManagerPage from './pages/CabinetPage/manager';
import SupportPage from './pages/CabinetPage/support';
import LoginPage from './pages/AuthPage/login';
import RegisterPage from './pages/AuthPage/register';
import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './useContext/AuthContext';
import { ApiRoutes } from './api/server/routes/auth/authRoutes';
import { PropertyRoutes } from './api/server/routes/object/objectRoutes';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return isAdmin() ? children : <Navigate to="/cabinet" replace />;
};

const ManagerRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isManager } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return isManager() ? children : <Navigate to="/cabinet" replace />;
};

const SupportRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isSupport } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return isSupport() ? children : <Navigate to="/cabinet" replace />;
};

const AppLoader = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Загрузка приложения...
    </div>
  );
};

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading } = useAuth();

  const modalOpen = useCallback(() => {
    document.body.classList.add('no-scroll');
    setIsModalOpen(true);
  }, []);

  const modalClosed = useCallback(() => {
    document.body.classList.remove('no-scroll');
    setIsModalOpen(false);
  }, []);

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <>
      <Helmet>
        <title>Тестовое задание</title>
      </Helmet>
      <Router>
        <ApiRoutes />
        <PropertyRoutes />
        
        <Header
          modalOpen={modalOpen}
          modalClosed={modalClosed}
          isModalOpen={isModalOpen}
        />

        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/cabinet" 
            element={
              <ProtectedRoute>
                <CabinetPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } 
          />

          <Route 
            path="/manager" 
            element={
              <ManagerRoute>
                <ManagerPage />
              </ManagerRoute>
            } 
          />

          <Route 
            path="/support" 
            element={
              <SupportRoute>
                <SupportPage />
              </SupportRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;