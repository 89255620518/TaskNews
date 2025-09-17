import nodemailer from "nodemailer";
import { OrderStatus } from "models/Orders";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  comment?: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  orders: OrderItem[];
  totalAmount: number;
  status: OrderStatus; // Добавляем статус заказа
  paykeeperId?: string; // ID платежа (если есть)
  paidAt?: Date; // Дата оплаты (если есть)
}

export const sendEmail = async (orderDetails: OrderDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "server61.hosting.reg.ru",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Определяем статус оплаты
    const paymentStatus = orderDetails.status === 'paid' ? 'Оплачен' : 'Не оплачен';
    const paymentDetails = orderDetails.status === 'paid' 
      ? ` (ID платежа: ${orderDetails.paykeeperId}, Дата оплаты: ${orderDetails.paidAt})`
      : '';

    // Формируем текст письма
    let emailText = `Заказ на доставку от ${orderDetails.firstName} ${orderDetails.lastName}\n`;
    emailText += `Телефон пользователя: ${orderDetails.phone}\n`;
    emailText += `Почта пользователя: ${orderDetails.email}\n`;
    emailText += `Дата и время доставки: ${orderDetails.deliveryDate} в ${orderDetails.deliveryTime}\n`;
    emailText += `Адрес доставки: ${orderDetails.deliveryAddress}\n`;
    
    if (orderDetails.comment) {
      emailText += `Комментарий к заказу: ${orderDetails.comment}\n\n`;
    }
    
    emailText += `Заказы:\n\n`;
    
    orderDetails.orders.forEach((order, index) => {
      emailText += `Заказ ${index + 1}:\n`;
      emailText += `Название: ${order.name}\n`;
      emailText += `Количество: ${order.quantity}\n`;
      emailText += `Сумма: ${order.price * order.quantity} руб.\n\n`;
    });
    
    emailText += `Общая сумма: ${orderDetails.totalAmount} руб.\n`;
    emailText += `Статус оплаты: ${paymentStatus}${paymentDetails}`;

    const info = await transporter.sendMail({
      from: `"Shashlandia" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Отправляем письмо себе (админу)
      subject: `Новый заказ от ${orderDetails.firstName} ${orderDetails.lastName}`,
      text: emailText,
    });

    console.log("Order notification sent:", info.messageId);
  } catch (error) {
    console.error("Error sending order notification:", error);
  }
};