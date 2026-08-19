const express = require("express");
const businessHoursController = require("../controllers/businessHoursController");

const router = express.Router();

router.get("/", businessHoursController.getBusinessHours);
router.get("/availability", businessHoursController.getPickupAvailability);

module.exports = router;
