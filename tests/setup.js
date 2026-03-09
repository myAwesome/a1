'use strict';

const { initDb } = require('../src/db/init');

beforeAll(async () => {
  await initDb();
});
