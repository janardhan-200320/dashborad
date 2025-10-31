import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get all resources
router.get('/', (req, res) => {
  try {
    const { available, type, location_id } = req.query;
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    
    if (available !== undefined) {
      query += ' AND is_available = ?';
      params.push(available === 'true' ? 1 : 0);
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (location_id) {
      query += ' AND location_id = ?';
      params.push(location_id);
    }
    
    query += ' ORDER BY name ASC';
    
    const resources = db.prepare(query).all(...params);
    
    res.json({
      count: resources.length,
      results: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get resource by ID
router.get('/:id', (req, res) => {
  try {
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Create resource
router.post('/', (req, res) => {
  try {
    const { name, type, description, is_available, location_id } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    const insert = db.prepare(`
      INSERT INTO resources (name, type, description, is_available, location_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      name,
      type,
      description || null,
      is_available !== undefined ? (is_available ? 1 : 0) : 1,
      location_id || null
    );
    
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update resource
router.put('/:id', (req, res) => {
  try {
    const { name, type, description, is_available, location_id } = req.body;
    
    const update = db.prepare(`
      UPDATE resources SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        description = COALESCE(?, description),
        is_available = COALESCE(?, is_available),
        location_id = COALESCE(?, location_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    update.run(
      name || null,
      type || null,
      description || null,
      is_available !== undefined ? (is_available ? 1 : 0) : null,
      location_id || null,
      req.params.id
    );
    
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete resource
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM resources WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;
