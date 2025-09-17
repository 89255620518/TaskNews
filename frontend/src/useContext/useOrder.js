import { useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/api';

export const useOrder = () => {
    const { token } = useAuth();
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [paymentLink, setPaymentLink] = useState(null);
    const [orderId, setOrderId] = useState(null);

    const createOrder = async (orderData, basketItems, totalPrice) => {
        setOrderLoading(true);
        setOrderError(null);

        try {
            // Подготовка данных для send-order
            const orderPayload = {
                address: orderData.address,
                delivery_time: orderData.delivery_time,
                comments: orderData.comments || '',
                description: orderData.description || 'Заказ из корзины',
                goods_id: basketItems.map(item => item.id),
                count_goods: basketItems.map(item => item.quantity),
                price_goods: basketItems.map(item => item.price),
                final_price: totalPrice
            };

            // Отправка заказа
            const response = await api.users.sendOrder(orderPayload, token);

            // Сохраняем ID заказа для последующей оплаты
            setOrderId(response.data.order_id || Date.now().toString());

            return {
                ...response.data,
                totalPrice // Возвращаем totalPrice для использования в createPayment
            };
        } catch (error) {
            setOrderError(error.response?.data?.error || 'Ошибка создания заказа');
            throw error;
        } finally {
            setOrderLoading(false);
        }
    };

    const createPayment = async (totalPrice) => {
        if (!orderId) throw new Error('Order ID is missing');

        setOrderLoading(true);
        setOrderError(null);

        try {
            // Подготовка данных для payment
            const paymentData = {
                price: totalPrice,
                num_order: orderId,
                service_name: `Заказ №${orderId}`,
            };

            const response = await api.users.processPayment(paymentData, token);
            setPaymentLink(response.data.success);
            return response.data;
        } catch (error) {
            setOrderError(error.response?.data?.error || 'Ошибка создания платежа');
            throw error;
        } finally {
            setOrderLoading(false);
        }
    };

    const clearPaymentData = () => {
        setPaymentLink(null);
        setOrderId(null);
    };

    return {
        createOrder,
        createPayment,
        paymentLink,
        orderLoading,
        orderError,
        clearPaymentData,
        orderId
    };
};