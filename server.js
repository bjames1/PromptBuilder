const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Initialize SQLite database
const db = new Database('promptbuilder.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3498db',
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    category_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    model_response TEXT DEFAULT '',
    include_images_in_export INTEGER DEFAULT 1,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    prompt_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS follow_up_prompts (
    id TEXT PRIMARY KEY,
    parent_prompt_id TEXT NOT NULL,
    content TEXT NOT NULL,
    model_response TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (parent_prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
  );
`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.static(__dirname));

// API Routes

// Get all projects with their prompts and images
app.get('/api/state', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();

    const state = {
      projects: projects.map(project => {
        const categories = db.prepare('SELECT * FROM categories WHERE project_id = ? ORDER BY created_at ASC').all(project.id);
        const prompts = db.prepare('SELECT * FROM prompts WHERE project_id = ? ORDER BY updated_at DESC').all(project.id);

        return {
          id: project.id,
          name: project.name,
          createdAt: project.created_at,
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            createdAt: cat.created_at
          })),
          prompts: prompts.map(prompt => {
            const images = db.prepare('SELECT * FROM images WHERE prompt_id = ?').all(prompt.id);
            const followUps = db.prepare('SELECT * FROM follow_up_prompts WHERE parent_prompt_id = ? ORDER BY created_at ASC').all(prompt.id);

            return {
              id: prompt.id,
              categoryId: prompt.category_id,
              title: prompt.title,
              content: prompt.content,
              createdAt: prompt.created_at,
              updatedAt: prompt.updated_at,
              modelResponse: prompt.model_response || '',
              includeImagesInExport: prompt.include_images_in_export === 1,
              images: images.map(img => ({
                id: img.id,
                name: img.name,
                data: img.data
              })),
              followUpPrompts: followUps.map(fu => ({
                id: fu.id,
                content: fu.content,
                modelResponse: fu.model_response || '',
                createdAt: fu.created_at,
                updatedAt: fu.updated_at
              }))
            };
          })
        };
      })
    };

    res.json(state);
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

// Create a new project
app.post('/api/projects', (req, res) => {
  try {
    const { id, name, createdAt } = req.body;

    const stmt = db.prepare('INSERT INTO projects (id, name, created_at) VALUES (?, ?, ?)');
    stmt.run(id, name, createdAt);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project name
app.put('/api/projects/:id', (req, res) => {
  try {
    const { name } = req.body;

    const stmt = db.prepare('UPDATE projects SET name = ? WHERE id = ?');
    stmt.run(name, req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
  try {
    // Delete associated images first
    const prompts = db.prepare('SELECT id FROM prompts WHERE project_id = ?').all(req.params.id);
    const deleteImages = db.prepare('DELETE FROM images WHERE prompt_id = ?');
    prompts.forEach(prompt => deleteImages.run(prompt.id));

    // Delete prompts
    const deletePrompts = db.prepare('DELETE FROM prompts WHERE project_id = ?');
    deletePrompts.run(req.params.id);

    // Delete project
    const deleteProject = db.prepare('DELETE FROM projects WHERE id = ?');
    deleteProject.run(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Create a new prompt
app.post('/api/prompts', (req, res) => {
  try {
    const { id, projectId, categoryId, title, content, createdAt, updatedAt, modelResponse, includeImagesInExport } = req.body;

    const stmt = db.prepare('INSERT INTO prompts (id, project_id, category_id, title, content, created_at, updated_at, model_response, include_images_in_export) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, projectId, categoryId || null, title, content, createdAt, updatedAt, modelResponse || '', includeImagesInExport ? 1 : 0);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Update a prompt
app.put('/api/prompts/:id', (req, res) => {
  try {
    const { categoryId, title, content, updatedAt, modelResponse, includeImagesInExport } = req.body;

    const stmt = db.prepare('UPDATE prompts SET category_id = ?, title = ?, content = ?, updated_at = ?, model_response = ?, include_images_in_export = ? WHERE id = ?');
    stmt.run(categoryId || null, title, content, updatedAt, modelResponse || '', includeImagesInExport ? 1 : 0, req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// Delete a prompt
app.delete('/api/prompts/:id', (req, res) => {
  try {
    // Delete associated images first
    const deleteImages = db.prepare('DELETE FROM images WHERE prompt_id = ?');
    deleteImages.run(req.params.id);

    // Delete prompt
    const deletePrompt = db.prepare('DELETE FROM prompts WHERE id = ?');
    deletePrompt.run(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// Add an image to a prompt
app.post('/api/images', (req, res) => {
  try {
    const { id, promptId, name, data } = req.body;

    const stmt = db.prepare('INSERT INTO images (id, prompt_id, name, data) VALUES (?, ?, ?, ?)');
    stmt.run(id, promptId, name, data);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Update an image name
app.put('/api/images/:id', (req, res) => {
  try {
    const { name } = req.body;

    const stmt = db.prepare('UPDATE images SET name = ? WHERE id = ?');
    stmt.run(name, req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete an image
app.delete('/api/images/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM images WHERE id = ?');
    stmt.run(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Follow-up Prompts API endpoints

// Create a new follow-up prompt
app.post('/api/follow-ups', (req, res) => {
  try {
    const { id, parentPromptId, content, modelResponse, createdAt, updatedAt } = req.body;

    const stmt = db.prepare('INSERT INTO follow_up_prompts (id, parent_prompt_id, content, model_response, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, parentPromptId, content, modelResponse || '', createdAt, updatedAt);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating follow-up prompt:', error);
    res.status(500).json({ error: 'Failed to create follow-up prompt' });
  }
});

// Update a follow-up prompt
app.put('/api/follow-ups/:id', (req, res) => {
  try {
    const { content, modelResponse, updatedAt } = req.body;

    const stmt = db.prepare('UPDATE follow_up_prompts SET content = ?, model_response = ?, updated_at = ? WHERE id = ?');
    stmt.run(content, modelResponse || '', updatedAt, req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating follow-up prompt:', error);
    res.status(500).json({ error: 'Failed to update follow-up prompt' });
  }
});

// Delete a follow-up prompt
app.delete('/api/follow-ups/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM follow_up_prompts WHERE id = ?');
    stmt.run(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting follow-up prompt:', error);
    res.status(500).json({ error: 'Failed to delete follow-up prompt' });
  }
});

// Category API endpoints

// Create a new category
app.post('/api/categories', (req, res) => {
  try {
    const { id, projectId, name, color, createdAt } = req.body;

    const stmt = db.prepare('INSERT INTO categories (id, project_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, projectId, name, color || '#3498db', createdAt);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update a category
app.put('/api/categories/:id', (req, res) => {
  try {
    const { name, color } = req.body;

    const stmt = db.prepare('UPDATE categories SET name = ?, color = ? WHERE id = ?');
    stmt.run(name, color, req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
app.delete('/api/categories/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
