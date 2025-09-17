import { useState } from "react";
import { useBasket } from '../../../useContext/basketContext';
import { Link } from 'react-router-dom';
import styless from './basketButton.module.css';

const BasketButton = ({ elem, currentCount: propCurrentCount, className }) => {
    const [showMiniAlert, setShowMiniAlert] = useState(false);
    const [showAddiAlert, setShowAddiAlert] = useState(false);
    const [showAuthiAlert, setShowAuthiAlert] = useState(false);
    const {
        items: basketItems = [],
        addItem,
        removeItem,
        updateItem,
    } = useBasket();

    const isKhinkali = [82, 174, 81, 83].includes(elem.id) ||
        (elem.title && elem.title.startsWith("Хинкали"));
    const minKhinkaliCount = 5;

    if (!elem || !elem.id) {
        console.error('Invalid elem prop in BasketButton:', elem);
        return null;
    }

    const currentItem = basketItems.find(item => item?.id === elem?.id);
    const currentCount = propCurrentCount ?? (currentItem ? currentItem.quantity : 0);

    const showMinAlert = () => {
        setShowMiniAlert(true);
        setTimeout(() => setShowMiniAlert(false), 3000);
    };

    const showAddAlert = () => {
        setShowAddiAlert(true);
        setTimeout(() => setShowAddiAlert(false), 3000);
    };

    const showAuthAlert = () => {
        setShowAuthiAlert(true);
        setTimeout(() => setShowAuthiAlert(false), 3000);
    };

    const handleRemoveFromCart = async () => {
        try {
            if (elem?.id) {
                // Для хинкали удаляем только если количество <= 5
                if (isKhinkali && currentCount > minKhinkaliCount) {
                    await updateItem(elem.id, minKhinkaliCount);
                    showMinAlert();
                } else {
                    await removeItem(elem.id);
                }
            }
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const handleAddToCart = async () => {
        try {
            if (!elem?.id) return;

            // Для хинкали первый клик добавляет 5 штук
            if (isKhinkali && currentCount === 0) {
                await addItem(elem.id, minKhinkaliCount);
                showAddAlert();
            } else {
                await addItem(elem.id, 1);
            }
        } catch (err) {
            console.error('Error adding item:', err);
            if (err.message?.includes('авторизация')) {
                showAuthAlert();
            }
        }
    };

    const handleDecreaseItem = async () => {
        try {
            if (!elem?.id) return;

            const newQuantity = currentCount - 1;

            // Для хинкали нельзя уменьшить ниже 5
            if (isKhinkali && newQuantity < minKhinkaliCount) {
                await handleRemoveFromCart();
                showMinAlert()
                return;
            }

            if (newQuantity < 1) {
                await handleRemoveFromCart();
                return;
            }

            await updateItem(elem.id, newQuantity);
        } catch (err) {
            console.error('Error decreasing item:', err);
        }
    };

    const handleIncreaseItem = async () => {
        try {
            if (!elem?.id) return;

            if (isKhinkali && currentCount < minKhinkaliCount) {
                await updateItem(elem.id, minKhinkaliCount);
                showAddAlert();
            } else {
                await updateItem(elem.id, currentCount + 1);
            }
        } catch (err) {
            console.error('Error increasing item:', err);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <div className={`${styless.wrapper} ${className}`}>
            <form className={styless.formBtn} onSubmit={handleSubmit}>
                {currentCount ? (
                    <div className={styless.countContainer}>
                        <div className={styless.countBtn}>
                            <button
                                type="button"
                                className={styless.countDecrease}
                                onClick={handleDecreaseItem}
                            >
                                -
                            </button>
                            <span className={styless.countBasket}>{currentCount}</span>
                            <button
                                type="button"
                                className={styless.countIncrease}
                                onClick={handleIncreaseItem}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        className={styless.btn}
                        onClick={handleAddToCart}
                    >
                        + В корзину
                    </button>
                )}
            </form>

            {showMiniAlert && (
                <div className={styless.alertOverlay}>
                    <div className={styless.alertBox}>
                        <div className={styless.alertContent}>
                            <span className={styless.alertIcon}>⚠️</span>
                            <p>Минимальное количество хинкали - {minKhinkaliCount} шт. Установлено минимальное количество.</p>
                        </div>
                    </div>
                </div>
            )}

            {showAddiAlert && (
                <div className={styless.alertOverlay}>
                    <div className={styless.alertBox}>
                        <div className={styless.alertContent}>
                            <span className={styless.alertIcon}>✅</span>
                            <p>Добавлено минимальное количество хинкали - {minKhinkaliCount} шт.</p>
                        </div>
                    </div>
                </div>
            )}

            {showAuthiAlert && (
                <div className={styless.alertOverlay}>
                    <div className={styless.alertBox}>
                        <div className={styless.alertContent}>
                            <span className={styless.alertIcon}>🔒</span>
                            <p>Чтобы добавить товар в корзину, пожалуйста <Link to="/login" className={styless.authLink}>войдите</Link> или <Link to="/register" className={styless.authLink}>зарегистрируйтесь</Link></p>
                            <div className={styless.alertButtons}>
                                <Link to="/login" className={styless.alertButtonPrimary} onClick={() => setShowAuthiAlert(false)}>
                                    Войти
                                </Link>
                                <button className={styless.alertButtonSecondary} onClick={() => setShowAuthiAlert(false)}>
                                    Позже
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BasketButton;