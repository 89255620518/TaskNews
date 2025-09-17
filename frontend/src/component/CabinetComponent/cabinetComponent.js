import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../useContext/AuthContext';
import { api } from '../../api/api';
import styles from './cabinet.module.scss';

const CabinetComponent = () => {
    const navigate = useNavigate();
    const { token, logout: authLogout } = useAuth();

    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        patronymic: '',
        phone: '',
        email: '',
        role: '',
        status: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);

    const handlePhoneChange = useCallback((value) => {
        let cleaned = value.replace(/[^\d+]/g, '');
        if (!cleaned.startsWith('+7')) {
            cleaned = '+7' + cleaned.replace(/^\+/, '');
        }
        if (cleaned.length > 12) {
            cleaned = cleaned.substring(0, 12);
        }
        return cleaned;
    }, []);

    const formatPhoneDisplay = useCallback((phone) => {
        if (!phone) return '+7';
        const digits = phone.replace(/\D/g, '').substring(1);
        if (digits.length === 0) return '+7';
        if (digits.length <= 3) return `+7 (${digits}`;
        if (digits.length <= 6) return `+7 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
        if (digits.length <= 8) return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
        return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }, []);

    // Функция для преобразования роли
    const getRoleDisplay = useCallback((role) => {
        const roleMap = {
            'user': 'Пользователь',
            'admin': 'Администратор',
            'moderator': 'Модератор'
        };
        return roleMap[role] || role;
    }, []);

    // Функция для преобразования статуса
    const getStatusDisplay = useCallback((status) => {
        const statusMap = {
            'active': 'Активен',
            'inactive': 'Неактивен'
        };
        return statusMap[status] || status;
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const formattedPhone = handlePhoneChange(value);
            setUserData(prev => ({
                ...prev,
                [name]: formattedPhone
            }));
        } else {
            setUserData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }, [handlePhoneChange]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await api.users.getMe();

                console.log(response, 'resp');

                if (response.success) {
                    const userDataFromResponse = response.user || response;
                    
                    setUserData({
                        first_name: userDataFromResponse.first_name || userDataFromResponse.firstName || '',
                        last_name: userDataFromResponse.last_name || userDataFromResponse.lastName || '',
                        patronymic: userDataFromResponse.patronymic || '',
                        phone: userDataFromResponse.phone || userDataFromResponse.phone_number || userDataFromResponse.phoneNumber || '',
                        email: userDataFromResponse.email || '',
                        role: userDataFromResponse.role || 'user',
                        status: userDataFromResponse.status || 'active'
                    });
                } else {
                    setError(response.message || 'Не удалось загрузить данные пользователя');
                }
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные пользователя');
                if (err.response?.status === 401) {
                    authLogout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, navigate, authLogout]);

    const handleSaveData = async () => {
        try {
            const updateData = {
                firstName: userData.first_name,
                lastName: userData.last_name,
                patronymic: userData.patronymic,
                phoneNumber: userData.phone.replace(/\D/g, ''),
                email: userData.email
            };

            const response = await api.users.updateMe(updateData);
            console.log(response, 'upt')

            if (response.success) {
                setIsDataModalOpen(false);
                setError(null);
                // Обновляем данные после успешного сохранения
                const updatedResponse = await api.users.getMe();
                if (updatedResponse.success) {
                    const updatedData = updatedResponse.user || updatedResponse;
                    setUserData(prev => ({
                        ...prev,
                        first_name: updatedData.first_name || updatedData.firstName || prev.first_name,
                        last_name: updatedData.last_name || updatedData.lastName || prev.last_name,
                        patronymic: updatedData.patronymic || prev.patronymic,
                        phone: updatedData.phone || updatedData.phone_number || updatedData.phoneNumber || prev.phone,
                        email: updatedData.email || prev.email
                    }));
                }
            } else {
                setError(response.message || 'Не удалось сохранить изменения');
            }
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            setError(
                err.response?.data?.phone?.[0] ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.message ||
                'Не удалось сохранить изменения'
            );
        }
    };

    const handleLogout = async () => {
        try {
            await api.users.logout();
        } catch (err) {
            console.error('Ошибка при выходе:', err);
        } finally {
            authLogout();
            navigate('/');
        }
    };

    const handleModalClose = () => {
        setIsDataModalOpen(false);
        setError(null);
    };

    if (loading) {
        return (
            <div className={styles.containerCabinet}>
                <div className={styles.loading}>Загрузка...</div>
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className={styles.containerCabinet}>
                <div className={styles.error}>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className={styles.retryButton}>
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.containerCabinet}>
            <div className={styles.profileHeader}>
                <h2>{userData.last_name} {userData.first_name} {userData.patronymic}</h2>
                <p><strong>Телефон:</strong> {formatPhoneDisplay(userData.phone)}</p>
                <p><strong>Почта:</strong> {userData.email}</p>
                <p><strong>Роль:</strong> {getRoleDisplay(userData.role)}</p>
                <p><strong>Статус:</strong> {getStatusDisplay(userData.status)}</p>
            </div>

            <div className={styles.menu}>
                <button 
                    onClick={() => setIsDataModalOpen(true)} 
                    className={styles.menuButton}
                >
                    <span className={styles.icon}>✏️</span>
                    <span>Редактировать профиль</span>
                </button>

                <button
                    onClick={handleLogout}
                    className={`${styles.menuButton} ${styles.logoutButton}`}
                >
                    <span className={styles.icon}>🚪</span>
                    <span>Выйти</span>
                </button>
            </div>

            {isDataModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Редактирование профиля</h3>
                        
                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Фамилия *</label>
                            <input
                                type="text"
                                name="last_name"
                                value={userData.last_name}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Имя *</label>
                            <input
                                type="text"
                                name="first_name"
                                value={userData.first_name}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Отчество</label>
                            <input
                                type="text"
                                name="patronymic"
                                value={userData.patronymic}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Телефон *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formatPhoneDisplay(userData.phone)}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Почта *</label>
                            <input
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.modalButtons}>
                            <button
                                onClick={handleModalClose}
                                className={styles.cancelButton}
                                type="button"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSaveData}
                                className={styles.saveButton}
                                disabled={!userData.first_name || !userData.last_name || !userData.phone || !userData.email}
                                type="button"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CabinetComponent;