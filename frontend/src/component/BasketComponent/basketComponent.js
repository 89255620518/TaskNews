import React, { useState } from 'react';
import styles from './basket.module.scss';
import BasketItem from './BasketItem/basketItem';
import { useBasket } from '../../useContext/basketContext';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBasket, FaUtensils, FaPlus } from 'react-icons/fa';
import BasketSuccess from './basketSuccess';

const BasketComponent = React.memo(() => {
    const { items, totalPrice, checkout, clearBasket, orderProcessing, orderError } = useBasket();
    const [deliveryData, setDeliveryData] = useState({
        city: '',
        street: '',
        house: '',
        entrance: '',
        apartment: '',
        deliveryDate: '',
        deliveryTime: '',
        comments: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [minDeliveryTime, setMinDeliveryTime] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeliveryData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));

        if (name === 'deliveryDate') {
            const today = new Date().toISOString().split('T')[0];
            if (value === today) {
                const now = new Date();
                const minTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 час от текущего времени
                const hours = minTime.getHours().toString().padStart(2, '0');
                const minutes = minTime.getMinutes().toString().padStart(2, '0');
                setMinDeliveryTime(`${hours}:${minutes}`);

                // Проверка на нерабочее время
                const selectedTime = deliveryData.deliveryTime;
                if (selectedTime) {
                    const [selectedHours, selectedMinutes] = selectedTime.split(':').map(Number);
                    const totalMinutes = selectedHours * 60 + selectedMinutes;

                    // Если время вне рабочего периода (до 11:00 или после 22:00)
                    if (totalMinutes >= 23 * 60 || totalMinutes < 11 * 60) {
                        setDeliveryData(prev => ({ ...prev, deliveryTime: '' }));
                        setFormErrors(prev => ({
                            ...prev,
                            deliveryTime: 'Заведение работает с 11:00 до 23:00'
                        }));
                    }
                    // Если время раньше минимального доступного
                    else if (selectedTime < `${hours}:${minutes}`) {
                        setDeliveryData(prev => ({ ...prev, deliveryTime: '' }));
                    }
                }
            } else {
                setMinDeliveryTime('');

                // Проверка на нерабочее время для будущих дат
                if (deliveryData.deliveryTime) {
                    const [selectedHours, selectedMinutes] = deliveryData.deliveryTime.split(':').map(Number);
                    const totalMinutes = selectedHours * 60 + selectedMinutes;

                    if (totalMinutes >= 23 * 60 || totalMinutes < 11 * 60) {
                        setDeliveryData(prev => ({ ...prev, deliveryTime: '' }));
                        setFormErrors(prev => ({
                            ...prev,
                            deliveryTime: 'Заведение работает с 11:00 до 23:00'
                        }));
                    }
                }
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        // Проверка обязательных полей адреса
        if (!deliveryData.city) errors.city = 'Укажите город';
        if (!deliveryData.street) errors.street = 'Укажите улицу';
        if (!deliveryData.house) errors.house = 'Укажите номер дома';

        // Проверка даты и времени
        if (!deliveryData.deliveryDate) errors.deliveryDate = 'Укажите дату доставки';
        if (!deliveryData.deliveryTime) errors.deliveryTime = 'Укажите время доставки';

        if (deliveryData.deliveryTime) {
            const [hours, minutes] = deliveryData.deliveryTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes;

            // Проверка на рабочее время
            if (totalMinutes >= 23 * 60 || totalMinutes < 11 * 60) {
                errors.deliveryTime = 'Заведение работает с 11:00 до 23:00';
            }

            if (deliveryData.deliveryDate === today) {
                const selectedTime = new Date(`${today}T${deliveryData.deliveryTime}`);
                const minTime = new Date(now.getTime() + 60 * 60 * 1000);

                if (selectedTime < minTime) {
                    errors.deliveryTime = `Сегодня доставка возможна не ранее ${minTime.getHours()}:${minTime.getMinutes().toString().padStart(2, '0')}`;
                }
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleClearBasket = async () => {
        try {
            await clearBasket();
        } catch (err) {
            setFormErrors({ general: 'Не удалось очистить корзину' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (items.length === 0) {
            setFormErrors({ general: 'Корзина пуста' });
            return;
        }

        try {
            const fullAddress = `${deliveryData.city}, ${deliveryData.street}, д.${deliveryData.house}` +
                (deliveryData.entrance ? `, подъезд ${deliveryData.entrance}` : '') +
                (deliveryData.apartment ? `, кв.${deliveryData.apartment}` : '');

            const result = await checkout({
                address: fullAddress,
                delivery_time: `${deliveryData.deliveryDate} ${deliveryData.deliveryTime}`,
                comments: deliveryData.comments,
                description: `Заказ из корзины (${items.length} товаров)`
            });

            if (result) {
                setIsSuccess(true)
                setTimeout(() => {
                    window.location.href = result;
                }, 3000);
            } // Перенаправляем на страницу оплаты

        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            setFormErrors({ general: 'Ошибка при оформлении заказа' });
        }
    };

    const currentHour = new Date().getHours();
    const isNonWorkingHours = currentHour >= 22 || currentHour < 11;

    return (
        <div className={styles.containerBasket}>
            <h1 className={styles.title}>Корзина</h1>

            {items.length === 0 ? (
                <div className={styles.emptyBasketContainer}>
                    <div className={styles.emptyBasketContent}>
                        <FaShoppingBasket className={styles.basketIcon} />
                        <h2>Ваша корзина пуста</h2>
                        <p>Кажется, вы еще ничего не добавили в корзину</p>
                        <button
                            onClick={() => navigate('/menu')}
                            className={styles.menuButton}
                        >
                            <FaUtensils className={styles.menuIcon} />
                            Перейти в меню
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.itemsList}>
                        {items.map(item => (
                            <BasketItem key={`${item.id}_${item.quantity}`} item={item} />
                        ))}
                    </div>

                    <div className={styles.moreControls}>
                        <div className={styles.addMoreContainer}>
                            <button
                                onClick={() => navigate('/menu')}
                                className={styles.addMoreButton}
                            >
                                <FaPlus className={styles.addMoreIcon} />
                                Что-то еще?
                            </button>
                        </div>

                        <div className={styles.basketControls}>
                            <button
                                onClick={handleClearBasket}
                                className={styles.clearButton}
                                disabled={orderProcessing}
                            >
                                Очистить корзину
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.deliveryForm}>
                        <h2>Данные для доставки</h2>

                        <div className={styles.addressFields}>
                            <div className={styles.formGroup}>
                                <label htmlFor="city">Город *</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={deliveryData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.city && <span className={styles.error}>{formErrors.city}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="street">Улица *</label>
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={deliveryData.street}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.street && <span className={styles.error}>{formErrors.street}</span>}
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="house">Дом *</label>
                                    <input
                                        type="text"
                                        id="house"
                                        name="house"
                                        value={deliveryData.house}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {formErrors.house && <span className={styles.error}>{formErrors.house}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="entrance">Подъезд</label>
                                    <input
                                        type="text"
                                        id="entrance"
                                        name="entrance"
                                        value={deliveryData.entrance}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="apartment">Квартира</label>
                                    <input
                                        type="text"
                                        id="apartment"
                                        name="apartment"
                                        value={deliveryData.apartment}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="deliveryDate">Дата доставки *</label>
                                <input
                                    type="date"
                                    id="deliveryDate"
                                    name="deliveryDate"
                                    value={deliveryData.deliveryDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {formErrors.deliveryDate && <span className={styles.error}>{formErrors.deliveryDate}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="deliveryTime">Время доставки *</label>
                                <input
                                    type="time"
                                    id="deliveryTime"
                                    name="deliveryTime"
                                    value={deliveryData.deliveryTime}
                                    onChange={handleInputChange}
                                    min={minDeliveryTime}
                                    required
                                />
                                {formErrors.deliveryTime && (
                                    <span className={styles.error}>{formErrors.deliveryTime}</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="comments">Комментарий к заказу</label>
                            <textarea
                                id="comments"
                                name="comments"
                                value={deliveryData.comments}
                                onChange={handleInputChange}
                                placeholder="Особые пожелания, детали доставки и т.д."
                            />
                        </div>

                        <div className={styles.orderSummary}>
                            <div className={styles.summaryRow}>
                                <span>Товаров:</span>
                                <span>{items.length} шт.</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Общая сумма:</span>
                                <span>{totalPrice} ₽</span>
                            </div>
                        </div>

                        {orderError && <div className={styles.error}>{orderError}</div>}
                        {formErrors.general && <div className={styles.error}>{formErrors.general}</div>}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={orderProcessing || isNonWorkingHours}
                        >
                            {orderProcessing ? 'Оформляем заказ...' :
                                isNonWorkingHours
                                    ? 'Заказ можно оформить с 11:00 до 22:00'
                                    : 'Оформить заказ'}
                        </button>
                    </form>
                </>
            )}

            {isSuccess && <BasketSuccess />}
        </div>
    );
});

export default BasketComponent;