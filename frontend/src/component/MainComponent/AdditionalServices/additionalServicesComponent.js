import styles from './additionalServices.module.scss';
import dopfoto from '../Banner/img/addServicesBanner.jpeg';
import { useState } from 'react';
import { api } from '../../../api/api';
import { useAuth } from '../../../useContext/AuthContext';
import ServicesModal from './servicesModal/servicesSuccess';

const AdditionalServicesComponent = () => {
    const { token } = useAuth();
    const [items, setItems] = useState([
        {
            id: 183,
            title: 'Ягненок',
            description: 'Мясо',
            price: 3000,
            quantity: 0,
            calories: 0,
            compound: '',
            images: [],
            is_favorited: false,
            is_in_shopping_cart: false,
            type: 'Доп услуги',
            weight: 0
        },
        {
            id: 184,
            title: 'Поросенок',
            description: 'Мясо',
            price: 3000,
            quantity: 0,
            calories: 0,
            compound: '',
            images: [],
            is_favorited: false,
            is_in_shopping_cart: false,
            type: 'Доп услуги',
            weight: 0
        },
        {
            id: 185,
            title: 'Утка',
            description: 'Мясо',
            price: 1500,
            quantity: 0,
            calories: 0,
            compound: '',
            images: [],
            is_favorited: false,
            is_in_shopping_cart: false,
            type: 'Доп услуги',
            weight: 0
        },
        {
            id: 186,
            title: 'Гусь',
            description: 'Мясо',
            price: 1500,
            quantity: 0,
            calories: 0,
            compound: '',
            images: [],
            is_favorited: false,
            is_in_shopping_cart: false,
            type: 'Доп услуги',
            weight: 0
        },
        {
            id: 187,
            title: 'Кролик',
            description: 'Мясо',
            price: 1500,
            quantity: 0,
            calories: 0,
            compound: '',
            images: [],
            is_favorited: false,
            is_in_shopping_cart: false,
            type: 'Доп услуги',
            weight: 0
        }
    ]);

    const [comment, setComment] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [description, setDescription] = useState('Дополнительные услуги по приготовлению мяса');
    const [isLoading, setIsLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);
    const [isSucces, setIsSucces] = useState(false)

    const updateQuantity = (index, newQuantity) => {
        if (newQuantity < 0) return;
        const newItems = [...items];
        newItems[index].quantity = newQuantity;
        setItems(newItems);
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSubmitOrder = async () => {
        if (total === 0) {
            setOrderStatus({ type: 'error', message: 'Добавьте хотя бы один товар' });
            return;
        }

        if (!token) {
            setOrderStatus({ type: 'error', message: 'Для оформлении заказа, нужно авторизоваться' });
            return;
        }

        setIsLoading(true);
        setOrderStatus(null);

        try {
            const selectedItems = items.filter(item => item.quantity > 0);

            const orderData = {
                goods_id: selectedItems.map(item => item.id),
                count_goods: selectedItems.map(item => item.quantity),
                price_goods: selectedItems.map(item => item.price),
                final_price: total,
                description: description,
                comments: comment
            };

            await api.users.sendPreorder(orderData, token);

            setIsSucces(true)
            // Сброс формы после успешной отправки
            setItems(items.map(item => ({ ...item, quantity: 0 })));
            setComment('');
            setTimeout(() => {
                setIsSucces(false);
            }, 3000);
        } catch (error) {
            console.error('Ошибка при отправке предзаказа:', error);
            setOrderStatus({ type: 'error', message: 'Произошла ошибка при отправке заказа' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.containerServices}>
            <div className={styles.containerServices__content}>
                <div className={styles.containerServices__content__info}>
                    <img
                        className={styles.containerServices__content__info_img}
                        src={dopfoto}
                        alt='Допуслуги Дали-Хинкали'
                    />
                    <p className={styles.containerServices__content__info_text}>Доп услуги</p>
                </div>

                <div className={styles.containerServices__content__menu}>
                    <p className={styles.containerServices__content__menu_text}>
                        Наша услуга представляет собой идеальное решение для занятых людей, ценящих вкус и качество в каждом приеме пищи, но не имеющих достаточно времени на подготовку. Мы замаринуем и приготовим ваше мясо на мангале на вертеле с нежностью и вниманием к каждой детали.
                        <span className={styles.containerServices__content__menu_text_span}>Наши повара - настоящие мастера своего дела, они заботятся о выборе приправ и специй, чтобы вкус был настоящим кулинарным открытием.</span>
                    </p>

                    <div className={styles.containerServices__content__menu_services}>
                        {items.map((item, index) => (
                            <div key={item.id} className={styles.serviceItem}>
                                <div className={styles.serviceInfo}>
                                    <span className={styles.serviceName}>{item.title} -</span>
                                    <span className={styles.servicePrice}> {item.price} руб</span>
                                </div>
                                <div className={styles.quantityControls}>
                                    <button
                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                        className={styles.quantityButton}
                                        disabled={item.quantity === 0}
                                    >
                                        -
                                    </button>
                                    <span className={styles.quantityValue}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                        className={styles.quantityButton}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className={styles.divider}></div>

                        <div className={styles.totalSection}>
                            <div className={styles.totalRow}>
                                <span className={styles.totalRow_span}>Итог:</span>
                                <span className={styles.totalAmount}>{total} руб</span>
                            </div>

                            <textarea
                                className={styles.commentArea}
                                placeholder="Комментарий к заказу"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />

                            {orderStatus && (
                                <div className={styles.orderDiv}>
                                    <p
                                        className={orderStatus.type === 'success'
                                            ? styles.orderSuccess
                                            : styles.orderError}
                                    >{orderStatus.message}</p>
                                </div>
                            )}

                            <button
                                className={styles.orderButton}
                                onClick={handleSubmitOrder}
                                disabled={isLoading || total === 0}
                            >
                                {isLoading ? 'Отправка...' : 'Оформить предзаказ'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isSucces && <ServicesModal />}
        </div>
    )
}

export default AdditionalServicesComponent;