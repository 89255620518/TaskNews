// const nodemailer = require("nodemailer");

// const sendEmail = async (orderDetails) => {
//   // Конфигурация SMTP (аналогичная Django-настройкам)
//   const smtpConfig = {
//     host: "mx1.hosting.reg.ru",
//     port: 465, // Используем порт 465 как в рабочих настройках
//     secure: true, // SSL как в EMAIL_USE_SSL = True
//     auth: {
//       user: "orders@tyteda.ru",
//       pass: "jM9iU6nF9icM8tX0"
//     },
//     tls: {
//       rejectUnauthorized: false // Игнорируем ошибки сертификата
//     },
//     connectionTimeout: 10000,
//     socketTimeout: 15000,
//     logger: true,
//     debug: true
//   };

//   // Создаем транспорт один раз (можно вынести наружу для reuse)
//   const transporter = nodemailer.createTransport(smtpConfig);

//   try {
//     // 1. Проверка соединения с расширенным логгированием
//     await transporter.verify();
//     console.log("SMTP подключение успешно установлено");

//     // 2. Формирование письма с улучшенной структурой
//     const formatMoney = (amount) => 
//       new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

//     const paymentStatus = orderDetails.status === 'paid' ? 'Оплачен' : 'Не оплачен';
    
//     // Текстовая версия
//     let textContent = [
//       `Заказ на доставку от ${orderDetails.firstName} ${orderDetails.lastName}`,
//       `Телефон: ${orderDetails.phone}`,
//       `Email: ${orderDetails.email}`,
//       `Дата/время доставки: ${orderDetails.deliveryDate} в ${orderDetails.deliveryTime}`,
//       `Адрес: ${orderDetails.deliveryAddress}`,
//       ...(orderDetails.comment ? [`Комментарий: ${orderDetails.comment}`] : []),
//       '',
//       'Состав заказа:',
//       ...orderDetails.orders.map((order, i) => [
//         `${i+1}. ${order.name}`,
//         `Кол-во: ${order.quantity}`,
//         `Цена: ${formatMoney(order.price)}`,
//         `Сумма: ${formatMoney(order.price * order.quantity)}`,
//         ''
//       ].join('\n')),
//       `Итого: ${formatMoney(orderDetails.totalAmount)}`,
//       `Статус оплаты: ${paymentStatus}`
//     ].join('\n');

//     // HTML-версия (более читаемая)
//     let htmlContent = `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//         <h2>Новый заказ от ${orderDetails.firstName} ${orderDetails.lastName}</h2>
//         <p><strong>Контактные данные:</strong></p>
//         <ul>
//           <li>Телефон: ${orderDetails.phone}</li>
//           <li>Email: ${orderDetails.email}</li>
//           <li>Адрес доставки: ${orderDetails.deliveryAddress}</li>
//           <li>Дата/время: ${orderDetails.deliveryDate} в ${orderDetails.deliveryTime}</li>
//           ${orderDetails.comment ? `<li>Комментарий: ${orderDetails.comment}</li>` : ''}
//         </ul>
        
//         <h3>Детали заказа:</h3>
//         <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Название</th>
//               <th>Кол-во</th>
//               <th>Цена</th>
//               <th>Сумма</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${orderDetails.orders.map((order, i) => `
//               <tr>
//                 <td>${i+1}</td>
//                 <td>${order.name}</td>
//                 <td>${order.quantity}</td>
//                 <td>${formatMoney(order.price)}</td>
//                 <td>${formatMoney(order.price * order.quantity)}</td>
//               </tr>
//             `).join('')}
//           </tbody>
//           <tfoot>
//             <tr>
//               <td colspan="4" style="text-align: right;"><strong>Итого:</strong></td>
//               <td><strong>${formatMoney(orderDetails.totalAmount)}</strong></td>
//             </tr>
//             <tr>
//               <td colspan="5">Статус оплаты: <strong>${paymentStatus}</strong></td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     `;

//     // 3. Отправка письма
//     const mailOptions = {
//       from: '"Поминки-Доставка" <orders@tyteda.ru>', // Как DEFAULT_FROM_EMAIL
//       to: "orders@tyteda.ru",// Скрытая копия (при необходимости)
//       subject: `Новый заказ №${orderDetails.id || ''} от ${orderDetails.firstName} ${orderDetails.lastName}`,
//       text: textContent,
//       html: htmlContent,
//       // Можно добавить вложения при необходимости:
//       // attachments: [{
//       //   filename: 'order.pdf',
//       //   content: pdfBuffer
//       // }]
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("Письмо успешно отправлено:", {
//       messageId: info.messageId,
//       accepted: info.accepted,
//       rejected: info.rejected
//     });

//     return true;
//   } catch (error) {
//     console.error("Ошибка отправки письма:", {
//       error: {
//         name: error.name,
//         message: error.message,
//         code: error.code,
//         stack: error.stack
//       },
//       lastSMTPResponse: error.response,
//       smtpConfig: {
//         ...smtpConfig,
//         auth: { ...smtpConfig.auth, pass: '***' } // Маскируем пароль в логах
//       }
//     });
//     throw new Error(`Не удалось отправить письмо: ${error.message}`);
//   }
// };

// module.exports = { sendEmail };

const nodemailer = require("nodemailer");

const sendEmail = async (orderDetails) => {
  // Конфигурация SMTP (аналогичная Django-настройкам)
  const smtpConfig = {
    host: "mx1.hosting.reg.ru",
    port: 465, // Используем порт 465 как в рабочих настройках
    secure: true, // SSL как в EMAIL_USE_SSL = True
    auth: {
      user: "orders@tyteda.ru",
      pass: "jM9iU6nF9icM8tX0"
    },
    tls: {
      rejectUnauthorized: false // Игнорируем ошибки сертификата
    },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    logger: true,
    debug: true
  };

  // Создаем транспорт один раз (можно вынести наружу для reuse)
  const transporter = nodemailer.createTransport(smtpConfig);

  try {
    // 1. Проверка соединения с расширенным логгированием
    await transporter.verify();
    console.log("SMTP подключение успешно установлено");

    // 2. Формирование письма с улучшенной структурой
    const formatMoney = (amount) => 
      new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

    const paymentStatus = orderDetails.status === 'paid' ? 'Оплачен' : 'Не оплачен';
    
    // Функция для форматирования времени в 24-часовой формат
    const formatTimeTo24Hour = (timeStr) => {
      if (!timeStr) return '';
      
      // Пытаемся разобрать время в формате "07:01 PM"
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      
      if (modifier === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
      }
      if (modifier === 'AM' && hours === '12') {
        hours = '00';
      }
      
      return `${hours}:${minutes}`;
    };

    const deliveryTime24 = formatTimeTo24Hour(orderDetails.deliveryTime);
    
    // Текстовая версия
    let textContent = [
      `Заказ на доставку от ${orderDetails.firstName} ${orderDetails.lastName}`,
      `Телефон: ${orderDetails.phone}`,
      `Email: ${orderDetails.email}`,
      `Дата/время доставки: ${orderDetails.deliveryDate} в ${deliveryTime24}`,
      `Адрес: ${orderDetails.deliveryAddress}`,
      ...(orderDetails.comment ? [`Комментарий: ${orderDetails.comment}`] : []),
      '',
      'Состав заказа:',
      ...orderDetails.orders.map((order, i) => [
        `${i+1}. ${order.name}`,
        `Кол-во: ${order.quantity}`,
        `Цена: ${formatMoney(order.price)}`,
        `Сумма: ${formatMoney(order.price * order.quantity)}`,
        ''
      ].join('\n')),
      `Итого: ${formatMoney(orderDetails.totalAmount)}`,
      `Статус оплаты: ${paymentStatus}`
    ].join('\n');

    // HTML-версия (более читаемая)
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Новый заказ от ${orderDetails.firstName} ${orderDetails.lastName}</h2>
        <p><strong>Контактные данные:</strong></p>
        <ul>
          <li>Телефон: ${orderDetails.phone}</li>
          <li>Email: ${orderDetails.email}</li>
          <li>Адрес доставки: ${orderDetails.deliveryAddress}</li>
          <li>Дата/время: ${orderDetails.deliveryDate} в ${deliveryTime24}</li>
          ${orderDetails.comment ? `<li>Комментарий: ${orderDetails.comment}</li>` : ''}
        </ul>
        
        <h3>Детали заказа:</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>#</th>
              <th>Название</th>
              <th>Кол-во</th>
              <th>Цена</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.orders.map((order, i) => `
              <tr>
                <td>${i+1}</td>
                <td>${order.name}</td>
                <td>${order.quantity}</td>
                <td>${formatMoney(order.price)}</td>
                <td>${formatMoney(order.price * order.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right;"><strong>Итого:</strong></td>
              <td><strong>${formatMoney(orderDetails.totalAmount)}</strong></td>
            </tr>
            <tr>
              <td colspan="5">Статус оплаты: <strong>${paymentStatus}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    // 3. Отправка письма
    const mailOptions = {
      from: '"Поминки-Доставка" <orders@tyteda.ru>', // Как DEFAULT_FROM_EMAIL
      to: "orders@tyteda.ru",// Скрытая копия (при необходимости)
      subject: `Новый заказ №${orderDetails.id || ''} от ${orderDetails.firstName} ${orderDetails.lastName}`,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Письмо успешно отправлено:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return true;
  } catch (error) {
    console.error("Ошибка отправки письма:", {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      lastSMTPResponse: error.response,
      smtpConfig: {
        ...smtpConfig,
        auth: { ...smtpConfig.auth, pass: '***' } // Маскируем пароль в логах
      }
    });
    throw new Error(`Не удалось отправить письмо: ${error.message}`);
  }
};

module.exports = { sendEmail };