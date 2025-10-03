import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../useContext/AuthContext';
import { api } from '../../../api/api';
import styles from './cabinet.module.scss';

const CabinetComponent = () => {
    const navigate = useNavigate();
    const { 
        token, 
        user,
        logout: authLogout, 
        updateProfile,
        isAuthenticated,
        hasRole
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
    const [activeSection, setActiveSection] = useState('rentals');

    const [rentals, setRentals] = useState([]);
    const [payments, setPayments] = useState([]);
    const [documents, setDocuments] = useState([]);

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

    const loadMockData = useCallback(() => {
        const mockRentals = [
            {
                id: 1,
                property: 'Квартира в центре',
                address: 'г. Москва, ул. Тверская, д. 10, кв. 25',
                period: '12 месяцев',
                startDate: '2024-01-15',
                endDate: '2025-01-14',
                monthlyRent: 50000,
                status: 'active',
                nextPayment: '2024-02-15'
            },
            {
                id: 2,
                property: 'Апартаменты премиум',
                address: 'г. Москва, Пресненская наб., д. 8',
                period: '6 месяцев',
                startDate: '2023-11-01',
                endDate: '2024-04-30',
                monthlyRent: 75000,
                status: 'completed',
                nextPayment: null
            }
        ];

        const mockPayments = [
            {
                id: 1,
                date: '2024-01-15',
                amount: 50000,
                type: 'арендная плата',
                status: 'оплачен',
                rentalId: 1
            },
            {
                id: 2,
                date: '2023-12-15',
                amount: 50000,
                type: 'арендная плата',
                status: 'оплачен',
                rentalId: 1
            },
            {
                id: 3,
                date: '2024-02-15',
                amount: 50000,
                type: 'арендная плата',
                status: 'ожидает оплаты',
                rentalId: 1
            }
        ];

        const mockDocuments = [
            {
                id: 1,
                name: 'Договор аренды',
                type: 'договор',
                date: '2024-01-10',
                size: '2.4 МБ',
                url: '#'
            },
            {
                id: 2,
                name: 'Акт приема-передачи',
                type: 'акт',
                date: '2024-01-15',
                size: '1.8 МБ',
                url: '#'
            },
            {
                id: 3,
                name: 'Квитанция об оплате',
                type: 'квитанция',
                date: '2024-01-15',
                size: '0.8 МБ',
                url: '#'
            }
        ];

        setRentals(mockRentals);
        setPayments(mockPayments);
        setDocuments(mockDocuments);
    }, []);

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
            
            if (hasRole('user')) {
                loadMockData();
            }
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

                    if (userDataFromResponse.role === 'user') {
                        loadMockData();
                    }
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
    }, [token, navigate, authLogout, isAuthenticated, user, hasRole, loadMockData]);

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

    const renderRentalsSection = () => (
        <div className={styles.sectionContent}>
            <h3>Моя аренда</h3>
            {rentals.length === 0 ? (
                <div className={styles.noData}>
                    <p>У вас нет активной аренды</p>
                    <button className={styles.primaryButton}>Найти объект для аренды</button>
                </div>
            ) : (
                <div className={styles.rentalsList}>
                    {rentals.map(rental => (
                        <div key={rental.id} className={styles.rentalCard}>
                            <div className={styles.rentalHeader}>
                                <h4>{rental.property}</h4>
                                <span className={`${styles.status} ${styles[rental.status]}`}>
                                    {rental.status === 'active' ? 'Активна' : 'Завершена'}
                                </span>
                            </div>
                            <div className={styles.rentalInfo}>
                                <p><strong>Адрес:</strong> {rental.address}</p>
                                <p><strong>Период аренды:</strong> {rental.period}</p>
                                <p><strong>Дата начала:</strong> {new Date(rental.startDate).toLocaleDateString('ru-RU')}</p>
                                <p><strong>Дата окончания:</strong> {new Date(rental.endDate).toLocaleDateString('ru-RU')}</p>
                                <p><strong>Ежемесячная плата:</strong> {rental.monthlyRent.toLocaleString('ru-RU')} ₽</p>
                                {rental.nextPayment && (
                                    <p><strong>Следующий платеж:</strong> {new Date(rental.nextPayment).toLocaleDateString('ru-RU')}</p>
                                )}
                            </div>
                            <div className={styles.rentalActions}>
                                <button className={styles.secondaryButton}>Детали</button>
                                {rental.status === 'active' && (
                                    <button className={styles.primaryButton}>Оплатить</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderPaymentsSection = () => (
        <div className={styles.sectionContent}>
            <h3>Платежи</h3>
            {payments.length === 0 ? (
                <div className={styles.noData}>
                    <p>Платежи не найдены</p>
                </div>
            ) : (
                <div className={styles.paymentsList}>
                    <div className={styles.paymentsHeader}>
                        <span>Дата</span>
                        <span>Сумма</span>
                        <span>Тип</span>
                        <span>Статус</span>
                        <span>Действия</span>
                    </div>
                    {payments.map(payment => (
                        <div key={payment.id} className={styles.paymentItem}>
                            <span>{new Date(payment.date).toLocaleDateString('ru-RU')}</span>
                            <span>{payment.amount.toLocaleString('ru-RU')} ₽</span>
                            <span>{payment.type}</span>
                            <span className={`${styles.paymentStatus} ${styles[payment.status]}`}>
                                {payment.status}
                            </span>
                            <div className={styles.paymentActions}>
                                {payment.status === 'ожидает оплаты' ? (
                                    <button className={styles.primaryButton}>Оплатить</button>
                                ) : (
                                    <button className={styles.secondaryButton}>Квитанция</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderDocumentsSection = () => (
        <div className={styles.sectionContent}>
            <h3>Документы</h3>
            {documents.length === 0 ? (
                <div className={styles.noData}>
                    <p>Документы не найдены</p>
                </div>
            ) : (
                <div className={styles.documentsList}>
                    {documents.map(doc => (
                        <div key={doc.id} className={styles.documentItem}>
                            <div className={styles.documentIcon}>📄</div>
                            <div className={styles.documentInfo}>
                                <h5>{doc.name}</h5>
                                <p>Тип: {doc.type} • {new Date(doc.date).toLocaleDateString('ru-RU')} • {doc.size}</p>
                            </div>
                            <div className={styles.documentActions}>
                                <button className={styles.primaryButton}>Скачать</button>
                                <button className={styles.secondaryButton}>Просмотреть</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderUserCabinet = () => (
        <div className={styles.userCabinet}>
            <div className={styles.profileHeader}>
                <h2>{userData.last_name} {userData.first_name} {userData.patronymic}</h2>
                <p><strong>Телефон:</strong> {formatPhoneDisplay(userData.phone)}</p>
                <p><strong>Почта:</strong> {userData.email}</p>
                <p><strong>Роль:</strong> {getRoleDisplay(userData.role)}</p>
            </div>

            <div className={styles.cabinetNavigation}>
                <button 
                    className={`${styles.navButton} ${activeSection === 'rentals' ? styles.active : ''}`}
                    onClick={() => setActiveSection('rentals')}
                >
                    🏠 Моя аренда
                </button>
                <button 
                    className={`${styles.navButton} ${activeSection === 'payments' ? styles.active : ''}`}
                    onClick={() => setActiveSection('payments')}
                >
                    💰 Платежи
                </button>
                <button 
                    className={`${styles.navButton} ${activeSection === 'documents' ? styles.active : ''}`}
                    onClick={() => setActiveSection('documents')}
                >
                    📄 Документы
                </button>
                <button 
                    className={styles.navButton}
                    onClick={() => setIsDataModalOpen(true)}
                >
                    ⚙️ Редактировать профиль
                </button>
            </div>

            <div className={styles.cabinetContent}>
                {activeSection === 'rentals' && renderRentalsSection()}
                {activeSection === 'payments' && renderPaymentsSection()}
                {activeSection === 'documents' && renderDocumentsSection()}
            </div>

            <div className={styles.logoutSection}>
                <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                >
                    🚪 Выйти из аккаунта
                </button>
            </div>
        </div>
    );

    const renderSimpleCabinet = () => (
        <div className={styles.simpleCabinet}>
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
        </div>
    );

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
            {hasRole('user') ? renderUserCabinet() : renderSimpleCabinet()}

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