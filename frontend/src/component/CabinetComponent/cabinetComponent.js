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
        phone: '',
        email: '',
        floor: '',
        intercom: '',
        comment: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);

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

                setUserData({
                    first_name: response.first_name || '',
                    last_name: response.last_name || '',
                    phone: response.phone || '',
                    email: response.email || '',
                    delivery_address: response.delivery_address || '',
                    floor: response.floor || '',
                    intercom: response.intercom || '',
                    comment: response.comment || ''
                });
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные пользователя');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, navigate]);

    const handleSaveData = async () => {
        try {
            await api.users.updateMe(userData);
            setIsDataModalOpen(false);
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            setError(err.response?.data?.phone?.[0] ||
                err.response?.data?.email?.[0] ||
                'Не удалось сохранить изменения');
        }
    };

    const handleLogout = () => {
        authLogout();
        navigate('/');
    };


    return (
        <div className={styles.containerCabinet}>
            <div className={styles.profileHeader}>
                <h2>{userData.first_name} {userData.last_name}</h2>
                <p>{userData.email}</p>
                <p>{formatPhoneDisplay(userData.phone)}</p>
            </div>

            <div className={styles.menu}>
                <button onClick={() => setIsDataModalOpen(true)} className={styles.menuButton}>
                    <span className={styles.icon}>🤵</span>
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

                        <div className={styles.formGroup}>
                            <label>Имя *</label>
                            <input
                                type="text"
                                name="first_name"
                                value={userData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Фамилия</label>
                            <input
                                type="text"
                                name="last_name"
                                value={userData.last_name}
                                onChange={handleChange}
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
                            />
                        </div>

                        <div className={styles.modalButtons}>
                            <button
                                onClick={() => setIsDataModalOpen(false)}
                                className={styles.cancelButton}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSaveData}
                                className={styles.saveButton}
                                disabled={!userData.first_name || !userData.phone}
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