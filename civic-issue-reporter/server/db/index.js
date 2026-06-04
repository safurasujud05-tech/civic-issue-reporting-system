// db/index.js - PostgreSQL connection and schema setup
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'civic_issues',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('💡 Running in mock/in-memory mode...');
  } else {
    release();
    console.log('✅ Connected to PostgreSQL database');
  }
});

// SQL to create complaints table
const CREATE_COMPLAINTS_TABLE = `
  CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    department VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(255),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize database schema
async function initDB() {
  try {
    await pool.query(CREATE_COMPLAINTS_TABLE);
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ Schema init error:', err.message);
  }
}

module.exports = { pool, initDB };
