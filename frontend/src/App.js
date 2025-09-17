import './App.css';
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './component/Header/header';
import Footer from './component/Footer/footer';
import HomePage from './pages';
// import AdminPage from './pages/admin';
import CabinetPage from './pages/cabinet';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import BasketPage from './pages/basket';
import { useState, useCallback, useRef } from 'react';
import MenuPage from './pages/Menu';
import TelegramWebAppInit from './component/TelegramWebAppInit/TelegramWebAppInit';
import PayPage from './pages/pay';
import OplataInfoPage from './pages/oplataInfo';
import VozvratPage from './pages/vozvrat';
import KonfidiPage from './pages/konfidi';
import BiznesLanchPage from './pages/biznesLanch';
import AdditionalServicesPage from './pages/additionalServices';
import { AuthProvider } from './useContext/AuthContext';
import { BasketProvider } from './useContext/basketContext';
import YandexMetrika from './component/yandexMetrika/yandexMetrika';

const routes = [
  // { path: '/admin', element: <AdminPage /> },
  { path: '/cabinet', element: <CabinetPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/basket', element: <BasketPage /> },
  { path: '/menu', element: <MenuPage /> },
  { path: '/pay', element: <PayPage /> },
  { path: '/payInfo', element: <OplataInfoPage /> },
  { path: '/vozvrat', element: <VozvratPage /> },
  { path: '/lanch', element: <BiznesLanchPage /> },
  { path: '/services', element: <AdditionalServicesPage /> },
  { path: '/policy', element: <KonfidiPage /> }
];

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableRef = useRef(null);
  const hallRef = useRef(null);
  const taxiRef = useRef(null);
  const deliveryRef = useRef(null);
  const contactsRef = useRef(null)

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
      <BasketProvider>
        <TelegramWebAppInit>
          <Helmet>
            <title>Дали-Хинкали кафе грузинской кухни с летней верандой</title>
            <meta name="description" content="БВ Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
            <meta name="yandex-verification" content="c2e397d2d61662dc" />
          </Helmet>
          <YandexMetrika />

          <Router>
            <Header
              modalOpen={modalOpen}
              modalClosed={modalClosed}
              isModalOpen={isModalOpen}
              tableRef={tableRef}
              hallRef={hallRef}
              taxiRef={taxiRef}
              deliveryRef={deliveryRef}
              contactsRef={contactsRef}
            />

            <Routes>
              <Route
                path="/"
                element={<HomePage
                  tableRef={tableRef}
                  hallRef={hallRef}
                  taxiRef={taxiRef}
                  deliveryRef={deliveryRef}
                  contactsRef={contactsRef}
                />}
                description="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району"
              />
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>

            <Footer contactsRef={contactsRef} />
          </Router>
        </TelegramWebAppInit>
      </BasketProvider>
    </AuthProvider>
  );
}

export default App;