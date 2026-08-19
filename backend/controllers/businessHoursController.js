const businessHoursService = require("../services/businessHoursService");

async function getBusinessHours(_req, res, next) {
  try {
    const hours = await businessHoursService.findAllBusinessHours();

    res.json(hours);
  } catch (error) {
    next(error);
  }
}

async function getPickupAvailability(req, res, next) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const availability = await businessHoursService.getPickupAvailability(date);

    res.json(availability);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBusinessHours,
  getPickupAvailability,
};
