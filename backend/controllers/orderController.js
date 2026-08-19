const orderService = require("../services/orderService");

const businessHoursService = require("../services/businessHoursService");

async function createOrder(req, res, next) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      pickupDate,
      pickupTime,
      specialInstructions,
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

    /*
     * Validate pickup date/time against the
     * restaurant's available slots.
     */
    if (orderType === "pickup") {
      if (!pickupDate || !pickupTime) {
        return res.status(400).json({
          message: "Pickup date and time are required",
        });
      }

      const validation = await businessHoursService.validatePickupTime(
        pickupDate,
        pickupTime,
      );

      if (!validation.valid) {
        return res.status(400).json({
          message: validation.message,
        });
      }
    }

    const result = await orderService.createOrder({
      customerName: customerName.trim(),

      customerEmail: customerEmail?.trim() || null,

      customerPhone: customerPhone?.trim() || null,

      orderType,

      pickupDate: orderType === "pickup" ? pickupDate : null,

      pickupTime: orderType === "pickup" ? pickupTime : null,

      specialInstructions: specialInstructions?.trim() || null,

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
