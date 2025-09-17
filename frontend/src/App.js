import './App.css';
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from './component/Header/header';
import HomePage from './pages';
import CabinetPage from './pages/cabinet';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './useContext/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  return !token ? children : <Navigate to="/" replace />;
};

const routes = [
  { 
    path: '/cabinet', 
    element: (
      <ProtectedRoute>
        <CabinetPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/login', 
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ) 
  },
  { 
    path: '/register', 
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ) 
  },
];

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalOpen = useCallback(() => {
    document.body.classList.add('no-scroll');
    setIsModalOpen(true);
  }, []);

  const modalClosed = useCallback(() => {
    document.body.classList.remove('no-scroll');
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <Helmet>
        <title>Тестовое задание</title>
      </Helmet>
      <Router>
        <Header
          modalOpen={modalOpen}
          modalClosed={modalClosed}
          isModalOpen={isModalOpen}
        />

        <Routes>
          <Route path="/" element={<HomePage />} />
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
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