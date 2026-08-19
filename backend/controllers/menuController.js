const menuService = require("../services/menuService");

async function getMenu(_req, res, next) {
  try {
    const menuItems = await menuService.findAvailableMenuItems();
    res.json(menuItems);
  } catch (error) {
    next(error);
  }
}

async function getTodaysMenu(_req, res, next) {
  try {
    const specials = await menuService.findTodaysSpecials();
    res.json(specials);
  } catch (error) {
    next(error);
  }
}

async function getFeaturedItems(_req, res, next) {
  try {
    const featuredItems = await menuService.findFeaturedItems();
    res.json(featuredItems);
  } catch (error) {
    next(error);
  }
}

async function getMenuItemById(req, res, next) {
  try {
    const menuItemId = Number(req.params.id);

    if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
      return res.status(400).json({
        message: "Menu item ID must be a positive integer",
      });
    }

    const menuItem = await menuService.findMenuItemById(menuItemId);

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    res.json(menuItem);
  } catch (error) {
    next(error);
  }
}

async function getMenuItemOptions(req, res, next) {
  try {
    const menuItemId = Number(req.params.id);

    if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
      return res.status(400).json({
        message: "Invalid menu item ID",
      });
    }

    const options = await menuService.findOptionsByMenuItemId(menuItemId);

    res.json(options);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMenu,
  getTodaysMenu,
  getFeaturedItems,
  getMenuItemById,
  getMenuItemOptions,
};
