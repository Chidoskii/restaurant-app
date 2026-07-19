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

module.exports = {
  findAvailableMenuItems,
  findTodaysSpecials,
  findFeaturedItems,
  findMenuItemById,
};