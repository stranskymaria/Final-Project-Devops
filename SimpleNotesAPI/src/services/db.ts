
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
  TEST_DB_HOST, TEST_DB_PORT, TEST_DB_USER, TEST_DB_PASSWORD, TEST_DB_NAME
} = process.env;

const isTest = process.env.NODE_ENV === 'test';
const isUnitTest = process.env.JEST_WORKER_ID !== undefined;

const dbConfig = {
  host: isTest ? TEST_DB_HOST : DB_HOST,
  port: Number(isTest ? TEST_DB_PORT : DB_PORT),
  user: isTest ? TEST_DB_USER : DB_USER,
  password: isTest ? TEST_DB_PASSWORD : DB_PASSWORD,
  database: isTest ? TEST_DB_NAME : DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

const dbLabel = isTest ? 'test' : 'development';

const verifyConnection = async (attempt = 1): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log(`Successfully connected to ${dbLabel} database.`);
    connection.release();
  } catch (error) {
    const retryDelayMs = Math.min(1000 * attempt, 5000);
    console.error(
      `Error connecting to ${dbLabel} database on attempt ${attempt}. Retrying in ${retryDelayMs}ms.`,
      error
    );
    setTimeout(() => {
      void verifyConnection(attempt + 1);
    }, retryDelayMs);
  }
};

// Only establish real connection if not running unit tests
if (!isUnitTest) {
  void verifyConnection();
}

export default pool;
