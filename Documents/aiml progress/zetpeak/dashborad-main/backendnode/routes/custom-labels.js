import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get all custom labels
router.get('/', (req, res) => {
  try {
    const { label_type } = req.query;
    let query = 'SELECT * FROM custom_labels';
    const params = [];
    
    if (label_type) {
      query += ' WHERE label_type = ?';
      params.push(label_type);
    }
    
    query += ' ORDER BY label_type ASC, label_value ASC';
    
    const labels = db.prepare(query).all(...params);
    
    res.json({
      count: labels.length,
      results: labels
    });
  } catch (error) {
    console.error('Error fetching custom labels:', error);
    res.status(500).json({ error: 'Failed to fetch custom labels' });
  }
});

// Get custom label by ID
router.get('/:id', (req, res) => {
  try {
    const label = db.prepare('SELECT * FROM custom_labels WHERE id = ?').get(req.params.id);
    
    if (!label) {
      return res.status(404).json({ error: 'Custom label not found' });
    }
    
    res.json(label);
  } catch (error) {
    console.error('Error fetching custom label:', error);
    res.status(500).json({ error: 'Failed to fetch custom label' });
  }
});

// Create custom label
router.post('/', (req, res) => {
  try {
    const { label_type, label_value, description } = req.body;
    
    if (!label_type || !label_value) {
      return res.status(400).json({ error: 'Label type and value are required' });
    }
    
    const insert = db.prepare(`
      INSERT INTO custom_labels (label_type, label_value, description)
      VALUES (?, ?, ?)
    `);
    
    const result = insert.run(
      label_type,
      label_value,
      description || null
    );
    
    const label = db.prepare('SELECT * FROM custom_labels WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(label);
  } catch (error) {
    console.error('Error creating custom label:', error);
    res.status(500).json({ error: 'Failed to create custom label' });
  }
});

// Update custom label
router.put('/:id', (req, res) => {
  try {
    const { label_type, label_value, description } = req.body;
    
    const update = db.prepare(`
      UPDATE custom_labels SET
        label_type = COALESCE(?, label_type),
        label_value = COALESCE(?, label_value),
        description = COALESCE(?, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    update.run(
      label_type || null,
      label_value || null,
      description || null,
      req.params.id
    );
    
    const label = db.prepare('SELECT * FROM custom_labels WHERE id = ?').get(req.params.id);
    
    if (!label) {
      return res.status(404).json({ error: 'Custom label not found' });
    }
    
    res.json(label);
  } catch (error) {
    console.error('Error updating custom label:', error);
    res.status(500).json({ error: 'Failed to update custom label' });
  }
});

// Delete custom label
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM custom_labels WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Custom label not found' });
    }
    
    res.json({ message: 'Custom label deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom label:', error);
    res.status(500).json({ error: 'Failed to delete custom label' });
  }
});

export default router;
