const db = require('./config/db');

async function updateDb() {
  try {
    const [cols] = await db.execute("SHOW COLUMNS FROM categories LIKE 'image'");
    if (cols.length === 0) {
      await db.execute("ALTER TABLE categories ADD COLUMN image VARCHAR(255) NULL AFTER slug");
      console.log('Successfully added image column to categories table.');
    } else {
      console.log('Image column already exists in categories table.');
    }
  } catch (err) {
    console.error('Failed to update DB:', err);
  } finally {
    process.exit();
  }
}

updateDb();
