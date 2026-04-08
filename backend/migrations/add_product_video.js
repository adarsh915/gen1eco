const db = require('../config/db');

async function migrate() {
  try {
    console.log('Adding video_url to products table...');
    await db.execute('ALTER TABLE products ADD COLUMN video_url VARCHAR(255) DEFAULT NULL AFTER product_image');
    console.log('Migration successful.');
    process.exit(0);
  } catch (err) {
    if (err.errno === 1060) {
      console.log('Column video_url already exists.');
      process.exit(0);
    }
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
