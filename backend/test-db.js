const { pool } = require("./db");

async function testDatabase() {
  try {
    const [databaseRows] = await pool.query(`
      SELECT
        DATABASE() AS databaseName,
        VERSION() AS databaseVersion,
        NOW() AS databaseTime
    `);

    const [tableRows] = await pool.query(`
      SELECT table_name AS tableName
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    `);

    console.log("Database connection successful:");
    console.table(databaseRows);

    console.log("Tables:");
    console.table(tableRows);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testDatabase();