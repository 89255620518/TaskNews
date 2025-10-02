import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../../api/api';
import { useAuth } from '../../../../../useContext/AuthContext';
import EditUserModal from './EditUserModal';
import styles from '../../admin.module.scss';

const UsersManagement = () => {
  const { user: currentUser, logout: authLogout } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('all');

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
    } finally {
      setLoading(false);
    }
  }, [authLogout]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    switch (currentView) {
      case 'all':
        setFilteredUsers(users);
        break;
      case 'admins':
        setFilteredUsers(users.filter(user => user.role === 'admin'));
        break;
      case 'managers':
        setFilteredUsers(users.filter(user => user.role === 'manager'));
        break;
      case 'support':
        setFilteredUsers(users.filter(user => user.role === 'support'));
        break;
      case 'clients':
        setFilteredUsers(users.filter(user => user.role === 'user'));
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

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    support: users.filter(u => u.role === 'support').length,
    clients: users.filter(u => u.role === 'user').length
  };

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2>👥 Управление пользователями</h2>
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{userStats.total}</span>
            <span className={styles.statLabel}>Всего пользователей</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{userStats.clients}</span>
            <span className={styles.statLabel}>Клиентов</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{userStats.admins}</span>
            <span className={styles.statLabel}>Администраторов</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{userStats.managers}</span>
            <span className={styles.statLabel}>Менеджеров</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{userStats.support}</span>
            <span className={styles.statLabel}>Поддержка</span>
          </div>
        </div>

        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterButton} ${currentView === 'all' ? styles.active : ''}`}
            onClick={() => setCurrentView('all')}
          >
            Все ({userStats.total})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'admins' ? styles.active : ''}`}
            onClick={() => setCurrentView('admins')}
          >
            Администраторы ({userStats.admins})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'managers' ? styles.active : ''}`}
            onClick={() => setCurrentView('managers')}
          >
            Менеджеры ({userStats.managers})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'support' ? styles.active : ''}`}
            onClick={() => setCurrentView('support')}
          >
            Поддержка ({userStats.support})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'clients' ? styles.active : ''}`}
            onClick={() => setCurrentView('clients')}
          >
            Клиенты ({userStats.clients})
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
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
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
                <tr key={user.id} className={styles.dataRow}>
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
                        disabled={user.id === currentUser?.id}
                        title={user.id === currentUser?.id ? "Нельзя удалить себя" : "Удалить"}
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
        <div className={styles.noData}>
          {currentView === 'all' ? 'Нет пользователей' : 
           currentView === 'admins' ? 'Нет администраторов' :
           currentView === 'managers' ? 'Нет менеджеров' :
           currentView === 'support' ? 'Нет сотрудников поддержки' : 
           'Нет клиентов'}
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

export default UsersManagement;