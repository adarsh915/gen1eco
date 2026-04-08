const db = require('../config/db');

async function migrate() {
  try {
    console.log('Running guest checkout migration...');

    // Add is_guest_checkout column
    try {
      await db.execute('ALTER TABLE users ADD COLUMN is_guest_checkout TINYINT(1) DEFAULT 0 AFTER status');
      console.log('✓ Added is_guest_checkout column');
    } catch (err) {
      if (err.errno === 1060) {
        console.log('✓ is_guest_checkout column already exists');
      } else {
        throw err;
      }
    }

    // Add guest_checkout_token column
    try {
      await db.execute('ALTER TABLE users ADD COLUMN guest_checkout_token VARCHAR(255) DEFAULT NULL AFTER is_guest_checkout');
      console.log('✓ Added guest_checkout_token column');
    } catch (err) {
      if (err.errno === 1060) {
        console.log('✓ guest_checkout_token column already exists');
      } else {
        throw err;
      }
    }

    console.log('✅ Migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
