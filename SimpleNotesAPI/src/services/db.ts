
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
// FIX: Import 'process' to provide type definitions for process.exit.
import process from 'process';

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

// Only establish real connection if not running unit tests
if (!isUnitTest) {
  pool.getConnection()
    .then(connection => {
      console.log(`Successfully connected to ${isTest ? 'test' : 'development'} database.`);
      connection.release();
    })
    .catch(err => {
      console.error(`Error connecting to ${isTest ? 'test' : 'development'} database:`, err.stack);
      process.exit(1);
    });
}

export default pool;