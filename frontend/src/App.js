import './App.css';
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './component/Header/header';
import HomePage from './pages';
// import AdminPage from './pages/admin';
import CabinetPage from './pages/cabinet';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import { useState, useCallback } from 'react';
import { AuthProvider } from './useContext/AuthContext';

const routes = [
  // { path: '/admin', element: <AdminPage /> },
  { path: '/cabinet', element: <CabinetPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
];

function App() {
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
    <AuthProvider>
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
              <Route
                path="/"
                element={<HomePage />}
              />
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </Router>
    </AuthProvider>
  );
}

export default App;