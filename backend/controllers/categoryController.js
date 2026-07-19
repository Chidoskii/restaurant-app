const { pool } = require("../db");

async function getCategories(_req, res, next) {
  try {
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

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getItemsByCategory(req, res, next) {
  try {
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
          is_seasonal AS isSeasonal
        FROM menu_items
        WHERE category_id = ?
          AND is_available = TRUE
        ORDER BY display_order, name
      `,
      [req.params.id],
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getItemsByCategory,
};