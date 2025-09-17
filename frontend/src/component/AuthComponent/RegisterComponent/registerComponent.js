import styles from './register.module.scss';
import { useState, useEffect, useCallback } from 'react';
import fotoGif from '../img/font.gif';
import { Link } from 'react-router-dom';
import RegisterModal from '../RegisterModal/registerModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/api'

const RegisterComponent = () => {
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '+7'
    });
    const navigate = useNavigate();

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

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const formattedPhone = handlePhoneChange(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedPhone
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }, [handlePhoneChange]);

    const formatPhoneDisplay = useCallback((phone) => {
        if (!phone) return '+7';
        const digits = phone.replace(/\D/g, '').substring(1);
        if (digits.length === 0) return '+7';
        if (digits.length <= 3) return `+7 (${digits}`;
        if (digits.length <= 6) return `+7 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
        if (digits.length <= 8) return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
        return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }, []);

    const validate = useCallback(() => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Имя обязательно';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Фамилия обязательна';
        }

        if (!formData.phone || formData.phone.length < 12) {
            newErrors.phone = 'Введите корректный номер телефона';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Почта обязательна';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный формат почты';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    useEffect(() => {
        if (formData.password && formData.confirmPassword) {
            if (formData.password !== formData.confirmPassword) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Пароли не совпадают'
                }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.confirmPassword;
                    return newErrors;
                });
            }
        }
    }, [formData.password, formData.confirmPassword]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                re_password: formData.confirmPassword,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone.startsWith('7')
                    ? `+7${formData.phone.slice(1)}`
                    : formData.phone
            };

            console.log('Отправка данных:', userData);

            // Вызов API (аналогично вашему рабочему примеру)
            const response = await api.users.register(userData);

            // Обработка успешной регистрации
            setIsSuccess(true);
            console.log('Токен:', response.auth_token); // Проверьте структуру ответа

            // Сохранение токена (если нужно)
            if (response.auth_token) {
                localStorage.setItem('auth_token', response.auth_token);
            }

            // Перенаправление или закрытие модального окна
            setTimeout(() => navigate('/login'), 3000);

        } catch (error) {
            console.error('Полная ошибка регистрации:', error);

            // Обрабатываем ошибку
            const apiErrors = error.response?.data || {};
            console.log('Детали ошибки от сервера:', apiErrors);

            const formErrors = {};

            // Обработка ошибок email
            if (apiErrors.email) {
                formErrors.email = Array.isArray(apiErrors.email)
                    ? apiErrors.email.join(' ')
                    : apiErrors.email;
            } else if (apiErrors.email && apiErrors.email.includes('уже существует')) {
                formErrors.email = 'Пользователь с таким email уже зарегистрирован';
            }

            // Обработка ошибок телефона
            if (apiErrors.phone) {
                formErrors.phone = Array.isArray(apiErrors.phone)
                    ? apiErrors.phone.join(' ')
                    : apiErrors.phone;
            } else if (apiErrors.phone && apiErrors.phone.includes('уже существует')) {
                formErrors.phone = 'Этот номер телефона уже используется';
            }

            // Общие ошибки
            if (apiErrors.non_field_errors) {
                formErrors.general = Array.isArray(apiErrors.non_field_errors)
                    ? apiErrors.non_field_errors.join(' ')
                    : apiErrors.non_field_errors;
            }

            // Если не получили конкретных ошибок от сервера
            if (Object.keys(formErrors).length === 0) {
                formErrors.general = 'Произошла ошибка при регистрации. Пожалуйста, проверьте введенные данные.';
            }

            setErrors(formErrors);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validate, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className={styles.containerRegister}>
            <img className={styles.backgroundImage} src={fotoGif} alt='Фон регистрации' />

            <div className={styles.registerCard}>
                <h2 className={styles.title}>Регистрация</h2>
                {errors.general && (
                    <div className={styles.errorGeneral}>
                        {errors.general}
                    </div>
                )}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.twoColumns}>
                        <div className={styles.column}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>Почта*</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@mail.com"
                                />
                                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password" className={styles.label}>Пароль*</label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Не менее 6 символов"
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword" className={styles.label}>Подтверждение пароля*</label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className={`${styles.input} ${errors.confirmPassword ? styles.errorInput : ''}`}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Повторите пароль"
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={toggleConfirmPasswordVisibility}
                                        aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span className={styles.errorText}>{errors.confirmPassword}</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.column}>
                            <div className={styles.formGroup}>
                                <label htmlFor="firstName" className={styles.label}>Имя*</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className={`${styles.input} ${errors.firstName ? styles.errorInput : ''}`}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Ваше имя"
                                />
                                {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="lastName" className={styles.label}>Фамилия*</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    className={`${styles.input} ${errors.lastName ? styles.errorInput : ''}`}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Ваша фамилия"
                                />
                                {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phone" className={styles.label}>Телефон*</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className={`${styles.input} ${errors.phone ? styles.errorInput : ''}`}
                                    value={formatPhoneDisplay(formData.phone)}
                                    onChange={handleChange}
                                    onBlur={() => {
                                        if (formData.phone.length < 12) {
                                            setErrors(prev => ({
                                                ...prev,
                                                phone: 'Введите корректный номер телефона'
                                            }));
                                        }
                                    }}
                                    placeholder="+7 (___) ___-__-__"
                                />
                                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoAuth}>
                        <p className={styles.infoAuth_text}>Уже есть аккаунт?</p>
                        <Link to='/login' className={styles.loginLink}>Войти</Link>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className={styles.spinner} /> Регистрация...
                            </>
                        ) : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>

            {isSuccess && <RegisterModal />}
        </div>
    );
};

export default RegisterComponent;