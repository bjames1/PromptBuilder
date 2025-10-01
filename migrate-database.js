const Database = require('better-sqlite3');
const db = new Database('promptbuilder.db');

console.log('Migrating database schema...');

try {
  // Check prompts table columns
  const promptsInfo = db.prepare("PRAGMA table_info(prompts)").all();
  const promptsColumns = promptsInfo.map(col => col.name);

  console.log('Current prompts columns:', promptsColumns.join(', '));

  if (!promptsColumns.includes('category_id')) {
    console.log('Adding category_id column to prompts table...');
    db.prepare('ALTER TABLE prompts ADD COLUMN category_id TEXT').run();
    console.log('✓ Added category_id column');
  } else {
    console.log('✓ category_id column already exists');
  }

  if (!promptsColumns.includes('model_response')) {
    console.log('Adding model_response column to prompts table...');
    db.prepare("ALTER TABLE prompts ADD COLUMN model_response TEXT DEFAULT ''").run();
    console.log('✓ Added model_response column');
  } else {
    console.log('✓ model_response column already exists');
  }

  if (!promptsColumns.includes('include_images_in_export')) {
    console.log('Adding include_images_in_export column to prompts table...');
    db.prepare('ALTER TABLE prompts ADD COLUMN include_images_in_export INTEGER DEFAULT 1').run();
    console.log('✓ Added include_images_in_export column');
  } else {
    console.log('✓ include_images_in_export column already exists');
  }

  // Check if categories table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const hasCategories = tables.some(t => t.name === 'categories');

  if (!hasCategories) {
    console.log('Creating categories table...');
    db.prepare(`
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3498db',
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `).run();
    console.log('✓ Created categories table');
  } else {
    console.log('✓ categories table already exists');
  }

  // Check if follow_up_prompts table exists
  const hasFollowUps = tables.some(t => t.name === 'follow_up_prompts');

  if (!hasFollowUps) {
    console.log('Creating follow_up_prompts table...');
    db.prepare(`
      CREATE TABLE follow_up_prompts (
        id TEXT PRIMARY KEY,
        parent_prompt_id TEXT NOT NULL,
        content TEXT NOT NULL,
        model_response TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (parent_prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
      )
    `).run();
    console.log('✓ Created follow_up_prompts table');
  } else {
    console.log('✓ follow_up_prompts table already exists');
  }

  console.log('\n✅ Database migration complete!');

} catch (error) {
  console.error('❌ Migration failed:', error);
} finally {
  db.close();
}
