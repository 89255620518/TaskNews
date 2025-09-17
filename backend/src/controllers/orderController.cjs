
const axios = require('axios');
const { Order } = require('../models/Orders.cjs');
const { OrderItem } = require('../models/OrderItems.cjs');
const { User } = require('../models/Users.cjs');
const { sendEmail } = require('../utils/sendEmain.cjs');
const { Op, Sequelize } = require('sequelize');
const { sequelize } = require("../config/config.cjs");

const PAYKEEPER_URL = "https://tyteda-1.server.paykeeper.ru";
const PAYKEEPER_USER = "admin";
const PAYKEEPER_PASSWORD = "1234567Asd!";


class PaymentStatusChecker {
  constructor() {
    this.intervalId = null;
    this.isChecking = false;
    this.retryDelays = [1000, 3000, 5000, 10000];
  }

  start(intervalMinutes = 15) {
    if (this.intervalId) this.stop();

    this.intervalId = setInterval(
      () => this.checkPendingPayments(),
      intervalMinutes * 60 * 1000
    );

    this.checkPendingPayments();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkPendingPayments() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const pendingOrders = await Order.findAll({
        where: {
          status: { [Op.in]: ['pending', 'processing_payment'] },
          paykeeperId: { [Op.not]: null },
          created_at: { [Op.gte]: Sequelize.literal(`NOW() - INTERVAL '24 HOURS'`) }
        },
        limit: 100,
        order: [['created_at', 'ASC']]
      });

      console.log(`Найдено ${pendingOrders.length} заказов для проверки статуса`);

      for (const [index, order] of pendingOrders.entries()) {
        const delay = this.retryDelays[Math.min(index, this.retryDelays.length - 1)];
        if (index > 0) await new Promise(resolve => setTimeout(resolve, delay));

        try {
          await this.checkSingleOrderStatus(order);
        } catch (error) {
          console.error(`Ошибка при проверке заказа ${order.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке платежей:', error);
    } finally {
      this.isChecking = false;
    }
  }

  async checkSingleOrderStatus(order) {
    try {
      const base64Auth = Buffer.from(`${PAYKEEPER_USER}:${PAYKEEPER_PASSWORD}`).toString('base64');
      const headers = { 'Authorization': `Basic ${base64Auth}` };

      const response = await axios.get(
        `${PAYKEEPER_URL}/info/invoice/byid/?id=${order.paykeeperId}`,
        { headers, timeout: 10000 }
      );

      const paymentData = response.data;
      const newStatus = this.mapPaymentStatus(paymentData.status);

      if (newStatus !== order.status) {
        await this.updateOrderStatus(order, newStatus, paymentData);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return;
        }
        console.error(`Ошибка API для заказа ${order.id}:`, error.response?.data);
      }
      throw error;
    }
  }

  mapPaymentStatus(paykeeperStatus) {
    const statusMap = {
      'paid': 'paid',
      'failed': 'failed',
      'cancelled': 'failed',
      'new': 'pending',
      'processing': 'processing_payment'
    };

    return statusMap[paykeeperStatus.toLowerCase()] || 'failed';
  }

  async updateOrderStatus(order, newStatus, paymentData) {
    const updateData = {
      status: newStatus,
      ...(newStatus === 'paid' && { paidAt: new Date(paymentData.paid_at || new Date()) })
    };

    await Order.update(updateData, { where: { id: order.id } });
    console.log(`Статус заказа ${order.id} обновлен на ${newStatus}`);
  }
}

class OrderController {
  constructor() {
    try {
      this.paymentStatusChecker = new PaymentStatusChecker();
      this.paymentStatusChecker.start();
    } catch (error) {
      console.error('Ошибка инициализации PaymentStatusChecker:', error);
    }
  }

  async createOrder(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { cart, deliveryAddress, deliveryTime, totalAmount, deliveryCost = 0 } = req.body;
      const userId = req.user.id;

      if (!cart || !Array.isArray(cart) || !deliveryAddress || !deliveryTime || !totalAmount) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Недостаточно данных для заказа' });
      }

      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const calculatedTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryCost;
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Неверная итоговая сумма' });
      }

      if (new Date(deliveryTime) < new Date()) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Некорректная дата доставки' });
      }

      const order = await Order.create({
        userId,
        totalAmount,
        deliveryAddress,
        deliveryTime: new Date(deliveryTime),
        deliveryCost,
        status: 'pending',
        paykeeper_id: null,
      }, { transaction });

      const orderItemsData = cart.map(item => ({
        orderId: order.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }));

      const createdItems = await OrderItem.bulkCreate(orderItemsData, {
        transaction,
        returning: true
      });

      const orderDetails = {
        firstName: user.firstName || 'Не указано',
        lastName: user.lastName || 'Не указано',
        phone: user.phoneNumber || 'Не указан',
        email: user.email,
        deliveryDate: new Date(deliveryTime).toLocaleDateString(),
        deliveryTime: new Date(deliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deliveryAddress,
        orders: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount,
        comment: req.body.comment,
        status: 'pending'
      };

      try {
        await sendEmail(orderDetails);
      } catch (emailError) {
        console.error('Ошибка отправки email:', emailError);
        // Продолжаем работу, так как email не критичен для создания заказа
      }
      await transaction.commit();

      const response = {
        ...order.get({ plain: true }),
        items: createdItems,
        paykeeperId: order.paykeeperId ?? null,
      };

      res.status(201).json(response);
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating order:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка при создании заказа'
      });
    }
  }

  async getOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await Order.findAll({
        where: { userId },
        include: [{
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'name', 'quantity', 'price', 'total']
        }],
        order: [['created_at', 'DESC']]
      });
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка при получении заказов'
      });
    }
  }

  async getOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const order = await Order.findOne({
        where: { id, userId },
        include: [{
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'name', 'quantity', 'price', 'total']
        }]
      });

      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка при получении заказа'
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const userId = req.user.id;
      const { id } = req.params;

      if (!['pending', 'paid', 'failed', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Некорректный статус' });
      }

      const [affectedCount] = await Order.update(
        { status },
        { where: { id, userId } }
      );

      if (affectedCount === 0) {
        return res.status(404).json({ error: 'Заказ не найден или нет прав' });
      }

      res.status(200).json({ message: 'Статус заказа обновлен' });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка при обновлении заказа'
      });
    }
  }

  async deleteOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const affectedCount = await Order.destroy({
        where: {
          id,
          userId,
          status: 'pending'
        }
      });

      if (affectedCount === 0) {
        return res.status(404).json({
          error: 'Заказ не найден, нет прав или нельзя удалить'
        });
      }

      res.status(200).json({ message: 'Заказ удален' });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка при удалении заказа'
      });
    }
  }

  async generatePayment(req, res) {
    try {
      const { orderId, amount, description, clientEmail, clientPhone } = req.body;
      const userId = req.user.id;

      if (!orderId || !amount || !description || !clientEmail) {
        return res.status(400).json({
          error: 'Необходимы все обязательные поля: orderId, amount, description, clientEmail'
        });
      }

      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [{ model: OrderItem, as: 'items' }]
      });

      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }

      if (order.status !== 'pending') {
        console.error(`Order already has status: ${order.status}`);
        return res.status(400).json({
          error: `Невозможно оплатить заказ с текущим статусом: ${order.status}`
        });
      }

      const amountDifference = Math.abs(Number(order.totalAmount) - Number(amount));
      if (amountDifference > 0.01) {
        return res.status(400).json({
          error: `Несоответствие суммы. Ожидается: ${order.totalAmount}`
        });
      }

      const { paymentLink, invoiceId } = await this.generatePaymentLink(
        order.id,
        Number(order.totalAmount),
        description,
        userId,
        clientEmail,
        clientPhone
      );

      await Order.update(
        {
          paykeeperId: invoiceId,
          status: 'processing_payment'
        },
        { where: { id: order.id } }
      );

      console.log('Payment link successfully generated for order:', order.id);
      return res.status(200).json({ paymentLink });

    } catch (error) {
      console.error('Payment generation failed:', error);

      const statusCode = axios.isAxiosError(error)
        ? (error.response?.status || 502)
        : 500;

      let errorMessage = 'Неизвестная ошибка платежной системы';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка взаимодействия с платежной системой';
      }

      return res.status(statusCode).json({ error: errorMessage });
    }
  }

  async generatePaymentLink(
    orderId,
    amount,
    description,
    userId,
    clientEmail,
    clientPhone
  ) {
    if (!PAYKEEPER_URL || !PAYKEEPER_USER || !PAYKEEPER_PASSWORD) {
      throw new Error('Paykeeper credentials not configured');
    }

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const base64Auth = Buffer.from(`${PAYKEEPER_USER}:${PAYKEEPER_PASSWORD}`).toString('base64');
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Auth}`
      };

      // Получаем токен
      const tokenUrl = `${PAYKEEPER_URL}/info/settings/token/`;
      console.log('Requesting token from:', tokenUrl);

      const tokenResponse = await axios.get(tokenUrl, { headers, timeout: 10000 });
      if (!tokenResponse.data?.token) {
        throw new Error('Token not received from Paykeeper');
      }
      const token = tokenResponse.data.token;

      // Формируем данные для платежа
      const paymentData = new URLSearchParams();
      paymentData.append('pay_amount', amount.toFixed(2));
      paymentData.append('orderid', orderId.toString());
      paymentData.append('service_name', description.substring(0, 128));
      paymentData.append('client_email', clientEmail);
      paymentData.append('token', token);

      if (user.firstName && user.lastName) {
        paymentData.append('clientid', `${user.lastName} ${user.firstName}`);
      }

      if (clientPhone) {
        const cleanedPhone = clientPhone.replace(/\D/g, '');
        if (cleanedPhone.length >= 10) {
          paymentData.append('client_phone', cleanedPhone);
        }
      }

      // Создаем инвойс
      const invoiceUrl = `${PAYKEEPER_URL}/change/invoice/preview/`;
      console.log('Creating invoice at:', invoiceUrl);

      const invoiceResponse = await axios.post(
        invoiceUrl,
        paymentData,
        { headers, timeout: 10000 }
      );

      if (!invoiceResponse.data?.invoice_id) {
        console.error('Invalid Paykeeper response:', invoiceResponse.data);
        throw new Error('Invoice ID not received from Paykeeper');
      }

      const paymentUrl = `${PAYKEEPER_URL}/bill/${invoiceResponse.data.invoice_id}/`;
      console.log('Payment URL generated:', paymentUrl);

      return {
        paymentLink: paymentUrl,
        invoiceId: invoiceResponse.data.invoice_id
      };

    } catch (error) {
      console.error('Payment generation error:');

      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
        });

        if (error.response?.status === 404) {
          throw new Error('Paykeeper endpoint not found. Please verify the API URL');
        }

        throw new Error(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Paykeeper API request failed'
        );
      }

      throw new Error(error instanceof Error ? error.message : 'Unknown payment error');
    }
  }

  async handleWebhook(req, res) {
    try {
      const { id, sum, orderid, status } = req.body;

      if (!id || !sum || !orderid || !status) {
        console.error('Invalid webhook data:', req.body);
        return res.status(400).json({ error: 'Недостаточно данных' });
      }

      const order = await Order.findByPk(orderid, {
        include: [{ model: OrderItem, as: 'items' }]
      });
      if (!order) {
        console.error(`Order not found: ${orderid}`);
        return res.status(404).json({ error: 'Заказ не найден' });
      }

      // Проверяем сумму с учетом возможного округления
      const amountDifference = Math.abs(Number(order.totalAmount) - Number(sum));
      if (amountDifference > 0.01) {
        console.error(`Amount mismatch. Order: ${order.totalAmount}, Payment: ${sum}`);
        await Order.update(
          { status: 'failed', paykeeperId: id },
          { where: { id: orderid } }
        );
        return res.status(400).json({ error: 'Несоответствие суммы платежа' });
      }

      // Обновляем статус на основе верифицированных данных
      const statusMap = {
        'paid': 'paid',
        'failed': 'failed',
        'cancelled': 'failed',
        'new': 'pending',
        'processing': 'processing_payment'
      };

      const orderStatus = statusMap[status.toLowerCase()] || 'failed';

      await Order.update(
        {
          status: orderStatus,
          paykeeperId: id,
          ...(orderStatus === 'paid' && { paidAt: new Date() })
        },
        { where: { id: orderid } }
      );

      console.log(`Order ${orderid} updated to status ${orderStatus} (verified)`);
      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка обработки вебхука'
      });
    }
  }

  async checkPaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({
        where: { id, userId },
        attributes: ['id', 'status', 'paykeeperId', 'totalAmount']
      });

      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }

      if (!order.paykeeperId) {
        return res.status(400).json({ error: 'Платеж не инициирован' });
      }

      // Используем наш проверенный метод
      const base64Auth = Buffer.from(`${PAYKEEPER_USER}:${PAYKEEPER_PASSWORD}`).toString('base64');
      const headers = {
        'Authorization': `Basic ${base64Auth}`,
        'Accept': 'application/json'
      };

      const response = await axios.get(
        `${PAYKEEPER_URL}/info/invoice/byid/?id=${order.paykeeperId}`,
        {
          headers,
          timeout: 10000,
          validateStatus: (status) => status < 500
        }
      );

      if (response.status === 404) {
        return res.status(400).json({ error: 'Платеж не найден в системе Paykeeper' });
      }

      if (response.status !== 200) {
        return res.status(502).json({
          error: 'Платежная система вернула ошибку',
          details: {
            status: response.status,
            data: response.data
          }
        });
      }

      const paymentData = response.data;

      const statusMap = {
        'paid': 'paid',
        'failed': 'failed',
        'cancelled': 'failed',
        'new': 'pending',
        'processing': 'processing_payment'
      };

      const normalizedStatus = paymentData.status.toLowerCase();
      const paymentStatus = statusMap[normalizedStatus] || 'failed';

      const result = {
        orderId: order.id,
        status: paymentStatus,
        statusText: paymentData.status,
        amount: paymentData.pay_amount,
        paymentId: order.paykeeperId,
        paymentDetails: {
          paidAt: paymentData.paid_at,
          paymentMethod: paymentData.payment_method
        },
        lastChecked: new Date().toISOString()
      };

      if (paymentStatus !== order.status) {
        await Order.update(
          {
            status: paymentStatus,
            ...(paymentStatus === 'paid' && {
              paidAt: paymentData.paid_at ? new Date(paymentData.paid_at) : new Date()
            })
          },
          { where: { id: order.id } }
        );
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error('Ошибка проверки статуса платежа:', error);
      return res.status(500).json({
        error: 'Ошибка при проверке статуса платежа',
        details: error instanceof Error ? error.message : undefined
      });
    }
  }

  async checkPendingPayments(req, res) {
    try {
      this.paymentStatusChecker.checkPendingPayments();
      res.status(200).json({ message: 'Проверка платежей запущена' });
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при запуске проверки платежей',
        details: error instanceof Error ? error.message : undefined
      });
    }
  }
}

module.exports = { OrderController };