const { pool } = require("../db");

const MIN_PICKUP_LEAD_MINUTES = 20;
const PICKUP_SLOT_INTERVAL_MINUTES = 20;

const RESTAURANT_TIMEZONE =
  process.env.RESTAURANT_TIMEZONE || "America/Los_Angeles";

async function findAllBusinessHours() {
  const [rows] = await pool.query(`
    SELECT
      id,
      day_of_week AS dayOfWeek,
      open_time AS openTime,
      close_time AS closeTime,
      is_closed AS isClosed
    FROM business_hours
    ORDER BY day_of_week
  `);

  return rows;
}

async function findBusinessHoursByDay(dayOfWeek) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        day_of_week AS dayOfWeek,
        open_time AS openTime,
        close_time AS closeTime,
        is_closed AS isClosed
      FROM business_hours
      WHERE day_of_week = ?
      LIMIT 1
    `,
    [dayOfWeek],
  );

  return rows[0] ?? null;
}

function timeStringToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTimeString(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function getRestaurantDateString(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getRestaurantTimeMinutes(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return Number(values.hour) * 60 + Number(values.minute);
}

async function getPickupAvailability(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const error = new Error("Invalid date format");
    error.statusCode = 400;
    throw error;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  const requestedDay = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TIMEZONE,
    weekday: "short",
  });

  const dayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayOfWeek = dayMap[dayFormatter.format(requestedDay)];

  const hours = await findBusinessHoursByDay(dayOfWeek);

  if (!hours || hours.isClosed) {
    return {
      date: dateString,
      isClosed: true,
      openTime: null,
      closeTime: null,
      slots: [],
    };
  }

  const openMinutes = timeStringToMinutes(hours.openTime);

  const closeMinutes = timeStringToMinutes(hours.closeTime);

  let firstSlot = openMinutes;

  const now = new Date();

  const todayAtRestaurant = getRestaurantDateString(now);

  /*
   * If the customer selected today, account for
   * the minimum preparation time.
   */
  if (dateString === todayAtRestaurant) {
    const currentMinutes = getRestaurantTimeMinutes(now);

    const earliestMinutes = currentMinutes + MIN_PICKUP_LEAD_MINUTES;

    firstSlot = Math.max(
      openMinutes,
      Math.ceil(earliestMinutes / PICKUP_SLOT_INTERVAL_MINUTES) *
        PICKUP_SLOT_INTERVAL_MINUTES,
    );
  }

  const slots = [];

  for (
    let minutes = firstSlot;
    minutes < closeMinutes;
    minutes += PICKUP_SLOT_INTERVAL_MINUTES
  ) {
    slots.push(minutesToTimeString(minutes));
  }

  return {
    date: dateString,
    isClosed: false,
    openTime: hours.openTime,
    closeTime: hours.closeTime,
    slots,
  };
}

/*
 * Validate the exact date/time submitted during checkout.
 *
 * We deliberately reuse getPickupAvailability().
 * This ensures the frontend and checkout validation
 * follow exactly the same rules.
 */
async function validatePickupTime(dateString, timeString) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString) ||
    !/^\d{2}:\d{2}$/.test(timeString)
  ) {
    return {
      valid: false,
      message: "Invalid pickup date or time",
    };
  }

  const availability = await getPickupAvailability(dateString);

  if (availability.isClosed) {
    return {
      valid: false,
      message: "The restaurant is closed on this day",
    };
  }

  if (!availability.slots.includes(timeString)) {
    return {
      valid: false,
      message: "The selected pickup time is not available",
    };
  }

  return {
    valid: true,
  };
}

module.exports = {
  findAllBusinessHours,
  findBusinessHoursByDay,
  getPickupAvailability,
  validatePickupTime,
};
