'use strict';

require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config');
const pool = require('./src/db');

async function start() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('Database connection established');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });
}

start();
