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
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1000);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const displayMobile = isMobile;

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
                                    <Link to={'/'} onClick={modalClosed}><span>Главная</span></Link>
                                </div>
                            </div>
                        )}

                        {token ? (
                            <>
                                <Link to="/cabinet" onClick={modalClosed} className={styles.iconButton}>🤵</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={modalClosed} className={styles.authButton}>Войти</Link>
                            </>
                        )}
                    </>


                ) : (
                    <div className={styles.desktopMenu}>
                        <div className={styles.buttonLinks}>
                            <Link to={'/'} onClick={modalClosed}><span>Главная</span></Link>
                        </div>

                        {token ? (
                            <div className={styles.cartCabinet}>
                                <Link to="/cabinet" onClick={modalClosed} className={styles.iconButton}>🤵</Link>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" onClick={modalClosed} className={styles.authButton}>Войти</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;