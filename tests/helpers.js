'use strict';

const pool = require('../src/db');

async function clearTables() {
  // Order matters: delete dependents first
  await pool.execute('DELETE FROM attendance');
  await pool.execute('DELETE FROM lessons');
  await pool.execute('DELETE FROM students');
  await pool.execute('DELETE FROM subjects');
}

module.exports = { clearTables };
