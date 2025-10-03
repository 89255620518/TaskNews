import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from '../../useContext/AuthContext';
import Header from '../Header/header';
import HomePage from '../../pages/index';
import CabinetPage from '../../pages/CabinetPage/cabinet';
import AdminPage from '../../pages/CabinetPage/admin';
import ManagerPage from '../../pages/CabinetPage/manager';
import SupportPage from '../../pages/CabinetPage/support';
import LoginPage from '../../pages/AuthPage/login';
import RegisterPage from '../../pages/AuthPage/register';
import { ApiRoutes } from '../../api/server/routes/auth/authRoutes';
import { PropertyRoutes } from '../../api/server/routes/object/objectRoutes';
import { AppLoader } from './AppLoader';
import { 
  ProtectedRoute, 
  PublicRoute, 
  AdminRoute, 
  ManagerRoute, 
  SupportRoute 
} from './RouteComponents';

export const AppContent = () => {
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
};