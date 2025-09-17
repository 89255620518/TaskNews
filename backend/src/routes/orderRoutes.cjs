const express = require("express");
const { OrderController } = require("../controllers/orderController.cjs");
const { authenticate } = require("../middlewares/authMiddleware.cjs");

const router = express.Router();
const orderController = new OrderController(); 

// Создание заказа (требуется авторизация)
router.post("/", authenticate, async (req, res) => {
  try {
    await orderController.createOrder(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при создании заказа" });
  }
});

// Получение списка заказов (требуется авторизация)
router.get("/", authenticate, async (req, res) => {
  try {
    await orderController.getOrders(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при получении заказов" });
  }
});

// Получение конкретного заказа по ID (требуется авторизация)
router.get("/:id", authenticate, async (req, res) => {
  try {
    await orderController.getOrder(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при получении заказа" });
  }
});

// Обновление статуса заказа (требуется авторизация)
router.put("/:id/status", authenticate, async (req, res) => {
  try {
    await orderController.updateStatus(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при обновлении заказа" });
  }
});

// Удаление заказа (требуется авторизация)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await orderController.deleteOrder(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при удалении заказа" });
  }
});

// Генерация платежной ссылки (требуется авторизация)
router.post("/payment", authenticate, async (req, res) => {
  try {
    await orderController.generatePayment(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании платежа" });
  }
});

// Вебхук для Paykeeper (не требует авторизации)
router.post("/paykeeper-webhook", async (req, res) => {
  try {
    await orderController.handleWebhook(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка обработки вебхука Paykeeper" });
  }
});

router.get("/:id/payment-status", authenticate, async (req, res) => {
  try {
    await orderController.checkPaymentStatus(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка обработки статуса платежа" })
  }
});

router.get("/check-payments", authenticate, async (req, res) => {
  try {
    await orderController.checkPendingPayments(req, res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка обработки статуса платежа" })
  }
});


module.exports = router;