import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ums_complete",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL Database Connected Successfully!");

    // Test connection
    const [rows] = await connection.execute("SELECT 1 AS number");
    console.log("Connection test successful:", rows);

    connection.release();
    return pool;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    connection.release();
    return result;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
};
