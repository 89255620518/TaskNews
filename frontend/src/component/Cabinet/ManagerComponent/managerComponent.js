import { useState, useEffect } from 'react';
import { useAuth } from '../../../useContext/AuthContext';
import { api } from '../../../api/api';
import styles from './manager.module.scss';
import ActiveRentals from './management/activeRentals';
import ClientsManagement from './management/clientsManagement';
import PropertiesManagement from './management/objectManagement';
import RentalRequests from './management/rentalRequests';

const ManagerComponent = () => {
  const { token, user, isManager, isAuthenticated } = useAuth();
  const [currentSection, setCurrentSection] = useState('requests');
  const [managerData, setManagerData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      setError('Требуется авторизация');
      setAccessDenied(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }

    if (user && !isManager()) {
      setError('Нет доступа к разделу менеджера');
      setAccessDenied(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }

    if (user && isManager()) {
      setManagerData({
        name: `${user.lastName || ''} ${user.firstName || ''}`.trim(),
        email: user.email || '',
        role: user.role || 'manager',
        lastLogin: new Date().toLocaleString('ru-RU')
      });
      loadStats();
    }
  }, [token, user, isManager, isAuthenticated]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [propertiesResponse, usersResponse] = await Promise.all([
        api.properties.getAllProperties(),
        api.users.getAll()
      ]);
      
      const properties = propertiesResponse.data?.data || propertiesResponse.data || [];
      const users = usersResponse.data?.users || usersResponse.data || [];
      
      const activeProperties = Array.isArray(properties) 
        ? properties.filter(prop => prop.status === 'active')
        : [];
      const rentalProperties = activeProperties.filter(prop => prop.category === 'rent');
      const clients = Array.isArray(users) 
        ? users.filter(u => u.role === 'user')
        : [];
      
      setStats({
        totalProperties: activeProperties.length,
        rentalProperties: rentalProperties.length,
        totalClients: clients.length,
        pendingRequests: 5,
        activeRentals: 12
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'user': 'Клиент',
      'admin': 'Администратор компании',
      'manager': 'Менеджер по аренде',
      'support': 'Служба поддержки'
    };
    return roleMap[role] || role;
  };

  if (accessDenied) {
    return (
      <div className={styles.managerContainer}>
        <div className={styles.accessDenied}>
          <h2>Доступ запрещен</h2>
          <p>{error || 'Нет доступа к разделу менеджера'}</p>
          <p>Перенаправление на страницу входа через 3 секунды...</p>
        </div>
      </div>
    );
  }

  if (!managerData) {
    return (
      <div className={styles.managerContainer}>
        <div className={styles.loading}>Загрузка панели менеджера...</div>
      </div>
    );
  }

  return (
    <div className={styles.managerContainer}>
      <div className={styles.managerHeader}>
        <h1 className={styles.managerTitle}>Панель менеджера по аренде</h1>
        
        <div className={styles.managerInfo}>
          <p><strong>Менеджер:</strong> {managerData.name}</p>
          <p><strong>Email:</strong> {managerData.email}</p>
          <p><strong>Роль:</strong> {getRoleDisplay(managerData.role)}</p>
          <p><strong>Текущая сессия:</strong> {managerData.lastLogin}</p>
        </div>

        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏠</div>
              <div className={styles.statInfo}>
                <h3>{stats.totalProperties}</h3>
                <p>Всего объектов</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔑</div>
              <div className={styles.statInfo}>
                <h3>{stats.rentalProperties}</h3>
                <p>Для аренды</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statInfo}>
                <h3>{stats.totalClients}</h3>
                <p>Клиентов</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📋</div>
              <div className={styles.statInfo}>
                <h3>{stats.pendingRequests}</h3>
                <p>Новых заявок</p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.managerNavigation}>
          <button 
            className={`${styles.navButton} ${currentSection === 'requests' ? styles.active : ''}`}
            onClick={() => setCurrentSection('requests')}
          >
            📋 Заявки на аренду
          </button>
          <button 
            className={`${styles.navButton} ${currentSection === 'clients' ? styles.active : ''}`}
            onClick={() => setCurrentSection('clients')}
          >
            👥 Клиенты
          </button>
          <button 
            className={`${styles.navButton} ${currentSection === 'properties' ? styles.active : ''}`}
            onClick={() => setCurrentSection('properties')}
          >
            🏠 Объекты недвижимости
          </button>
          <button 
            className={`${styles.navButton} ${currentSection === 'rentals' ? styles.active : ''}`}
            onClick={() => setCurrentSection('rentals')}
          >
            📄 Активные аренды
          </button>
        </div>
      </div>

      <div className={styles.managerContent}>
        {currentSection === 'requests' && <RentalRequests />}
        {currentSection === 'clients' && <ClientsManagement />}
        {currentSection === 'properties' && <PropertiesManagement />}
        {currentSection === 'rentals' && <ActiveRentals />}
      </div>
    </div>
  );
};

export default ManagerComponent;