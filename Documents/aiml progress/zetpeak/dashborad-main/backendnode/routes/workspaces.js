import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get all workspaces
router.get('/', (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM workspaces';
    const params = [];
    
    if (active !== undefined) {
      query += ' WHERE is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const workspaces = db.prepare(query).all(...params);
    
    // Parse JSON fields
    workspaces.forEach(workspace => {
      if (workspace.settings) {
        workspace.settings = JSON.parse(workspace.settings);
      }
    });
    
    res.json({
      count: workspaces.length,
      results: workspaces
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get workspace by ID
router.get('/:id', (req, res) => {
  try {
    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (workspace.settings) {
      workspace.settings = JSON.parse(workspace.settings);
    }
    
    res.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Create workspace
router.post('/', (req, res) => {
  try {
    const { name, description, members_count, is_active, settings } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }
    
    const insert = db.prepare(`
      INSERT INTO workspaces (name, description, members_count, is_active, settings)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      name,
      description || null,
      members_count || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      settings ? JSON.stringify(settings) : null
    );
    
    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(result.lastInsertRowid);
    
    if (workspace.settings) {
      workspace.settings = JSON.parse(workspace.settings);
    }
    
    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Update workspace
router.put('/:id', (req, res) => {
  try {
    const { name, description, members_count, is_active, settings } = req.body;
    
    const update = db.prepare(`
      UPDATE workspaces SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        members_count = COALESCE(?, members_count),
        is_active = COALESCE(?, is_active),
        settings = COALESCE(?, settings),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    update.run(
      name || null,
      description || null,
      members_count !== undefined ? members_count : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      settings ? JSON.stringify(settings) : null,
      req.params.id
    );
    
    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (workspace.settings) {
      workspace.settings = JSON.parse(workspace.settings);
    }
    
    res.json(workspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// Delete workspace
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM workspaces WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

export default router;
