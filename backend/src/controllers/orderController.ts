import { Request, Response } from 'express';
import axios from 'axios';
import { Order, OrderStatus } from '../models/Orders';
import { OrderItem } from '../models/OrderItems';
import { createRequire } from "module";
import { User } from '../models/User';
import { sendEmail } from 'utils/sendEmain';
import { Op, Sequelize } from 'sequelize';


const requires = createRequire(import.meta.url);
const { sequelize } = requires("../config/config.cjs"); 

interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface GeneratePaymentData {
  orderId: number;
  amount: number;
  description: string;
  clientEmail: string;
  clientPhone?: string;
}

interface OrderResponse {
  id: number;
  userId: number;
  totalAmount: number;
  deliveryAddress: string;
  deliveryTime: Date;
  deliveryCost: number;
  status: OrderStatus;
  paykeeperId: string | null | undefined; 
  items: OrderItem[];
  paymentLink?: string;
}

interface PaymentStatusResponse {
  orderId: number;
  status: string;
  statusText: string;
  amount?: number;
  paymentId?: string | null;
  paymentDetails?: {
    paidAt?: string;
    paymentMethod?: string;
  };
  lastChecked: string;
  details?: any; 
}

interface OrderDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: any;
  orders: {
    name: any;
    quantity: any;
    price: any;
  }[];
  totalAmount: any;
  comment: any;
  status: OrderStatus; // Используем наш тип вместо string
}

// const PAYKEEPER_URL = process.env.PAYKEEPER_URL!;
// const PAYKEEPER_USER = process.env.PAYKEEPER_USER!;
// const PAYKEEPER_PASSWORD = process.env.PAYKEEPER_PASSWORD!;
const PAYKEEPER_URL="https://tyteda-1.server.paykeeper.ru";
const PAYKEEPER_USER="admin";
const PAYKEEPER_PASSWORD="1234567Asd!";

class PaymentStatusChecker {
  private intervalId: NodeJS.Timeout | null = null;
  private isChecking = false;
  private retryDelays = [1000, 3000, 5000, 10000];
  
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
          status: ['pending', 'processing_payment'],
          paykeeperId: { [Op.not]: null },
          createdAt: { [Op.gte]: Sequelize.literal(`NOW() - INTERVAL '24 HOURS'`) }
        },
        limit: 100,
        order: [['createdAt', 'ASC']]
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
  
  private async checkSingleOrderStatus(order: Order) {
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
  
  private mapPaymentStatus(paykeeperStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      'paid': 'paid',
      'failed': 'failed',
      'cancelled': 'failed',
      'new': 'pending',
      'processing': 'processing_payment'
    };
    
    return statusMap[paykeeperStatus.toLowerCase()] || 'failed';
  }
  
  private async updateOrderStatus(order: Order, newStatus: OrderStatus, paymentData: any) {
    const updateData: Partial<Order> = {
      status: newStatus,
      ...(newStatus === 'paid' && { paidAt: new Date(paymentData.paid_at || new Date()) })
    };
    
    await Order.update(updateData, { where: { id: order.id } });
    console.log(`Статус заказа ${order.id} обновлен на ${newStatus}`);
  }
}

export class OrderController {
  private paymentStatusChecker: PaymentStatusChecker;

  constructor() {
    this.paymentStatusChecker = new PaymentStatusChecker();
    this.paymentStatusChecker.start();
  }

  async createOrder(
    req: Request,
    res: Response<OrderResponse | { error: string }>
  ) {
    const transaction = await sequelize.transaction(); 
    try {
      const { cart, deliveryAddress, deliveryTime, totalAmount, deliveryCost = 0 } = req.body;
      const userId = (req as any).user.id;
  
      // Валидация данных
      if (!cart || !Array.isArray(cart) || !deliveryAddress || !deliveryTime || !totalAmount) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Недостаточно данных для заказа' });
      }

      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
  
      // Проверка суммы
      const calculatedTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryCost;
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Неверная итоговая сумма' });
      }
  
      // Проверка даты доставки
      if (new Date(deliveryTime) < new Date()) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Некорректная дата доставки' });
      }
  
      
  
      try {
        // Создаем заказ
        const order = await Order.create({
          userId,
          totalAmount,
          deliveryAddress,
          deliveryTime: new Date(deliveryTime),
          deliveryCost,
          status: 'pending',
          paykeeperId: null,
        }, { transaction });
  
        // Создаем элементы заказа
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
          status: 'pending' as OrderStatus
        };

        await sendEmail(orderDetails);
  
        await transaction.commit();
  
        // Формируем ответ без paymentLink
        const response: OrderResponse = {
          ...order.get({ plain: true }),
          items: createdItems,
          paykeeperId: order.paykeeperId ?? null, // если paykeeperId undefined, то устанавливаем null
        };
  
        res.status(201).json(response);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error: unknown) {
      await transaction.rollback(); 
      if (error instanceof Error) {

        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Ошибка при создании заказа' });
      }
    }
  }

  async getOrders(req: Request, res: Response<OrderWithItems[] | { error: string }>) {
    try {
      const userId = (req as any).user.id;
      
      const orders = await Order.findAll({ 
        where: { userId },
        include: [{ 
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'name', 'quantity', 'price', 'total']
        }],
        order: [['created_at', 'DESC']]
      }) as OrderWithItems[];;

      res.status(200).json(orders);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Ошибка при получении заказов' });
      }
    }
  }

  async getOrder(req: Request, res: Response<OrderWithItems | { error: string }>) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const order = await Order.findOne({ 
        where: { id, userId },
        include: [{ 
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'name', 'quantity', 'price', 'total']
        }]
      }) as OrderWithItems | null;;

      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }

      res.status(200).json(order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Ошибка при получении заказа' });
      }
    }
  }

  async updateStatus(req: Request, res: Response<{ message: string } | { error: string }>) {
    try {
      const { status } = req.body;
      const userId = (req as any).user.id;
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Ошибка при обновлении заказа' });
      }
    }
  }

  async deleteOrder(req: Request, res: Response<{ message: string } | { error: string }>) {
    try {
      const userId = (req as any).user.id;
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Ошибка при удалении заказа' });
      }
    }
  }

  async generatePayment(
    req: Request,
    res: Response<{ paymentLink: string } | { error: string }>
  ) {
    try {
      const { orderId, amount, description, clientEmail, clientPhone } = req.body;
      const userId = (req as any).user.id;
  
      console.log('Starting payment generation for order:', orderId);
  
      // 1. Валидация входных данных
      if (!orderId || !amount || !description || !clientEmail) {
        console.error('Missing required fields:', { orderId, amount, description, clientEmail });
        return res.status(400).json({ error: 'Необходимы все обязательные поля: orderId, amount, description, clientEmail' });
      }
  
      // 2. Поиск заказа
      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [{ model: OrderItem, as: 'items' }]
      });
  
      if (!order) {
        console.error(`Order not found (orderId: ${orderId}, userId: ${userId})`);
        return res.status(404).json({ error: 'Заказ не найден' });
      }
  
      // 3. Проверка статуса заказа
      if (order.status !== 'pending') {
        console.error(`Order already has status: ${order.status}`);
        return res.status(400).json({ 
          error: `Невозможно оплатить заказ с текущим статусом: ${order.status}`
        });
      }
  
      // 4. Проверка суммы
      const amountDifference = Math.abs(Number(order.totalAmount) - Number(amount));
      if (amountDifference > 0.01) {
        console.error(`Amount mismatch. Order: ${order.totalAmount}, Provided: ${amount}`);
        return res.status(400).json({ 
          error: `Несоответствие суммы. Ожидается: ${order.totalAmount}`
        });
      }
  
      // 5. Генерация платежной ссылки
      console.log('Generating payment link for order:', order.id);
      const { paymentLink, invoiceId } = await this.generatePaymentLink(
        order.id,
        Number(order.totalAmount),
        description,
        userId,
        clientEmail,
        clientPhone
      );
  
      // 6. Обновление статуса заказа
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
      
      // Определение кода ошибки
      const statusCode = axios.isAxiosError(error) 
        ? (error.response?.status || 502)
        : 500;
  
      // Формирование сообщения об ошибке
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
  
  private async generatePaymentLink(
    orderId: number,
    amount: number,
    description: string,
    userId: number,
    clientEmail: string,
    clientPhone?: string
  ): Promise<{ paymentLink: string; invoiceId: string} > {
    // 1. Проверка конфигурации
    if (!PAYKEEPER_URL || !PAYKEEPER_USER || !PAYKEEPER_PASSWORD) {
      throw new Error('Paykeeper credentials not configured');
    }
  
    console.log('Starting payment generation for order:', orderId);
  
    try {
      // 2. Получение данных пользователя
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
  
      // 3. Подготовка заголовков с Basic Auth
      const base64Auth = Buffer.from(`${PAYKEEPER_USER}:${PAYKEEPER_PASSWORD}`).toString('base64');
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Auth}`
      };
  
      // 4. Получение токена
      const tokenUrl = `${PAYKEEPER_URL}/info/settings/token/`;
      console.log('Requesting token from:', tokenUrl);
  
      const tokenResponse = await axios.get(tokenUrl, { headers, timeout: 10000 });
      if (!tokenResponse.data?.token) {
        throw new Error('Token not received from Paykeeper');
      }
      const token = tokenResponse.data.token;
  
      // 5. Подготовка данных платежа
      const paymentData = new URLSearchParams();
      paymentData.append('pay_amount', amount.toFixed(2));
      paymentData.append('orderid', orderId.toString());
      paymentData.append('service_name', description.substring(0, 128));
      paymentData.append('client_email', clientEmail);
      paymentData.append('token', token);
  
      // Добавление дополнительных полей
      if (user.firstName && user.lastName) {
        paymentData.append('clientid', `${user.lastName} ${user.firstName}`);
      }
  
      if (clientPhone) {
        const cleanedPhone = clientPhone.replace(/\D/g, '');
        if (cleanedPhone.length >= 10) {
          paymentData.append('client_phone', cleanedPhone);
        }
      }
  
      // 6. Создание инвойса
      const invoiceUrl = `${PAYKEEPER_URL}/change/invoice/preview/`;
      console.log('Creating invoice at:', invoiceUrl);
  
      const invoiceResponse = await axios.post(
        invoiceUrl,
        paymentData,
        { headers, timeout: 10000 }
      );
  
      // 7. Проверка ответа
      if (!invoiceResponse.data?.invoice_id) {
        console.error('Invalid Paykeeper response:', invoiceResponse.data);
        throw new Error('Invoice ID not received from Paykeeper');
      }
  
      // 8. Формирование ссылки на оплату
      const paymentUrl = `${PAYKEEPER_URL}/bill/${invoiceResponse.data.invoice_id}/`;
      console.log('Payment URL generated:', paymentUrl);
  
      return {
        paymentLink: paymentUrl,
        invoiceId: invoiceResponse.data.invoice_id // Возвращаем ID инвойса
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

  async handleWebhook(req: Request, res: Response) {
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

      const amountDifference = Math.abs(Number(order.totalAmount) - Number(sum));
      if (amountDifference > 0.01) {
        console.error(`Amount mismatch. Order: ${order.totalAmount}, Payment: ${sum}`);
        await Order.update(
          { status: 'failed', paykeeperId: id },
          { where: { id: orderid } }
        );
        return res.status(400).json({ error: 'Несоответствие суммы платежа' });
      }

      type OrderStatus = 'failed' | 'paid' | 'pending' | 'completed' | 'processing_payment';

      const statusMap: Record<string, OrderStatus> = {
        'paid': 'paid',
        'failed': 'failed',
        'cancelled': 'failed',
        'new': 'pending',
        'processing': 'processing_payment'
      };

      const orderStatus = statusMap[status.toLowerCase()] || 'failed';

      await Order.update(
        { 
          status: orderStatus as OrderStatus, 
          paykeeperId: id,
          ...(orderStatus === 'paid' && { paidAt: new Date() })
        },
        { where: { id: orderid } }
      );

      console.log(`Order ${orderid} updated to status ${orderStatus}`);
      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Ошибка обработки вебхука' 
      });
    }
  }
  
  async checkPaymentStatus(
    req: Request,
    res: Response<PaymentStatusResponse | { error: string }>
  ) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // 1. Получаем заказ с проверкой принадлежности пользователю
      const order = await Order.findOne({
        where: { id, userId },
        include: [{ model: OrderItem, as: 'items' }]
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }
      
      if (!order.paykeeperId) {
        return res.status(400).json({ error: 'Платеж не инициирован' });
      }
      
      // 2. Настройка запроса к Paykeeper
      const base64Auth = Buffer.from(`${PAYKEEPER_USER}:${PAYKEEPER_PASSWORD}`).toString('base64');
      const headers = { 
        'Authorization': `Basic ${base64Auth}`,
        'Accept': 'application/json'
      };
      
      // 3. Запрос статуса платежа
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
      
      // 4. Безопасное преобразование статуса
      type PaykeeperStatus = 'paid' | 'failed' | 'cancelled' | 'new' | 'processing';
      type StatusMap = Record<PaykeeperStatus, OrderStatus>;
      
      const statusMap: StatusMap = {
        'paid': 'paid',
        'failed': 'failed',
        'cancelled': 'failed',
        'new': 'pending',
        'processing': 'processing_payment'
      };
      
      const normalizedStatus = paymentData.status.toLowerCase() as PaykeeperStatus;
      const paymentStatus = statusMap[normalizedStatus] || 'failed';
      
      // 5. Формирование ответа
      const result: PaymentStatusResponse = {
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
      
      // 6. Обновление статуса заказа при необходимости
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
      
      // Обработка различных типов ошибок
      if (axios.isAxiosError(error)) {
        return res.status(502).json({ 
          error: 'Ошибка соединения с платежной системой',
          details: error.response?.data || error.message
        });
      }
      
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
  
  async checkPendingPayments(req: Request, res: Response) {
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
