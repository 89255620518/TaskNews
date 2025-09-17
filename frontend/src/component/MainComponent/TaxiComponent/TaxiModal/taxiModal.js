import styles from './taxiModal.module.scss';
import {
    useState,
    useCallback,
    useEffect,
    useMemo

} from 'react';
import {
    FaTaxi,
    FaTimes,
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaComment,
    FaCheckCircle

} from 'react-icons/fa';
import { useAuth } from '../../../../useContext/AuthContext';
import { api } from '../../../../api/api';

const TaxiModal = ({ modalClose }) => {
    const { token } = useAuth();
    const initialFormData = useMemo(() => ({
        date: '',
        time: '',
        name: '',
        email: '',
        phone: '+7',
        address: '',
        comments: ''
    }), []);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePhoneChange = useCallback((value) => {
        let cleaned = value.replace(/[^\d+]/g, '');
        if (!cleaned.startsWith('+7')) {
            cleaned = '+7' + cleaned.replace(/^\+/, '');
        }
        return cleaned.substring(0, 12);
    }, []);

    const formatPhoneDisplay = useCallback((phone) => {
        if (!phone) return '+7';
        const digits = phone.replace(/\D/g, '').substring(1);

        if (!digits) return '+7';
        if (digits.length <= 3) return `+7 (${digits}`;
        if (digits.length <= 6) return `+7 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
        if (digits.length <= 8) return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
        return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }, []);

    const validateField = useCallback((name, value) => {
        switch (name) {
            case 'date':
                if (!value) return 'Пожалуйста, выберите дату';
                if (new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))) {
                    return 'Дата не может быть в прошлом';
                }
                return '';
            case 'time':
                if (!value) return 'Пожалуйста, выберите время';
                const [hours, minutes] = value.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes;
                if (totalMinutes >= 22 * 60 || totalMinutes < 11 * 60) {
                    return 'Мы работаем с 11:00 до 22:00';
                }
                return '';
            case 'name':
                return value.trim().length >= 2 ? '' : 'Минимум 2 символа';
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Введите корректный email';
            case 'phone':
                return value.length < 12 ? 'Некорректный номер' : '';
            case 'address':
                return value.trim().length >= 5 ? '' : 'Минимум 5 символов';
            default:
                return '';
        }
    }, []);

    useEffect(() => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key in errors || touched[key]) {
                newErrors[key] = validateField(key, formData[key]);
            }
        });
        setErrors(newErrors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, touched, validateField]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'phone' ? handlePhoneChange(value) : value
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const allTouched = {};
        Object.keys(formData).forEach(key => { allTouched[key] = true });
        setTouched(allTouched);

        const formErrors = {};
        let isValid = true;

        Object.keys(formData).forEach(key => {
            if (key !== 'comments') {
                const error = validateField(key, formData[key]);
                if (error) {
                    formErrors[key] = error;
                    isValid = false;
                }
            }
        });

        setErrors(formErrors);

        if (isValid) {
            try {
                const dataTaxi = {
                    date: formData.date,
                    time: formData.time,
                    first_name: formData.name,
                    email_user: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    comment: formData.comments || ''
                };

                await api.users.callTaxi(dataTaxi, token);
                setIsSuccess(true); // Показываем окно успеха
                // Автоматическое закрытие через 3 секунды
                setTimeout(() => {
                    modalClose();
                }, 3000);
            } catch (error) {
                console.error('Ошибка:', error);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setIsSubmitting(false);
        }
    };

    const getFieldClass = (fieldName) => {
        if (!touched[fieldName]) return styles.input;
        return errors[fieldName] ? styles.inputError : styles.inputValid;
    };

    if (isSuccess) {
        return (
            <div className={styles.successModal}>
                <div className={styles.successContent}>
                    <FaCheckCircle className={styles.successIcon} />
                    <h2 className={styles.successTitle}>Такси забронировано</h2>
                    <p className={styles.successText}>Администратор свяжется с вами для подтверждения</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
                <div className={styles.titleWrapper}>
                    <FaTaxi className={styles.taxiIcon} />
                    <h1 className={styles.title}>Заказ такси</h1>
                </div>
                <button className={styles.closeButton} onClick={modalClose}>
                    <FaTimes />
                </button>
            </div>

            <div className={styles.modalContent}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <div className={styles.inputWithIcon}>
                                <FaCalendarAlt className={styles.inputIcon} />
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={getFieldClass('date')}
                                    required
                                />
                            </div>
                            {touched.date && errors.date && (
                                <span className={styles.errorMessage}>{errors.date}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <div className={styles.inputWithIcon}>
                                <FaClock className={styles.inputIcon} />
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={getFieldClass('time')}
                                    required
                                    min="11:00"
                                    max="22:00"
                                />
                            </div>
                            {touched.time && errors.time && (
                                <span className={styles.errorMessage}>{errors.time}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <div className={styles.inputWithIcon}>
                            <FaUser className={styles.inputIcon} />
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
                                placeholder="Ваше имя"
                            />
                        </div>
                        {touched.name && errors.name && (
                            <span className={styles.errorMessage}>{errors.name}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <div className={styles.inputWithIcon}>
                            <FaEnvelope className={styles.inputIcon} />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('email')}
                                required
                                placeholder="Ваш email"
                            />
                        </div>
                        {touched.email && errors.email && (
                            <span className={styles.errorMessage}>{errors.email}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <div className={styles.inputWithIcon}>
                            <FaPhone className={styles.inputIcon} />
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formatPhoneDisplay(formData.phone)}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('phone')}
                                required
                                placeholder="+7 (XXX) XXX-XX-XX"
                            />
                        </div>
                        {touched.phone && errors.phone && (
                            <span className={styles.errorMessage}>{errors.phone}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <div className={styles.inputWithIcon}>
                            <FaMapMarkerAlt className={styles.inputIcon} />
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('address')}
                                required
                                minLength={5}
                                placeholder="Адрес подачи такси"
                            />
                        </div>
                        {touched.address && errors.address && (
                            <span className={styles.errorMessage}>{errors.address}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <div className={styles.inputWithIcon}>
                            <FaComment className={styles.inputIcon} />
                            <textarea
                                id="comments"
                                name="comments"
                                value={formData.comments}
                                onChange={handleChange}
                                className={styles.textarea}
                                rows={3}
                                placeholder="Дополнительные пожелания"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className={styles.buttonLoader}></span>
                        ) : (
                            'Вызвать такси'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default TaxiModal;