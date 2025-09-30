import { useState, useEffect } from 'react';
import { useAuth } from '../../useContext/AuthContext';
import UsersManagement from './management/users/UsersManagement';
import PropertiesManagement from './management/objects/ObjectsManagement';
import styles from './admin.module.scss';

const AdminComponent = () => {
  const { token, logout: authLogout, user, isAdmin } = useAuth();
  const [currentSection, setCurrentSection] = useState('users');
  const [adminData, setAdminData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Требуется авторизация');
      setAccessDenied(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }

    if (user && !isAdmin()) {
      setError('Нет доступа к разделу администратора');
      setAccessDenied(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }

    if (user && isAdmin()) {
      setAdminData({
        name: `${user.lastName || ''} ${user.firstName || ''}`.trim(),
        email: user.email || '',
        role: user.role || 'admin',
        lastLogin: new Date().toLocaleString('ru-RU')
      });
    }
  }, [token, user, isAdmin]);

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
      <div className={styles.adminContainer}>
        <div className={styles.accessDenied}>
          <h2>Доступ запрещен</h2>
          <p>{error || 'Нет доступа к разделу администратора'}</p>
          <p>Перенаправление на страницу входа через 3 секунды...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.loading}>Загрузка панели администратора...</div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Панель администратора</h1>
        
        <div className={styles.adminInfo}>
          <p><strong>Администратор:</strong> {adminData.name}</p>
          <p><strong>Email:</strong> {adminData.email}</p>
          <p><strong>Роль:</strong> {getRoleDisplay(adminData.role)}</p>
          <p><strong>Текущая сессия:</strong> {adminData.lastLogin}</p>
        </div>

        <div className={styles.adminNavigation}>
          <button 
            className={`${styles.navButton} ${currentSection === 'users' ? styles.active : ''}`}
            onClick={() => setCurrentSection('users')}
          >
            👥 Пользователи
          </button>
          <button 
            className={`${styles.navButton} ${currentSection === 'properties' ? styles.active : ''}`}
            onClick={() => setCurrentSection('properties')}
          >
            🏠 Объекты недвижимости
          </button>
          <button 
            className={`${styles.navButton} ${currentSection === 'stats' ? styles.active : ''}`}
            onClick={() => setCurrentSection('stats')}
          >
            📊 Статистика
          </button>
        </div>
      </div>

      <div className={styles.adminContent}>
        {currentSection === 'users' && (
          <UsersManagement />
        )}
        {currentSection === 'properties' && (
          <PropertiesManagement />
        )}
        {currentSection === 'stats' && (
          <div className={styles.statsSection}>
            <h2>📊 Общая статистика</h2>
            <p>Раздел статистики в разработке...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComponent;