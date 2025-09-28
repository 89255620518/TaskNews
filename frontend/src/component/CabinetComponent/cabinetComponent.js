import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../useContext/AuthContext';
import { api } from '../../api/api';
import styles from './cabinet.module.scss';

const CabinetComponent = () => {
    const navigate = useNavigate();
    const { 
        token, 
        user,
        logout: authLogout, 
        updateProfile,
        isAuthenticated 
    } = useAuth();

    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        patronymic: '',
        phone: '',
        email: '',
        role: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

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
            'user': 'Клиент',
            'admin': 'Администратор компании',
            'manager': 'Менеджер по аренде',
            'support': 'Служба поддержки'
        };
        return roleMap[role] || role;
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
        if (!isAuthenticated || !token) {
            navigate('/login');
            return;
        }

        if (user) {
            setUserData({
                first_name: user.first_name || user.firstName || '',
                last_name: user.last_name || user.lastName || '',
                patronymic: user.patronymic || '',
                phone: user.phone || user.phone_number || user.phoneNumber || '',
                email: user.email || '',
                role: user.role || 'user'
            });
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await api.auth.getCurrentUser();

                console.log('Данные пользователя:', response);

                if (response.data && response.data.success) {
                    const userDataFromResponse = response.data.user || response.data;
                    
                    setUserData({
                        first_name: userDataFromResponse.first_name || userDataFromResponse.firstName || '',
                        last_name: userDataFromResponse.last_name || userDataFromResponse.lastName || '',
                        patronymic: userDataFromResponse.patronymic || '',
                        phone: userDataFromResponse.phone || userDataFromResponse.phone_number || userDataFromResponse.phoneNumber || '',
                        email: userDataFromResponse.email || '',
                        role: userDataFromResponse.role || 'user'
                    });
                } else {
                    setError(response.data?.message || 'Не удалось загрузить данные пользователя');
                }
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError(err.response?.data?.message || 'Не удалось загрузить данные пользователя');
                if (err.response?.status === 401) {
                    authLogout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, navigate, authLogout, isAuthenticated, user]);

    const handleSaveData = async () => {
        try {
            setSaveLoading(true);
            setError(null);

            const updateData = {
                firstName: userData.first_name,
                lastName: userData.last_name,
                patronymic: userData.patronymic,
                phoneNumber: userData.phone.replace(/\D/g, ''),
                email: userData.email
            };

            console.log('Отправляемые данные:', updateData);

            const response = await updateProfile(updateData);

            if (response.success) {
                setIsDataModalOpen(false);
                setError(null);
                
                console.log('Данные успешно обновлены в контексте');
            } else {
                setError(response.error || 'Не удалось сохранить изменения');
            }
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            setError(
                err.response?.data?.phone?.[0] ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.message ||
                'Не удалось сохранить изменения'
            );
        } finally {
            setSaveLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.auth.logout();
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
        
        if (user) {
            setUserData({
                first_name: user.first_name || user.firstName || '',
                last_name: user.last_name || user.lastName || '',
                patronymic: user.patronymic || '',
                phone: user.phone || user.phone_number || user.phoneNumber || '',
                email: user.email || '',
                role: user.role || 'user'
            });
        }
    };

    useEffect(() => {
        if (user && !isDataModalOpen) {
            setUserData({
                first_name: user.first_name || user.firstName || '',
                last_name: user.last_name || user.lastName || '',
                patronymic: user.patronymic || '',
                phone: user.phone || user.phone_number || user.phoneNumber || '',
                email: user.email || '',
                role: user.role || 'user'
            });
        }
    }, [user, isDataModalOpen]);

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
                                placeholder="+7 (XXX) XXX-XX-XX"
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
                                disabled={saveLoading}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSaveData}
                                className={styles.saveButton}
                                disabled={
                                    !userData.first_name || 
                                    !userData.last_name || 
                                    !userData.phone || 
                                    !userData.email ||
                                    saveLoading
                                }
                                type="button"
                            >
                                {saveLoading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CabinetComponent;