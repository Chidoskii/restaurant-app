const { pool } = require("../db");

async function findAllCategories() {
  const [rows] = await pool.query(`
    SELECT
      id,
      name,
      description,
      display_order AS displayOrder
    FROM categories
    WHERE is_active = TRUE
    ORDER BY display_order, name
  `);

  return rows;
}

async function findItemsByCategoryId(categoryId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        category_id AS categoryId,
        name,
        description,
        price,
        image_url AS imageUrl,
        is_featured AS isFeatured,
        show_on_homepage AS showOnHomepage,
        is_seasonal AS isSeasonal
      FROM menu_items
      WHERE category_id = ?
        AND is_available = TRUE
      ORDER BY display_order, name
    `,
    [categoryId],
  );

  return rows;
}

async function categoryExists(categoryId) {
  const [rows] = await pool.execute(
    `
      SELECT id
      FROM categories
      WHERE id = ?
        AND is_active = TRUE
      LIMIT 1
    `,
    [categoryId],
  );

  return rows.length > 0;
}

module.exports = {
  findAllCategories,
  findItemsByCategoryId,
  categoryExists,
};