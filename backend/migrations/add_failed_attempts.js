const db = require('../config/db');

async function up() {
  try {
    await db.execute(`
      ALTER TABLE users
      ADD COLUMN failed_attempts INT DEFAULT 0,
      ADD COLUMN last_failed_attempt DATETIME NULL
    `);
    console.log('Migration: Added failed_attempts and last_failed_attempt columns to users table');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

async function down() {
  try {
    await db.execute(`
      ALTER TABLE users
      DROP COLUMN failed_attempts,
      DROP COLUMN last_failed_attempt
    `);
    console.log('Rollback: Removed failed_attempts and last_failed_attempt columns from users table');
  } catch (err) {
    console.error('Rollback error:', err);
  }
}

module.exports = { up, down };