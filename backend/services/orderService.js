const { pool } = require("../db");

async function createOrder(orderData) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    orderType,
    specialInstructions,
    requestedTime,
    items,
  } = orderData;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const menuItemIds = items.map((item) => item.menuItemId);

    const placeholders = menuItemIds.map(() => "?").join(",");

    const [menuItems] = await connection.query(
      `
        SELECT
          mi.id,
          mi.name,
          mi.price,
          mi.is_available AS isAvailable,
          ds.special_price AS specialPrice
        FROM menu_items mi
        LEFT JOIN daily_specials ds
          ON ds.menu_item_id = mi.id
          AND ds.special_date = CURRENT_DATE()
          AND ds.is_active = TRUE
        WHERE mi.id IN (${placeholders})
      `,
      menuItemIds,
    );

    if (menuItems.length !== menuItemIds.length) {
      const error = new Error("One or more menu items could not be found");
      error.statusCode = 400;
      throw error;
    }

    let subtotal = 0;

    const normalizedItems = items.map((requestedItem) => {
      const menuItem = menuItems.find(
        (item) => item.id === requestedItem.menuItemId,
      );

      if (!menuItem.isAvailable) {
        const error = new Error(`${menuItem.name} is currently unavailable`);
        error.statusCode = 400;
        throw error;
      }

      const quantity = Number(requestedItem.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error("Invalid item quantity");
        error.statusCode = 400;
        throw error;
      }

      const unitPrice =
        menuItem.specialPrice !== null
          ? Number(menuItem.specialPrice)
          : Number(menuItem.price);

      subtotal += unitPrice * quantity;

      return {
        menuItemId: menuItem.id,
        itemName: menuItem.name,
        quantity,
        unitPrice,
        specialInstructions: requestedItem.specialInstructions || null,
      };
    });

    /*
      Temporary tax rate.
      Later we can move this into configuration or the database.
    */
    const taxRate = 0.0875;

    const tax = Number((subtotal * taxRate).toFixed(2));

    subtotal = Number(subtotal.toFixed(2));

    const total = Number((subtotal + tax).toFixed(2));

    const [orderResult] = await connection.execute(
      `
        INSERT INTO orders (
          customer_name,
          customer_email,
          customer_phone,
          order_type,
          status,
          subtotal,
          tax,
          total,
          special_instructions,
          requested_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        customerName,
        customerEmail || null,
        customerPhone || null,
        orderType,
        "pending",
        subtotal,
        tax,
        total,
        specialInstructions || null,
        requestedTime || null,
      ],
    );

    const orderId = orderResult.insertId;

    for (const item of normalizedItems) {
      await connection.execute(
        `
          INSERT INTO order_items (
            order_id,
            menu_item_id,
            item_name,
            quantity,
            unit_price,
            special_instructions
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.menuItemId,
          item.itemName,
          item.quantity,
          item.unitPrice,
          item.specialInstructions,
        ],
      );
    }

    await connection.commit();

    return {
      orderId,
      status: "pending",
      subtotal,
      tax,
      total,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findOrderById(orderId) {
  const [orders] = await pool.execute(
    `
      SELECT
        id,
        customer_name AS customerName,
        customer_email AS customerEmail,
        customer_phone AS customerPhone,
        order_type AS orderType,
        status,
        subtotal,
        tax,
        total,
        special_instructions AS specialInstructions,
        requested_time AS requestedTime,
        created_at AS createdAt
      FROM orders
      WHERE id = ?
      LIMIT 1
    `,
    [orderId],
  );

  if (orders.length === 0) {
    return null;
  }

  const [items] = await pool.execute(
    `
      SELECT
        id,
        menu_item_id AS menuItemId,
        item_name AS itemName,
        quantity,
        unit_price AS unitPrice,
        special_instructions AS specialInstructions
      FROM order_items
      WHERE order_id = ?
      ORDER BY id
    `,
    [orderId],
  );

  return {
    ...orders[0],
    items,
  };
}

module.exports = {
  createOrder,
  findOrderById,
};
