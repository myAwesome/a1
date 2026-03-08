'use strict';

const pool = require('../db');

async function getHealth(req, res, next) {
  let dbStatus = 'ok';
  try {
    const conn = await pool.getConnection();
    conn.release();
  } catch {
    dbStatus = 'error';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbStatus,
  });
}

module.exports = { getHealth };
