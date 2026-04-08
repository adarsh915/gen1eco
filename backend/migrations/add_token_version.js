const db = require('../config/db');

async function up() {
  try {
    await db.execute(`
      ALTER TABLE users
      ADD COLUMN token_version INT DEFAULT 0
    `);
    console.log('Migration: Added token_version column to users table');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

async function down() {
  try {
    await db.execute(`
      ALTER TABLE users
      DROP COLUMN token_version
    `);
    console.log('Rollback: Removed token_version column from users table');
  } catch (err) {
    console.error('Rollback error:', err);
  }
}

module.exports = { up, down };