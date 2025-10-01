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

  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    prompt_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
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
        const prompts = db.prepare('SELECT * FROM prompts WHERE project_id = ? ORDER BY updated_at DESC').all(project.id);

        return {
          id: project.id,
          name: project.name,
          createdAt: project.created_at,
          prompts: prompts.map(prompt => {
            const images = db.prepare('SELECT * FROM images WHERE prompt_id = ?').all(prompt.id);

            return {
              id: prompt.id,
              title: prompt.title,
              content: prompt.content,
              createdAt: prompt.created_at,
              updatedAt: prompt.updated_at,
              images: images.map(img => ({
                id: img.id,
                name: img.name,
                data: img.data
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
    const { id, projectId, title, content, createdAt, updatedAt } = req.body;

    const stmt = db.prepare('INSERT INTO prompts (id, project_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, projectId, title, content, createdAt, updatedAt);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Update a prompt
app.put('/api/prompts/:id', (req, res) => {
  try {
    const { title, content, updatedAt } = req.body;

    const stmt = db.prepare('UPDATE prompts SET title = ?, content = ?, updated_at = ? WHERE id = ?');
    stmt.run(title, content, updatedAt, req.params.id);

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
