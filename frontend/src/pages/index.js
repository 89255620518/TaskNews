import { Helmet } from "react-helmet";
import CabinetPage from "./cabinet";
import { useAuth } from '../useContext/AuthContext';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ background: "#ffffff" }}>
      <Helmet>
        <title>Тестовое задание</title>
      </Helmet>
      <CabinetPage />
    </div>
  );
}

export default HomePage;