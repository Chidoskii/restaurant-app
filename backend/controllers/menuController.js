const { pool } = require("../db");

async function getMenu(_req, res, next) {
  try {
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

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getTodaysMenu(_req, res, next) {
  try {
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
      ORDER BY ds.display_order, mi.name
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getFeaturedItems(_req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        category_id AS categoryId,
        name,
        description,
        price,
        image_url AS imageUrl
      FROM menu_items
      WHERE is_featured = TRUE
        AND is_available = TRUE
      ORDER BY display_order, name
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getMenuItemById(req, res, next) {
  try {
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
      `,
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMenu,
  getTodaysMenu,
  getFeaturedItems,
  getMenuItemById,
};