import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../useContext/AuthContext';
import { api } from '../../api/api';
import styles from './admin.module.scss';

const AdminComponent = () => {
  const { token, logout: authLogout, user, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('all');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.admin.getUsers();
      console.log('Users response:', response);

      if (response && response.success) {
        const usersData = Array.isArray(response.data?.users) ? response.data.users : 
                         Array.isArray(response.users) ? response.users : 
                         Array.isArray(response.data) ? response.data : 
                         [];
        
        const formattedUsers = usersData.map(user => ({
          id: user.id,
          firstName: user.firstName || user.first_name || '',
          lastName: user.lastName || user.last_name || '',
          patronymic: user.patronymic || '',
          email: user.email || '',
          role: user.role || 'user',
          phoneNumber: user.phoneNumber || user.phone_number || user.phone || '',
          createdAt: user.createdAt || user.created_at || new Date(),
          updatedAt: user.updatedAt || user.updated_at || new Date()
        }));

        setUsers(formattedUsers);
      } else {
        setError(response?.data?.message || response?.message || 'Не удалось загрузить пользователей');
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки пользователей');
      
      if (err.response?.status === 401 || err.message?.includes('авторизация')) {
        authLogout();
      }
      if (err.response?.status === 403 || err.message?.includes('администратора') || err.message?.includes('Доступ запрещен')) {
        setAccessDenied(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [authLogout]);

  useEffect(() => {
    if (user && isAdmin()) {
      fetchUsers();
    }
  }, [user, isAdmin, fetchUsers]);

  useEffect(() => {
    switch (currentView) {
      case 'all':
        setFilteredUsers(users);
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
        
        if (response && response.success) {
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
          setError('');
        } else {
          setError(response?.data?.message || response?.message || 'Ошибка удаления пользователя');
        }
      } catch (err) {
        console.error('Ошибка удаления:', err);
        setError(err.response?.data?.message || err.message || 'Ошибка удаления пользователя');
        
        if (err.response?.status === 403 || err.message?.includes('администратора') || err.message?.includes('Доступ запрещен')) {
          setAccessDenied(true);
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        }
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const response = await api.admin.updateUserRole(userId, newRole);
      
      if (response && response.success) {
        const updatedUser = response.data || response;
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? {
              ...user,
              role: updatedUser.role || newRole
            } : user
          )
        );
        setError('');
      } else {
        setError(response?.data?.message || response?.message || 'Ошибка обновления роли');
      }
    } catch (err) {
      console.error('Ошибка обновления роли:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка обновления роли');
      
      if (err.response?.status === 403 || err.message?.includes('администратора') || err.message?.includes('Доступ запрещен')) {
        setAccessDenied(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
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
          role: userData.role
        };

        const response = await api.admin.updateUser(editingUser.id, updateData);
        
        if (response && response.success) {
          const updatedUser = response.data || response;
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === editingUser.id ? {
                ...user,
                firstName: updatedUser.firstName || updatedUser.first_name || userData.firstName,
                lastName: updatedUser.lastName || updatedUser.last_name || userData.lastName,
                patronymic: updatedUser.patronymic || userData.patronymic,
                email: updatedUser.email || userData.email,
                phoneNumber: updatedUser.phoneNumber || updatedUser.phone_number || userData.phoneNumber,
                role: updatedUser.role || userData.role,
                updatedAt: new Date().toISOString()
              } : user
            )
          );
          setError('');
        } else {
          setError(response?.data?.message || response?.message || 'Ошибка сохранения пользователя');
        }
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка сохранения пользователя');
      
      if (err.response?.status === 403 || err.message?.includes('администратора') || err.message?.includes('Доступ запрещен')) {
        setAccessDenied(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Не указано';
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
      'user': 'Клиент',
      'admin': 'Администратор компании',
      'manager': 'Менеджер по аренде',
      'support': 'Служба поддержки'
    };
    return roleMap[role] || role;
  };

  // Если доступ запрещен
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

  if (loading || !adminData) {
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
        <div className={styles.adminStats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{users.length}</span>
            <span className={styles.statLabel}>Всего пользователей</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{users.filter(u => u.role === 'user').length}</span>
            <span className={styles.statLabel}>Клиентов</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statNumber}>{users.filter(u => u.role === 'manager').length}</span>
            <span className={styles.statLabel}>Менеджер по аренде</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statNumber}>{users.filter(u => u.role === 'support').length}</span>
            <span className={styles.statLabel}>Служба поддержки</span>
          </div>
        </div>

        <div className={styles.adminNav}>
          <button 
            className={`${styles.navButton} ${currentView === 'all' ? styles.active : ''}`}
            onClick={() => setCurrentView('all')}
          >
            Все пользователи ({users.length})
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button 
            onClick={() => setError('')} 
            className={styles.closeError}
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          Загрузка данных пользователей...
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className={styles.usersTableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={styles.userRow}>
                  <td>
                    <div className={styles.userName}>
                      {user.lastName} {user.firstName} {user.patronymic}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{formatPhone(user.phoneNumber)}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                      className={styles.roleSelect}
                    >
                      <option value="user">Клиент</option>
                      <option value="admin">Администратор компании</option>
                      <option value="manager">Менеджер по аренде</option>
                      <option value="support">Служба поддержки</option>
                    </select>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => handleEditUser(user)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === adminData.id}
                        title={user.id === adminData.id ? "Нельзя удалить себя" : "Удалить"}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className={styles.noUsers}>
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
        />
      )}
    </div>
  );
};

const EditUserModal = ({ user, onSave, onClose, getRoleDisplay, getStatusDisplay }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    patronymic: user?.patronymic || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || 'user'
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
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Редактирование пользователя
          </h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Фамилия *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Имя *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Отчество</label>
            <input
              type="text"
              name="patronymic"
              value={formData.patronymic}
              onChange={handleChange}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Телефон</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formatPhoneDisplay(formData.phoneNumber)}
              onChange={handlePhoneChange}
              placeholder="+7 (912) 345-67-89"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Роль</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="user">Клиент</option>
                <option value="admin">Администратор компании</option>
                <option value="manager">Менеджер по аренде</option>
                <option value="support">Служба поддержки</option>
              </select>
            </div>
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
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminComponent;