require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const menuRoutes = require("./routes/menuRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const businessHoursRoutes = require("./routes/businessHoursRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allows tools such as DBeaver, Postman, curl, and same-origin requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", async (_req, res, next) => {
  try {
    const { pool } = require("./db");
    const [rows] = await pool.query(
      "SELECT NOW() AS databaseTime, DATABASE() AS databaseName",
    );

    res.json({
      status: "ok",
      message: "Cafe API is running",
      database: rows[0],
    });
  } catch (error) {
    next(error);
  }
});

app.get("/", (_req, res) => {
  res.json({
    service: "Okpara's Cafe API",
    status: "online",
    version: "1.0.0",
  });
});

app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/business-hours", businessHoursRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Cafe API listening on port ${port}`);
});
