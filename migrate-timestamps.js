const Database = require('better-sqlite3');

// Open database
const db = new Database('promptbuilder.db');

// Set 5pm today as the timestamp
const today = new Date();
today.setHours(17, 0, 0, 0);
const fivePmToday = today.toISOString();

console.log(`Setting all existing prompt creation times to: ${fivePmToday}`);

try {
  // Get current timestamp to identify "old" prompts
  const now = new Date().toISOString();

  // Update all prompts to have 5pm today as their creation time
  const stmt = db.prepare('UPDATE prompts SET created_at = ?');
  const result = stmt.run(fivePmToday);

  console.log(`Updated ${result.changes} prompts to have creation time of 5pm today`);

} catch (error) {
  console.error('Error updating timestamps:', error);
} finally {
  db.close();
}
