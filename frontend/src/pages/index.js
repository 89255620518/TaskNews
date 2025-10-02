import { Helmet } from "react-helmet";
import CabinetPage from "./Cabinet/cabinet";
import { useAuth } from '../useContext/AuthContext';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  const {  isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  // Используем isAuthenticated вместо token для проверки аутентификации
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ background: "#ffffff"  }}>
      <Helmet>
        <title>Тестовое задание</title>
      </Helmet>
      <CabinetPage />
    </div>
  );
}

export default HomePage;