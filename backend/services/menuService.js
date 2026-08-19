const { pool } = require("../db");

async function findAvailableMenuItems() {
  const [rows] = await pool.query(`
    SELECT
      mi.id,
      mi.category_id AS categoryId,
      c.name AS categoryName,
      mi.name,
      mi.description,
      mi.price,
      mi.image_url AS imageUrl,
      mi.is_available AS isAvailable,
      mi.is_featured AS isFeatured,
      mi.show_on_homepage AS showOnHomepage,
      mi.is_seasonal AS isSeasonal
    FROM menu_items mi
    INNER JOIN categories c
      ON c.id = mi.category_id
    WHERE mi.is_available = TRUE
      AND c.is_active = TRUE
    ORDER BY c.display_order, mi.display_order, mi.name
  `);

  return rows;
}

async function findTodaysSpecials() {
  const [rows] = await pool.query(`
    SELECT
      mi.id,
      mi.category_id AS categoryId,
      c.name AS categoryName,
      mi.name,
      mi.description,
      mi.price,
      mi.image_url AS imageUrl,
      ds.special_price AS specialPrice,
      ds.special_note AS specialNote
    FROM daily_specials ds
    INNER JOIN menu_items mi
      ON mi.id = ds.menu_item_id
    INNER JOIN categories c
      ON c.id = mi.category_id
    WHERE ds.special_date = CURRENT_DATE()
      AND ds.is_active = TRUE
      AND mi.is_available = TRUE
      AND c.is_active = TRUE
    ORDER BY ds.display_order, mi.name
  `);

  return rows;
}

async function findFeaturedItems() {
  const [rows] = await pool.query(`
    SELECT
      mi.id,
      mi.category_id AS categoryId,
      c.name AS categoryName,
      mi.name,
      mi.description,
      mi.price,
      mi.image_url AS imageUrl,
      mi.show_on_homepage AS showOnHomepage,
      mi.is_seasonal AS isSeasonal
    FROM menu_items mi
    INNER JOIN categories c
      ON c.id = mi.category_id
    WHERE mi.is_featured = TRUE
      AND mi.is_available = TRUE
      AND c.is_active = TRUE
    ORDER BY mi.display_order, mi.name
  `);

  return rows;
}

async function findMenuItemById(menuItemId) {
  const [rows] = await pool.execute(
    `
      SELECT
        mi.id,
        mi.category_id AS categoryId,
        c.name AS categoryName,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url AS imageUrl,
        mi.is_available AS isAvailable,
        mi.is_featured AS isFeatured,
        mi.show_on_homepage AS showOnHomepage,
        mi.is_seasonal AS isSeasonal
      FROM menu_items mi
      INNER JOIN categories c
        ON c.id = mi.category_id
      WHERE mi.id = ?
      LIMIT 1
    `,
    [menuItemId],
  );

  return rows[0] ?? null;
}

async function findOptionsByMenuItemId(menuItemId) {
  const [rows] = await pool.execute(
    `
      SELECT
        og.id AS groupId,
        og.name AS groupName,
        og.selection_type AS selectionType,
        og.is_required AS isRequired,
        og.min_selections AS minSelections,
        og.max_selections AS maxSelections,

        o.id AS optionId,
        o.name AS optionName,
        o.price_adjustment AS priceAdjustment,
        o.is_default AS isDefault

      FROM menu_item_option_groups miog

      INNER JOIN option_groups og
        ON og.id = miog.option_group_id

      INNER JOIN options o
        ON o.option_group_id = og.id

      WHERE miog.menu_item_id = ?
        AND og.is_active = TRUE
        AND o.is_active = TRUE

      ORDER BY
        og.display_order,
        o.display_order,
        o.name
    `,
    [menuItemId],
  );

  const groups = [];

  for (const row of rows) {
    let group = groups.find((item) => item.id === row.groupId);

    if (!group) {
      group = {
        id: row.groupId,
        name: row.groupName,
        selectionType: row.selectionType,
        isRequired: Boolean(row.isRequired),
        minSelections: row.minSelections,
        maxSelections: row.maxSelections,
        options: [],
      };

      groups.push(group);
    }

    group.options.push({
      id: row.optionId,
      name: row.optionName,
      priceAdjustment: Number(row.priceAdjustment),
      isDefault: Boolean(row.isDefault),
    });
  }

  return groups;
}

module.exports = {
  findAvailableMenuItems,
  findTodaysSpecials,
  findFeaturedItems,
  findMenuItemById,
  findOptionsByMenuItemId,
};
