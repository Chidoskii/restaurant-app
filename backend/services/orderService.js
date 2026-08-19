const { pool } = require("../db");

async function createOrder(orderData) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    orderType,
    pickupDate,
    pickupTime,
    specialInstructions,
    items,
  } = orderData;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let subtotal = 0;

    const normalizedItems = [];

    for (const requestedItem of items) {
      const quantity = Number(requestedItem.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error("Invalid item quantity");
        error.statusCode = 400;
        throw error;
      }

      /*
       * Get the menu item and today's special price.
       */
      const [menuRows] = await connection.execute(
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

          WHERE mi.id = ?
          LIMIT 1
        `,
        [requestedItem.menuItemId],
      );

      if (menuRows.length === 0) {
        const error = new Error("One or more menu items could not be found");
        error.statusCode = 400;
        throw error;
      }

      const menuItem = menuRows[0];

      if (!menuItem.isAvailable) {
        const error = new Error(`${menuItem.name} is currently unavailable`);
        error.statusCode = 400;
        throw error;
      }

      /*
       * Start with the authoritative database price.
       */
      let unitPrice =
        menuItem.specialPrice !== null
          ? Number(menuItem.specialPrice)
          : Number(menuItem.price);

      const optionIds = requestedItem.optionIds || [];

      /*
       * Get all options that the customer claims to have selected.
       *
       * Important:
       * The join through menu_item_option_groups verifies that each
       * option is actually allowed for this specific menu item.
       */
      let selectedOptions = [];

      if (optionIds.length > 0) {
        const placeholders = optionIds.map(() => "?").join(",");

        const [optionRows] = await connection.query(
          `
            SELECT
              o.id,
              o.name AS optionName,
              o.price_adjustment AS priceAdjustment,
              og.id AS groupId,
              og.name AS groupName,
              og.selection_type AS selectionType,
              og.is_required AS isRequired,
              og.min_selections AS minSelections,
              og.max_selections AS maxSelections
            FROM options o

            INNER JOIN option_groups og
              ON og.id = o.option_group_id

            INNER JOIN menu_item_option_groups miog
              ON miog.option_group_id = og.id

            WHERE miog.menu_item_id = ?
              AND o.id IN (${placeholders})
              AND o.is_active = TRUE
              AND og.is_active = TRUE
          `,
          [requestedItem.menuItemId, ...optionIds],
        );

        /*
         * Prevent someone from sending an option ID that doesn't
         * belong to this menu item.
         */
        if (optionRows.length !== optionIds.length) {
          const error = new Error(
            `Invalid customization selected for ${menuItem.name}`,
          );
          error.statusCode = 400;
          throw error;
        }

        selectedOptions = optionRows.map((option) => ({
          optionId: option.id,
          groupId: option.groupId,
          groupName: option.groupName,
          optionName: option.optionName,
          priceAdjustment: Number(option.priceAdjustment),
          selectionType: option.selectionType,
        }));

        for (const option of selectedOptions) {
          unitPrice += option.priceAdjustment;
        }
      }

      /*
       * Validate required option groups.
       */
      const [requiredGroups] = await connection.execute(
        `
          SELECT
            og.id,
            og.name,
            og.selection_type AS selectionType,
            og.min_selections AS minSelections,
            og.max_selections AS maxSelections
          FROM option_groups og

          INNER JOIN menu_item_option_groups miog
            ON miog.option_group_id = og.id

          WHERE miog.menu_item_id = ?
            AND og.is_required = TRUE
            AND og.is_active = TRUE
        `,
        [requestedItem.menuItemId],
      );

      for (const group of requiredGroups) {
        const selectedForGroup = selectedOptions.filter(
          (option) => option.groupId === group.id,
        );

        if (selectedForGroup.length < group.minSelections) {
          const error = new Error(
            `${group.name} is required for ${menuItem.name}`,
          );
          error.statusCode = 400;
          throw error;
        }
      }

      /*
       * Validate single vs multiple selection groups.
       */
      const groupedSelections = {};

      for (const option of selectedOptions) {
        if (!groupedSelections[option.groupId]) {
          groupedSelections[option.groupId] = [];
        }

        groupedSelections[option.groupId].push(option);
      }

      for (const groupId of Object.keys(groupedSelections)) {
        const groupOptions = groupedSelections[groupId];

        const group = groupOptions[0];

        if (group.selectionType === "single" && groupOptions.length > 1) {
          const error = new Error(
            `Only one option may be selected for ${group.groupName}`,
          );
          error.statusCode = 400;
          throw error;
        }
      }

      unitPrice = Number(unitPrice.toFixed(2));

      subtotal += unitPrice * quantity;

      normalizedItems.push({
        menuItemId: menuItem.id,
        itemName: menuItem.name,
        quantity,
        unitPrice,
        specialInstructions: requestedItem.specialInstructions || null,
        selectedOptions,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    /*
     * Temporary tax value.
     */
    const taxRate = 0.0875;

    const tax = Number((subtotal * taxRate).toFixed(2));

    const total = Number((subtotal + tax).toFixed(2));

    /*
     * Create main order.
     */
    const [orderResult] = await connection.execute(
      `
          INSERT INTO orders (
            customer_name,
            customer_email,
            customer_phone,
            order_type,
            pickup_date,
            pickup_time,
            status,
            subtotal,
            tax,
            total,
            special_instructions
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        customerName,
        customerEmail || null,
        customerPhone || null,
        orderType,
        orderType === "pickup" ? pickupDate : null,
        orderType === "pickup" ? pickupTime : null,
        "pending",
        subtotal,
        tax,
        total,
        specialInstructions || null,
      ],
    );

    const orderId = orderResult.insertId;

    /*
     * Store each order item.
     */
    for (const item of normalizedItems) {
      const [orderItemResult] = await connection.execute(
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

      const orderItemId = orderItemResult.insertId;

      /*
       * Snapshot every customization.
       */
      for (const option of item.selectedOptions) {
        await connection.execute(
          `
            INSERT INTO order_item_options (
              order_item_id,
              option_id,
              option_group_name,
              option_name,
              price_adjustment
            )
            VALUES (?, ?, ?, ?, ?)
          `,
          [
            orderItemId,
            option.optionId,
            option.groupName,
            option.optionName,
            option.priceAdjustment,
          ],
        );
      }
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
        pickup_date AS pickupDate,
        pickup_time AS pickupTime,
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

  for (const item of items) {
    const [options] = await pool.execute(
      `
        SELECT
          option_id AS optionId,
          option_group_name AS groupName,
          option_name AS optionName,
          price_adjustment AS priceAdjustment
        FROM order_item_options
        WHERE order_item_id = ?
        ORDER BY id
      `,
      [item.id],
    );

    item.options = options;
  }

  return {
    ...orders[0],
    items,
  };
}

module.exports = {
  createOrder,
  findOrderById,
};
