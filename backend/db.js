require("dotenv").config();


const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

function createSslConfig() {
  const certificatePath = process.env.DB_SSL_CA_PATH;

  if (!certificatePath) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DB_SSL_CA_PATH is required in production");
    }

    console.warn(
      "DB_SSL_CA_PATH is not configured. Using unverified SSL for development.",
    );

    return {
      rejectUnauthorized: false,
    };
  }

  const resolvedPath = path.resolve(certificatePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Database CA certificate not found: ${resolvedPath}`);
  }

  return {
    ca: fs.readFileSync(resolvedPath),
    rejectUnauthorized: true,
  };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: createSslConfig(),

  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  queueLimit: 0,

  connectTimeout: 10_000,
  decimalNumbers: true,
});

module.exports = { pool };