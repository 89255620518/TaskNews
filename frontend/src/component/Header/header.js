import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './header.module.scss';
import logo from '../../image/logo.1.png';
import { useState, useEffect } from 'react';
import { useAuth } from '../../useContext/AuthContext';
import { useBasket } from '../../useContext/basketContext';
import basketFoto from '../../image/Vector.svg';

const Header = ({
    modalOpen,
    modalClosed,
    isModalOpen,
    tableRef,
    hallRef,
    taxiRef,
    deliveryRef,
    contactsRef
    // isWebApp = false
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
    const { items: basketItems, } = useBasket()
    // eslint-disable-next-line no-unused-vars
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

    // Для WebApp всегда показываем мобильную версию
    const displayMobile = isMobile;

    const scrollToRef = (ref) => {
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth" });
        } else {
            console.error("Ref is undefined or does not have a current property");
        }
    }

    const handleScroll = (ref) => {
        if (location.pathname === '/') {
            if (isModalOpen) {
                modalClosed();
                setTimeout(() => {
                    scrollToRef(ref)
                }, 300)
            } else {
                scrollToRef(ref)
            }
        } else {
            navigate('/');
            setTimeout(() => {
                if (isModalOpen) {
                    modalClosed();
                    setTimeout(() => {
                        scrollToRef(ref);
                    }, 300)
                } else {
                    setTimeout(() => {
                        scrollToRef(ref)
                    }, 300)
                }
            }, 400)
        }
    }

    // Специальная кнопка "Назад" для WebApp

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
                                    <Link to={'/menu'} onClick={modalClosed}><span>Меню</span></Link>
                                    <button onClick={() => handleScroll(tableRef)}><span>Резерв Стола</span></button>
                                    <button onClick={() => handleScroll(deliveryRef)}><span>Доставка</span></button>
                                    <button onClick={() => handleScroll(hallRef)}><span>Банкеты</span></button>
                                    <button onClick={() => handleScroll(taxiRef)}><span>Такси</span></button>
                                    <button onClick={() => handleScroll(contactsRef)}><span>Контакты</span></button>
                                </div>
                            </div>
                        )}

                        <Link to="/" className={styles.logoContainer}>
                            <img src={logo} alt='Логотип Дали-Хинкали' className={styles.logo} />
                        </Link>

                        {token ? (
                            <>
                                <Link
                                    to="/basket"
                                    onClick={modalClosed}
                                    className={styles.cartIcon}
                                >
                                    <img
                                        className={styles.cartSvg}
                                        alt='Корзина Дали-Хинкали'
                                        src={basketFoto}
                                    />
                                    <span className={styles.cartCount}>{basketItems.length}</span>
                                </Link>
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
                        <Link to="/" className={styles.logoContainer}>
                            <img src={logo} alt='Логотип Дали-Хинкали' className={styles.logo} />
                        </Link>

                        <div className={styles.buttonLinks}>
                            <Link to={'/'} onClick={modalClosed}><span>Главная</span></Link>
                            <Link to={'/menu'} onClick={modalClosed}><span>Меню</span></Link>
                            <button onClick={() => handleScroll(tableRef)}><span>Резерв Стола</span></button>
                            <button onClick={() => handleScroll(deliveryRef)}><span>Доставка</span></button>
                            <button onClick={() => handleScroll(hallRef)}><span>Банкеты</span></button>
                            <button onClick={() => handleScroll(taxiRef)}><span>Такси</span></button>
                            <button onClick={() => handleScroll(contactsRef)}><span>Контакты</span></button>
                        </div>

                        {token ? (
                            <div className={styles.cartCabinet}>
                                <Link
                                    to="/basket"
                                    onClick={modalClosed}
                                    className={styles.cartIcon}
                                >
                                    <img
                                        className={styles.cartSvg}
                                        alt='Корзина Дали-Хинкали'
                                        src={basketFoto}
                                    />
                                    <span className={styles.cartCount}>{basketItems.length}</span>
                                </Link>
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