import { Navigate } from "react-router-dom";
import { useAuth } from '../../useContext/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return isAdmin() ? children : <Navigate to="/cabinet" replace />;
};

export const ManagerRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isManager } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return isManager() ? children : <Navigate to="/cabinet" replace />;
};

export const SupportRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isSupport } = useAuth();
  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return isSupport() ? children : <Navigate to="/cabinet" replace />;
};