import styles from './reserveTable.module.scss';
import { useState, useEffect, useCallback } from 'react';
import Zal from './Zal/zal';
import Veranda from './Veranda/veranda';
import ReserveModal from '../ReserveModal/reserveModal';
import { api } from '../../../../api/api';
import { useAuth } from '../../../../useContext/AuthContext';
import { Link } from 'react-router-dom';

const ReserveTable = ({ tableRef }) => {
    const { token } = useAuth();
    const [currentModal, setCurrentModal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [authMessage, setAuthMessage] = useState('');
    const [formData, setFormData] = useState({
        room_type: '',
        table_number: '',
        date: '',
        time: '',
        date_time: '',
        num_people: '',
        name: '',
        email: '',
        phone: '+7',
        comment: ''
    });

    const [errors, setErrors] = useState({
        room_type: '',
        table_number: '',
        date_time: '',
        num_people: '',
        name: '',
        email: '',
        phone: '+7'
    });

    const [touched, setTouched] = useState({
        room_type: false,
        table_number: false,
        date_time: false,
        num_people: false,
        name: false,
        phone: false,
        email: false
    });

    const handleTableSelect = useCallback((tableNumber) => {
        setFormData(prev => ({
            ...prev,
            table_number: tableNumber
        }));
        setTouched(prev => ({
            ...prev,
            table_number: true
        }));
    }, []);

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

    const validatePhone = useCallback((phone) => {
        if (!phone) return 'Пожалуйста, введите телефон';
        if (phone.length < 12) return 'Некорректный номер телефона';
        return '';
    }, []);

    const validateField = (name, value) => {
        switch (name) {
            case 'room_type':
                return value ? '' : 'Пожалуйста, выберите зал';
            case 'table_number':
                return value ? '' : 'Пожалуйста, выберите стол';
            case 'date_time':
                if (!formData.date || !formData.time) return 'Пожалуйста, выберите дату и время';
                
                const [year, month, day] = formData.date.split('-').map(Number);
                const [hours, minutes] = formData.time.split(':').map(Number);
                const selectedDate = new Date(year, month - 1, day, hours, minutes);

                if (selectedDate < new Date()) {
                    return 'Дата и время не могут быть в прошлом';
                }

                const totalMinutes = hours * 60 + minutes;
                if (totalMinutes >= 22 * 60 || totalMinutes < 11 * 60) {
                    return 'Заведение работает с 11:00 до 22:00';
                }
                return '';
            case 'name':
                return value.trim().length >= 2 ? '' : 'Имя должно содержать минимум 2 символа';
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Пожалуйста, введите корректный email';
            case 'phone':
                return validatePhone(value);
            case 'num_people':
                if (!value) return 'Пожалуйста, укажите количество гостей';
                const num = Number(value);
                return num >= 1 && num <= 30 ? '' : 'Введите число от 1 до 30';
            default:
                return '';
        }
    };

    useEffect(() => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key in errors) {
                newErrors[key] = validateField(key, formData[key]);
            }
        });
        setErrors(newErrors);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const formattedPhone = handlePhoneChange(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedPhone
            }));
        }
        else if (name === 'date' || name === 'time') {
            const newFormData = {
                ...formData,
                [name]: value
            };

            if (newFormData.date && newFormData.time) {
                newFormData.date_time = `${newFormData.date} ${newFormData.time}:00`;
            } else {
                newFormData.date_time = '';
            }

            setFormData(newFormData);
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (name === 'room_type') {
            setFormData(prev => ({ ...prev, table_number: '' }));
            if (value === 'hall') {
                setCurrentModal('zal');
                setIsModalOpen(true);
            } else if (value === 'veranda') {
                setCurrentModal('veranda');
                setIsModalOpen(true);
            } else {
                setIsModalOpen(false);
                setCurrentModal(null);
            }
        }
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentModal(null);
    }, []);

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const resetForm = useCallback(() => {
        setFormData({
            room_type: '',
            table_number: '',
            date: '',
            time: '',
            date_time: '',
            num_people: '',
            name: '',
            email: '',
            phone: '+7',
            comment: ''
        });
        setTouched({
            room_type: false,
            table_number: false,
            date_time: false,
            num_people: false,
            name: false,
            phone: false,
            email: false
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!token) {
            setAuthMessage('Для бронирования стола необходимо авторизоваться');
            setIsSubmitting(false);
            return;
        } else {
            setAuthMessage('');
        }

        const newTouched = {};
        Object.keys(touched).forEach(key => {
            newTouched[key] = true;
        });
        setTouched(newTouched);

        const hasErrors = Object.values(errors).some(error => error !== '');
        if (hasErrors) {
            setIsSubmitting(false);
            return;
        }

        try {
            const reservationData = {
                room_type: formData.room_type,
                table_number: formData.table_number,
                date_time: formData.date_time,
                num_people: Number(formData.num_people),
                name: formData.name,
                email: formData.email.trim(),
                phone: formData.phone,
                comment: formData.comment || ''
            };

            await api.goods.createReservation(reservationData, token);

            setIsSuccess(true);
            resetForm();

            setTimeout(() => {
                setIsSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Ошибка при бронировании:', error);
            if (error.response) {
                console.error('Детали ошибки:', error.response.data);
                alert(`Ошибка бронирования: ${error.response.data.message || error.response.data.error || 'Неизвестная ошибка'}`);
            } else {
                alert('Произошла ошибка при бронировании. Пожалуйста, попробуйте позже.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldClass = (fieldName) => {
        if (!touched[fieldName]) return styles.input;
        return errors[fieldName] ? styles.inputError : styles.inputValid;
    };

    return (
        <div className={styles.containerReserveTable} ref={tableRef}>
            <h1 className={styles.title}>Резерв стола</h1>
            <div className={styles.content}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="room_type" className={styles.label}>Зал / Веранда: *</label>
                        <select
                            id="room_type"
                            name="room_type"
                            value={formData.room_type}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getFieldClass('room_type')}
                            required
                        >
                            <option value="">Выберите</option>
                            <option value="hall">Зал</option>
                            <option value="veranda">Веранда</option>
                        </select>
                        {touched.room_type && errors.room_type && (
                            <span className={styles.errorMessage}>{errors.room_type}</span>
                        )}
                    </div>

                    {formData.room_type && (
                        <div className={styles.formGroup}>
                            <label htmlFor="table_number" className={styles.label}>Выбранный стол: *</label>
                            <input
                                type="text"
                                id="table_number"
                                name="table_number"
                                value={formData.table_number ? `Стол №${formData.table_number}` : ''}
                                readOnly
                                onClick={() => {
                                    if (formData.room_type === 'hall') {
                                        setCurrentModal('zal');
                                        setIsModalOpen(true);
                                    } else if (formData.room_type === 'veranda') {
                                        setCurrentModal('veranda');
                                        setIsModalOpen(true);
                                    }
                                }}
                                onBlur={handleBlur}
                                className={getFieldClass('table_number')}
                                required
                            />
                            {touched.table_number && errors.table_number && (
                                <span className={styles.errorMessage}>{errors.table_number}</span>
                            )}
                        </div>
                    )}

                    <div className={styles.row}>
                        <div className={`${styles.formGroup} ${styles.half}`}>
                            <label htmlFor="date" className={styles.label}>Дата: *</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('date_time')}
                                required
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.half}`}>
                            <label htmlFor="time" className={styles.label}>Время: *</label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('date_time')}
                                required
                                min="11:00"
                                max="22:00"
                            />
                        </div>
                        {touched.date_time && errors.date_time && (
                            <span className={styles.errorMessage}>{errors.date_time}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>Имя: *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getFieldClass('name')}
                            required
                            minLength={2}
                        />
                        {touched.name && errors.name && (
                            <span className={styles.errorMessage}>{errors.name}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Почта: *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getFieldClass('email')}
                            required
                        />
                        {touched.email && errors.email && (
                            <span className={styles.errorMessage}>{errors.email}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone" className={styles.label}>Телефон: *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formatPhoneDisplay(formData.phone)}
                            onChange={handleChange}
                            onBlur={(e) => {
                                handleBlur(e);
                                if (formData.phone.length < 12) {
                                    setErrors(prev => ({
                                        ...prev,
                                        phone: 'Введите корректный номер телефона (+7 XXX XXX XX XX)'
                                    }));
                                }
                            }}
                            className={getFieldClass('phone')}
                            required
                            placeholder="+7 (XXX) XXX-XX-XX"
                        />
                        {touched.phone && errors.phone && (
                            <span className={styles.errorMessage}>{errors.phone}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="num_people" className={styles.label}>Число гостей (1-30): *</label>
                        <input
                            type="number"
                            id="num_people"
                            name="num_people"
                            min="1"
                            max="30"
                            value={formData.num_people}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getFieldClass('num_people')}
                            required
                        />
                        {touched.num_people && errors.num_people && (
                            <span className={styles.errorMessage}>{errors.num_people}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="comment" className={styles.label}>Комментарии:</label>
                        <textarea
                            id="comment"
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            className={styles.textarea}
                            rows={3}
                        />
                    </div>

                    {authMessage && (
                        <div className={styles.authMessage}>
                            {authMessage}
                            <Link to="/login" className={styles.authLink}>Войти</Link>
                            <span> или </span>
                            <Link to="/register" className={styles.authLink}>Зарегистрироваться</Link>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Отправка...' : 'Забронировать'}
                    </button>
                </form>
            </div>

            {isModalOpen && currentModal === 'zal' && (
                <Zal closeModal={closeModal} handler={handleTableSelect} />
            )}

            {isModalOpen && currentModal === 'veranda' && (
                <Veranda closeModal={closeModal} handler={handleTableSelect} />
            )}

            {isSuccess && <ReserveModal />}
        </div>
    )
}

export default ReserveTable;