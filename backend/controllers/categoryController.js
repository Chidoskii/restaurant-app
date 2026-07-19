const categoryService = require("../services/categoryService");

async function getCategories(_req, res, next) {
  try {
    const categories = await categoryService.findAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

async function getItemsByCategory(req, res, next) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        message: "Category ID must be a positive integer",
      });
    }

    const exists = await categoryService.categoryExists(categoryId);

    if (!exists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const items =
      await categoryService.findItemsByCategoryId(categoryId);

    res.json(items);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getItemsByCategory,
};