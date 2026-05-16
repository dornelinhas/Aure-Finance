import db from '../database.js';

async function migrate() {
  try {
    await db.exec('ALTER TABLE categories ADD COLUMN is_recurring INTEGER DEFAULT 0');
    console.log('Migration successful: is_recurring added to categories');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('Column is_recurring already exists.');
    } else {
      console.error('Migration failed:', err);
    }
  }
}

migrate().then(() => process.exit());
