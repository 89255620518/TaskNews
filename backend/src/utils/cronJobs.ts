import cron from "node-cron";
import { User } from "../models/User";

export const checkUserStatus = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Находим всех пользователей
    const users = await User.findAll();
    
    for (const user of users) {
      if (user.lastActivity && user.lastActivity >= fiveMinutesAgo) {
        // Пользователь активен (был онлайн последние 5 минут)
        if (user.status !== "active") {
          await user.update({ status: "active" });
          console.log(`Пользователь ${user.email} теперь активен`);
        }
      } else {
        // Пользователь неактивен
        if (user.status !== "inactive") {
          await user.update({ status: "inactive" });
          console.log(`Пользователь ${user.email} теперь неактивен`);
        }
      }
    }
    
    console.log(`Статусы пользователей проверены и обновлены`);
  } catch (error) {
    console.error("Ошибка при проверке статусов:", error);
  }
};

export const startStatusCronJob = () => {
  // Проверяем каждые 2 минуты
  cron.schedule('*/2 * * * *', () => {
    console.log("Проверка статусов пользователей...");
    checkUserStatus();
  });
  
  // Запускаем сразу при старте
  console.log("Запуск проверки статусов пользователей...");
  checkUserStatus();
};