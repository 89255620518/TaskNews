import cron from "node-cron";
import { User } from "../models/User";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";

// Функция для проверки валидности токена
const isTokenValid = (token: string): boolean => {
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return true;
  } catch {
    return false;
  }
};

export const checkUserStatus = async () => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    // Получаем всех пользователей с их токенами (если храните в базе)
    const users = await User.findAll({
      attributes: ['id', 'lastActivity', 'status']
    });
    
    for (const user of users) {
      // Проверяем, был ли пользователь активен в последние 15 минут
      // и имеет ли он действительный токен (это можно расширить)
      const isActive = user.lastActivity && user.lastActivity >= fifteenMinutesAgo;
      
      if (isActive && user.status !== "active") {
        await user.update({ status: "active" });
        console.log(`Пользователь ${user.id} теперь активен`);
      } else if (!isActive && user.status !== "inactive") {
        await user.update({ status: "inactive" });
        console.log(`Пользователь ${user.id} теперь неактивен`);
      }
    }
    
    console.log(`Статусы пользователей проверены`);
  } catch (error) {
    console.error("Ошибка при проверке статусов:", error);
  }
};

export const startStatusCronJob = () => {
  // Проверяем каждые 5 минут
  cron.schedule('*/5 * * * *', () => {
    console.log("Проверка статусов пользователей...");
    checkUserStatus();
  });
  
  console.log("Запуск проверки статусов пользователей...");
  checkUserStatus();
};