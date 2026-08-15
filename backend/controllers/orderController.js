const orderService = require("../services/orderService");

async function createOrder(req, res, next) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      specialInstructions,
      requestedTime,
      items,
    } = req.body;

    if (!customerName?.trim()) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your order must contain at least one item",
      });
    }

    if (!["pickup", "dine-in"].includes(orderType)) {
      return res.status(400).json({
        message: "Invalid order type",
      });
    }

    const result = await orderService.createOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim() || null,
      customerPhone: customerPhone?.trim() || null,
      orderType,
      specialInstructions: specialInstructions?.trim() || null,
      requestedTime: requestedTime || null,
      items,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await orderService.findOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrderById,
};
