const express = require("express");
const menuController = require("../controllers/menuController");

const router = express.Router();

router.get("/", menuController.getMenu);
router.get("/today", menuController.getTodaysMenu);
router.get("/featured", menuController.getFeaturedItems);
router.get("/:id/options", menuController.getMenuItemOptions);
router.get("/:id", menuController.getMenuItemById);

module.exports = router;
