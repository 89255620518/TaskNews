
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../useContext/AuthContext';
import { api } from '../../api/api';
import styles from './admin.module.scss';

const AdminComponent = () => {
  const { token, logout: authLogout } = useAuth();
  const [currentView, setCurrentView] = useState('all');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState(null);

  const fetchAdminData = useCallback(async () => {
    try {
      const response = await api.users.getMe();
      
      if (response.success) {
        const userData = response.user || response;
        
        if (userData.role !== 'admin') {
          setError('Доступ запрещен. Требуются права администратора');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        
        setAdminData({
          name: `${userData.last_name || userData.lastName || ''} ${userData.first_name || userData.firstName || ''}`,
          email: userData.email || '',
          role: userData.role || 'user',
          lastLogin: new Date().toLocaleString('ru-RU')
        });
      }
    } catch (err) {
      console.error('Ошибка загрузки данных администратора:', err);
      if (err.message?.includes('администратора') || err.message?.includes('Доступ запрещен')) {
        setError(err.message);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.admin.getUsers();
      console.log('Users response:', response);

      if (response.success) {
        const usersData = Array.isArray(response.users) ? response.users : 
                         Array.isArray(response.data) ? response.data : 
                         Array.isArray(response) ? response : [];
        
        const formattedUsers = usersData.map(user => ({
          id: user.id,
          firstName: user.first_name || user.firstName || '',
          lastName: user.last_name || user.lastName || '',
          patronymic: user.patronymic || '',
          email: user.email || '',
          role: user.role || 'user',
          phoneNumber: user.phone_number || user.phoneNumber || user.phone || '',
          status: user.status || 'active',
          lastActivity: user.last_activity || user.lastActivity || new Date()
        }));

        setUsers(formattedUsers);
      } else {
        setError(response.message || 'Не удалось загрузить пользователей');
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      setError(err.message || 'Ошибка загрузки пользователей');
      if (err.response?.status === 401 || err.message?.includes('авторизация')) {
        authLogout();
      }
      if (err.message?.includes('администратора') || err.message?.includes('Доступ запрещен')) {
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [authLogout]);

  useEffect(() => {
    if (!token) {
      setError('Требуется авторизация');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    fetchAdminData();
    fetchUsers();
  }, [token, fetchAdminData, fetchUsers]);

  useEffect(() => {
    switch (currentView) {
      case 'all':
        setFilteredUsers(users);
        break;
      case 'active':
        setFilteredUsers(users.filter(user => user.status === 'active'));
        break;
      case 'inactive':
        setFilteredUsers(users.filter(user => user.status === 'inactive'));
        break;
      default:
        setFilteredUsers(users);
    }
  }, [currentView, users]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        const response = await api.admin.deleteUser(userId);
        
        if (response.success) {
          setUsers(users.filter(user => user.id !== userId));
          setError('');
        } else {
          setError(response.message || 'Ошибка удаления пользователя');
        }
      } catch (err) {
        console.error('Ошибка удаления:', err);
        setError(err.message || 'Ошибка удаления пользователя');
        if (err.message?.includes('администратора') || err.message?.includes('Доступ запрещен')) {
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        const updateData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          patronymic: userData.patronymic,
          email: userData.email,
          phoneNumber: userData.phoneNumber.replace(/\D/g, ''),
          role: userData.role,
          status: userData.status
        };

        const response = await api.admin.updateUser(editingUser.id, updateData);
        
        if (response.success) {
          const updatedUser = response.user || response;
          setUsers(users.map(user => 
            user.id === editingUser.id ? {
              ...user,
              firstName: updatedUser.first_name || updatedUser.firstName || userData.firstName,
              lastName: updatedUser.last_name || updatedUser.lastName || userData.lastName,
              patronymic: updatedUser.patronymic || userData.patronymic,
              email: updatedUser.email || userData.email,
              phoneNumber: updatedUser.phone_number || updatedUser.phoneNumber || userData.phoneNumber,
              role: updatedUser.role || userData.role,
              status: updatedUser.status || userData.status
            } : user
          ));
          setError('');
        } else {
          setError(response.message || 'Ошибка сохранения пользователя');
        }
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(err.message || err.response?.data?.message || 'Ошибка сохранения пользователя');
      if (err.message?.includes('администратора') || err.message?.includes('Доступ запрещен')) {
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Не указан';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '+$1 ($2) $3-$4-$5');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7 ($1) $2-$3-$4');
    }
    return phone;
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'user': 'Пользователь',
      'admin': 'Администратор',
      'moderator': 'Модератор'
    };
    return roleMap[role] || role;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'active': 'Активен',
      'inactive': 'Неактивен'
    };
    return statusMap[status] || status;
  };

  if (error && (error.includes('администратора') || error.includes('Доступ запрещен'))) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.error}>
          {error}
          <p>Перенаправление на главную страницу...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.loading}>Загрузка...</div>
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
          <p><strong>Последний вход:</strong> {adminData.lastLogin}</p>
        </div>

        <div className={styles.adminNav}>
          <button 
            className={`${styles.navButton} ${currentView === 'all' ? styles.active : ''}`}
            onClick={() => setCurrentView('all')}
          >
            Все пользователи ({users.length})
          </button>
          <button 
            className={`${styles.navButton} ${currentView === 'active' ? styles.active : ''}`}
            onClick={() => setCurrentView('active')}
          >
            Активные пользователи ({users.filter(u => u.status === 'active').length})
          </button>
          <button 
            className={`${styles.navButton} ${currentView === 'inactive' ? styles.active : ''}`}
            onClick={() => setCurrentView('inactive')}
          >
            Неактивные пользователи ({users.filter(u => u.status === 'inactive').length})
          </button>
        </div>
      </div>

      {error && !error.includes('администратора') && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '10px' }}>×</button>
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          Загрузка данных...
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className={styles.usersGrid}>
          {filteredUsers.map(user => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userHeader}>
                <h3 className={styles.userName}>
                  {user.lastName} {user.firstName} {user.patronymic}
                </h3>
                <div className={styles.userRole}>
                  {getRoleDisplay(user.role)}
                </div>
              </div>

              <div className={styles.userInfo}>
                <p>
                  <span>Email:</span> {user.email}
                </p>
                <p>
                  <span>Телефон:</span> {formatPhone(user.phoneNumber)}
                </p>
                <p>
                  <span>Последняя активность:</span> {formatDate(user.lastActivity)}
                </p>
                <p>
                  <span>Статус:</span> 
                  <span className={`${styles.userStatus} ${styles[user.status]}`}>
                    {getStatusDisplay(user.status)}
                  </span>
                </p>
              </div>

              <div className={styles.userActions}>
                <button 
                  className={`${styles.actionButton} ${styles.edit}`}
                  onClick={() => handleEditUser(user)}
                >
                  Редактировать
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.delete}`}
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className={styles.error}>
          {currentView === 'all' ? 'Нет пользователей' : 
           currentView === 'active' ? 'Нет активных пользователей' : 
           'Нет неактивных пользователей'}
        </div>
      )}

      {showModal && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
            setError('');
          }}
          getRoleDisplay={getRoleDisplay}
          getStatusDisplay={getStatusDisplay}
        />
      )}
    </div>
  );
};

const EditUserModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    patronymic: user?.patronymic || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || 'user',
    status: user?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return '+7';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '+7';
    if (cleaned.length <= 3) return `+7 (${cleaned}`;
    if (cleaned.length <= 6) return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    if (cleaned.length <= 8) return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+7')) {
      cleaned = '+7' + cleaned.replace(/^\+/, '');
    }
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    
    setFormData({
      ...formData,
      phoneNumber: cleaned
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          Редактирование пользователя
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Фамилия:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Имя:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Отчество:</label>
            <input
              type="text"
              name="patronymic"
              value={formData.patronymic}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Телефон:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formatPhoneDisplay(formData.phoneNumber)}
              onChange={handlePhoneChange}
              placeholder="+7 (912) 345-67-89"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Роль:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
              <option value="moderator">Модератор</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Статус:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.saveButton}
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminComponent;