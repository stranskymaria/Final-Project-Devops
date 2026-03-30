
# Express Note Taking API

This is a simple REST API for a note-taking application built with Express.js, TypeScript, and MySQL.

## Features

-   **CRUD Operations:** Create, Read, Update, and Delete notes.
-   **Database:** Uses MySQL for data persistence.
-   **API Documentation:** Interactive API documentation available via Swagger/OpenAPI.
-   **Testing:** Includes both unit and integration (API) tests.

## Prerequisites

-   Node.js (v18 or later)
-   MySQL Server

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd express-notes-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your MySQL database credentials for both development and testing.

4.  **Database Setup:**
    Connect to your MySQL server and run the following SQL commands to create the databases and tables.

    **Development Database:**
    ```sql
    CREATE DATABASE IF NOT EXISTS notes_db;
    USE notes_db;
    CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    ```

    **Test Database:**
    ```sql
    CREATE DATABASE IF NOT EXISTS notes_db_test;
    USE notes_db_test;
    CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    ```

## Running the Application

-   **Development Mode (with auto-reloading):**
    ```bash
    npm run dev
    ```
    The server will start on the port specified in your `.env` file (default is 3001).

-   **Production Mode:**
    First, build the TypeScript code:
    ```bash
    npm run build
    ```
    Then, start the server:
    ```bash
    npm start
    ```

## API Documentation

Once the server is running, you can access the interactive Swagger UI documentation at:
[http://localhost:3001/api-docs](http://localhost:3001/api-docs)

### Health Endpoint

The API includes a health check endpoint that provides information about the service status and database connectivity:

**GET** `/api/health`

Response example:
```json
{
  "status": "healthy",
  "timestamp": "2023-09-29T10:30:00.000Z",
  "uptime": 3600,
  "service": "Notes API", 
  "version": "1.0.0",
  "database": {
    "status": "healthy",
    "responseTime": 25
  }
}
```

The endpoint returns:
- **200 OK** when the service and database are healthy
- **503 Service Unavailable** when the database connection fails

## Running Tests

To run all tests (unit and API):
```bash
npm test
```
**Note:** The tests will run against the test database specified in your `.env` file. The test suite will clear the `notes` table in the test database before each test run.

Pipeline 1 CI test change.
Pipeline 1 CI test change.