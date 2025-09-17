import styles from './login.module.scss';
import { useState, useCallback, useEffect } from 'react';
import fotoGif from '../img/font.gif';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { api } from '../../../api/api';
import { useAuth } from '../../../useContext/AuthContext'; // Импортируем контекст

const LoginComponent = () => {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [loginType, setLoginType] = useState('email');
    const [errors, setErrors] = useState({
        login: '',
        password: ''
    });
    const [touched, setTouched] = useState({
        login: false,
        password: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState('');

    // Обработчик изменения номера телефона с форматированием
    const handlePhoneChange = useCallback((value) => {
        let cleaned = value.replace(/[^\d+]/g, '');

        // Убедимся, что номер начинается с +7
        if (!cleaned.startsWith('+7')) {
            cleaned = '+7' + cleaned.replace(/^\+/, '');
        }

        // Ограничим длину номера
        if (cleaned.length > 12) {
            cleaned = cleaned.substring(0, 12);
        }

        return cleaned;
    }, []);

    // Форматирование номера телефона для отображения
    const formatPhoneDisplay = useCallback((phone) => {
        if (!phone) return '+7';
        const digits = phone.replace(/\D/g, '').substring(1);

        if (digits.length === 0) return '+7';
        if (digits.length <= 3) return `+7 (${digits}`;
        if (digits.length <= 6) return `+7 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
        if (digits.length <= 8) return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
        return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }, []);

    // Определяем тип логина (email или телефон)
    useEffect(() => {
        const isPhone = /^\+?[0-9\s\-()]+$/.test(formData.login);
        setLoginType(isPhone ? 'phone' : 'email');
    }, [formData.login]);

    const validate = useCallback(() => {
        const newErrors = {
            login: '',
            password: ''
        };

        if (!formData.login.trim()) {
            newErrors.login = loginType === 'email'
                ? 'Почта обязательна'
                : 'Телефон обязателен';
        } else if (loginType === 'email' && !/\S+@\S+\.\S+/.test(formData.login)) {
            newErrors.login = 'Некорректный формат почты';
        } else if (loginType === 'phone' && !/^\+7\d{10}$/.test(formData.login)) {
            newErrors.login = 'Некорректный формат телефона (требуется +7XXXXXXXXXX)';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).every(key => !newErrors[key]);
    }, [formData.login, formData.password, loginType]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        if (name === 'login' && loginType === 'phone') {
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

        setAuthError('');

        if (touched[name]) {
            validate();
        }
    }, [touched, validate, loginType, handlePhoneChange]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        validate();
    }, [validate]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setTouched({
            login: true,
            password: true
        });
        setAuthError('');

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const credentials = {
                [loginType === 'email' ? 'email' : 'phone']:
                    loginType === 'phone' ? formData.login.replace(/\D/g, '') : formData.login,
                password: formData.password
            };

            const response = await api.users.login(credentials);

            if (response.auth_token) {
                // Сохраняем токен через AuthContext вместо прямого сохранения в localStorage
                authLogin(response.auth_token);
                await api.users.getMe();
                navigate('/');
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            setAuthError(
                error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.detail ||
                'Неверные учетные данные. Пожалуйста, попробуйте снова.'
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, loginType, validate, navigate, authLogin]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getInputClass = (fieldName) => {
        return `${styles.input} ${touched[fieldName] && errors[fieldName]
            ? styles.errorInput
            : touched[fieldName]
                ? styles.validInput
                : ''
            }`;
    };

    // Получаем отображаемое значение для поля ввода
    const getDisplayValue = () => {
        return loginType === 'phone'
            ? formatPhoneDisplay(formData.login)
            : formData.login;
    };

    return (
        <div className={styles.containerLogin}>
            <img className={styles.backgroundImage} src={fotoGif} alt='Фон авторизации' />

            <div className={styles.loginCard}>
                <h2 className={styles.title}>Авторизация</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="login" className={styles.label}>
                            {loginType === 'email' ? 'Почта' : 'Телефон'}
                        </label>
                        <input
                            type={loginType === 'email' ? 'email' : 'tel'}
                            id="login"
                            name="login"
                            className={getInputClass('login')}
                            value={getDisplayValue()}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={
                                loginType === 'email'
                                    ? 'example@mail.com'
                                    : '+7 (999) 123-45-67'
                            }
                        />
                        {touched.login && errors.login && (
                            <span className={styles.errorText}>{errors.login}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Пароль</label>
                        <div className={styles.passwordInputContainer}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className={getInputClass('password')}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
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
                        {touched.password && errors.password && (
                            <span className={styles.errorText}>{errors.password}</span>
                        )}
                    </div>

                    {authError && (
                        <div className={styles.authError}>
                            {authError}
                        </div>
                    )}

                    <div className={styles.infoAuth}>
                        <p className={styles.infoAuth_text}>Еще нет аккаунта?</p>
                        <Link to='/register' className={styles.registerLink}>Зарегистрируйтесь</Link>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={
                            (Object.values(errors).some(Boolean) ||
                                isSubmitting
                            )}
                    >
                        {isSubmitting ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginComponent;