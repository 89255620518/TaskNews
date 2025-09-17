import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api/api';
import { useAuth } from './AuthContext';

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderProcessing, setOrderProcessing] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [paymentLink, setPaymentLink] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    // 1. Сначала объявляем все вычисляемые значения
    const calculateTotalItems = (items) => items.reduce((sum, item) => sum + item.quantity, 0);
    const calculateTotalPrice = (items) => items.reduce((sum, item) => sum + (item.price), 0);

    const totalItems = useMemo(() => calculateTotalItems(items), [items]);
    const totalPrice = useMemo(() => calculateTotalPrice(items), [items]);

    // 2. Затем объявляем основные функции работы с корзиной
    const loadBasket = useCallback(async () => {
        if (!token) {
            setItems([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.goods.getCart(token);

            const formattedItems = response.map(item => ({
                id: item.goods.id,
                goods: {
                    id: item.goods.id,
                    title: item.goods.title,
                    price: item.goods.price,
                    images: item.goods.images,
                },
                quantity: item.count,
                price: item.price
            }));

            setItems(formattedItems);
        } catch (err) {
            console.error('Ошибка загрузки корзины:', err);
            setError('Не удалось загрузить корзину');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Функция для загрузки истории заказов
    const loadOrderHistory = useCallback(async () => {
        if (!token) {
            setOrderHistory([]);
            return;
        }

        try {
            setHistoryLoading(true);
            setHistoryError(null);
            const response = await api.goods.getOrderHistory(token);
            setOrderHistory(response);
        } catch (err) {
            console.error('Ошибка загрузки истории заказов:', err);
            setHistoryError('Не удалось загрузить историю заказов');
            setOrderHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadBasket();
        loadOrderHistory(); // Загружаем историю заказов при монтировании
    }, [loadBasket, loadOrderHistory]);


    // 3. Функции для работы с товарами
    const khinkaliIds = useMemo(() => [82, 174, 81, 83], []);
    const minKhinkaliCount = 5;

    // Функция проверки, является ли товар хинкали (по ID или названию)
    const isKhinkali = useCallback(
        (itemId, itemTitle) =>
            khinkaliIds.includes(itemId) || (itemTitle?.toLowerCase()?.includes("хинкали")),
        [khinkaliIds]
    );

    const addItem = useCallback(async (itemId, count = 1, itemTitle = "") => {
        if (!token) throw new Error("Требуется авторизация");

        // Для хинкали устанавливаем минимальное количество
        const finalCount = isKhinkali(itemId, itemTitle)
            ? Math.max(count, minKhinkaliCount)
            : count;

        try {
            await api.goods.addToCart(itemId, token, finalCount);
            await loadBasket(); // Обновляем состояние корзины
        } catch (err) {
            throw new Error(err.response?.data?.error || "Ошибка при добавлении в корзину");
        }
    }, [token, loadBasket, isKhinkali]);

    const removeItem = useCallback(async (itemId) => {
        if (!token) return;
        try {
            await api.goods.removeFromCart(itemId, token);
            await loadBasket();
        } catch (err) {
            throw new Error('Ошибка удаления');
        }
    }, [token, loadBasket]);

    const updateItem = useCallback(async (itemId, newQuantity) => {
        if (!token) return;
        try {
            await api.goods.updateCartItem(itemId, newQuantity, token);
            await loadBasket();
        } catch (err) {
            throw new Error('Ошибка обновления');
        }
    }, [token, loadBasket]);

    const clearBasket = useCallback(async () => {
        if (!token) return;
        try {
            await Promise.all(items.map(item => api.goods.removeFromCart(item.id, token)));
            await loadBasket();
        } catch (err) {
            throw new Error('Ошибка очистки');
        }
    }, [token, items, loadBasket]);

    const checkout = useCallback(async (orderData) => {
        if (!token) throw new Error("Требуется авторизация");
        if (!items.length) throw new Error("Корзина пуста");

        setOrderProcessing(true);
        setOrderError(null);

        try {
            const currentTotalPrice = calculateTotalPrice(items);

            // Отправка заказа
            await api.users.sendOrder({
                address: orderData.address,
                delivery_time: orderData.delivery_time,
                comments: orderData.comments || '',
                description: orderData.description || 'Заказ из корзины',
                goods_id: items.map(item => item.id),
                count_goods: items.map(item => item.quantity),
                price_goods: items.map(item => item.price),
                final_price: currentTotalPrice
            }, token);

            // Создание платежа
            const paymentResponse = await api.users.processPayment({
                price: currentTotalPrice,
                num_order: `order_${Date.now()}`,
                service_name: 'Оплата заказа'
            }, token);

            // Обновляем paymentLink в состоянии
            if (paymentResponse && paymentResponse.success) {
                setPaymentLink(paymentResponse.success);
                await clearBasket();
                await loadOrderHistory(); // Обновляем историю после успешного заказа
                return paymentResponse.success; // Возвращаем ссылку
            }

            console.log(paymentLink, 'pau')
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            setOrderError(error.response?.data?.error || 'Ошибка оформления заказа');
            throw error;
        } finally {
            setOrderProcessing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, items, clearBasket, loadOrderHistory]);

    const clearPayment = useCallback(() => {
        setPaymentLink(null);
        setOrderError(null);
    }, []);

    // 5. Формируем контекстное значение
    const contextValue = useMemo(() => ({
        items,
        loading,
        error,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateItem,
        clearBasket,
        refreshBasket: loadBasket,
        checkout,
        orderProcessing,
        orderError,
        paymentLink,
        clearPayment,
        // История заказов
        orderHistory,
        historyLoading,
        historyError,
        refreshOrderHistory: loadOrderHistory
    }), [
        items,
        loading,
        error,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateItem,
        clearBasket,
        loadBasket,
        checkout,
        orderProcessing,
        orderError,
        paymentLink,
        clearPayment,
        // История заказов
        orderHistory,
        historyLoading,
        historyError,
        loadOrderHistory
    ]);

    return (
        <BasketContext.Provider value={contextValue}>
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => {
    const context = useContext(BasketContext);
    if (!context) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
};