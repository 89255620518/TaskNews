import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './header.module.scss';
import { useState, useEffect } from 'react';
import { useAuth } from '../../useContext/AuthContext';

const Header = ({
    modalOpen,
    modalClosed,
    isModalOpen,
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
    const { 
        token, 
        user, 
        isAuthenticated, 
        isAdmin, 
        logout 
    } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1000);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const displayMobile = isMobile;

    const handleAdminClick = () => {
        modalClosed();
        navigate('/admin');
    };

    const handleLoginClick = () => {
        modalClosed();
        navigate('/login');
    };

    const handleLogoutClick = () => {
        modalClosed();
        logout();
        navigate('/');
    };

    const handleCabinetClick = () => {
        modalClosed();
        navigate('/cabinet');
    };

    const handleHomeClick = () => {
        modalClosed();
        navigate('/');
    };

    // Проверяем, является ли пользователь администратором
    const userIsAdmin = isAdmin();

    return (
        <div className={`${styles.containerHeader} ${styles.webAppHeader}`}>
            <div className={styles.headerContent}>
                {displayMobile ? (
                    <>
                        <button
                            className={`${styles.burgerButton} ${isModalOpen ? styles.open : ''}`}
                            onClick={isModalOpen ? modalClosed : modalOpen}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        {isModalOpen && (
                            <div className={styles.mobileMenu}>
                                <div className={styles.mobileMenuContent}>
                                    <Link 
                                        to={'/'} 
                                        onClick={handleHomeClick}
                                        className={location.pathname === '/' ? styles.active : ''}
                                    >
                                        <span>Главная</span>
                                    </Link>
                                    
                                    {isAuthenticated && user && (
                                        <Link 
                                            to="/cabinet" 
                                            onClick={handleCabinetClick}
                                            className={location.pathname === '/cabinet' ? styles.active : ''}
                                        >
                                            <span>Кабинет</span>
                                        </Link>
                                    )}
                                    
                                    {isAuthenticated && userIsAdmin && (
                                        <Link 
                                            to="/admin" 
                                            onClick={handleAdminClick}
                                            className={location.pathname === '/admin' ? styles.active : ''}
                                        >
                                            <span>Админ</span>
                                        </Link>
                                    )}
                                    
                                    {isAuthenticated ? (
                                        <button 
                                            onClick={handleLogoutClick}
                                            className={styles.logoutButton}
                                        >
                                            <span>Выйти</span>
                                        </button>
                                    ) : (
                                        <Link 
                                            to="/login" 
                                            onClick={handleLoginClick}
                                            className={location.pathname === '/login' ? styles.active : ''}
                                        >
                                            <span>Войти</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.mobileAuthSection}>
                            {isAuthenticated && userIsAdmin && (
                                <Link 
                                    to="/admin" 
                                    onClick={handleAdminClick}
                                    className={`${styles.authButton} ${location.pathname === '/admin' ? styles.active : ''}`}
                                >
                                    Админ
                                </Link>
                            )}
                            
                            {isAuthenticated ? (
                                <div className={styles.userInfoMobile}>
                                    <span className={styles.userName}>
                                        {user.firstName || user.first_name} {user.lastName || user.last_name}
                                    </span>
                                    <button 
                                        onClick={handleLogoutClick}
                                        className={styles.logoutButtonMobile}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            ) : (
                                <Link 
                                    to="/login" 
                                    onClick={handleLoginClick}
                                    className={`${styles.authButton} ${location.pathname === '/login' ? styles.active : ''}`}
                                >
                                    Войти
                                </Link>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.desktopMenu}>
                        <div className={styles.buttonLinks}>
                            <Link 
                                to={'/'} 
                                onClick={handleHomeClick}
                                className={location.pathname === '/' ? styles.active : ''}
                            >
                                <span>Главная</span>
                            </Link>
                            
                            {isAuthenticated && user && (
                                <Link 
                                    to="/cabinet" 
                                    onClick={handleCabinetClick}
                                    className={location.pathname === '/cabinet' ? styles.active : ''}
                                >
                                    <span>Кабинет</span>
                                </Link>
                            )}
                        </div>

                        <div className={styles.cartCabinet}>
                            {isAuthenticated ? (
                                <div className={styles.userSection}>
                                    <div className={styles.userInfo}>
                                        <span className={styles.userName}>
                                            {user.firstName || user.first_name} {user.lastName || user.last_name}
                                        </span>
                                        {user.role && (
                                            <span className={styles.userRole}>
                                                ({user.role})
                                            </span>
                                        )}
                                    </div>
                                    
                                    {userIsAdmin && (
                                        <Link 
                                            to="/admin" 
                                            onClick={handleAdminClick}
                                            className={`${styles.authButton} ${styles.adminButton} ${location.pathname === '/admin' ? styles.active : ''}`}
                                        >
                                            Админ
                                        </Link>
                                    )}
                                    
                                    <button 
                                        onClick={handleLogoutClick}
                                        className={styles.logoutButton}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.authSection}>
                                    <Link 
                                        to="/login" 
                                        onClick={handleLoginClick}
                                        className={`${styles.authButton} ${location.pathname === '/login' ? styles.active : ''}`}
                                    >
                                        Войти
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        onClick={modalClosed}
                                        className={`${styles.authButton} ${styles.registerButton} ${location.pathname === '/register' ? styles.active : ''}`}
                                    >
                                        Регистрация
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;