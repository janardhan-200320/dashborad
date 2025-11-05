import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get all locations
router.get('/', (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM locations';
    const params = [];
    
    if (active !== undefined) {
      query += ' WHERE is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY name ASC';
    
    const locations = db.prepare(query).all(...params);
    
    res.json({
      count: locations.length,
      results: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get location by ID
router.get('/:id', (req, res) => {
  try {
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Create location
router.post('/', (req, res) => {
  try {
    const { name, address, city, state, country, postal_code, directions, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }
    
    const insert = db.prepare(`
      INSERT INTO locations (name, address, city, state, country, postal_code, directions, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      name,
      address || null,
      city || null,
      state || null,
      country || null,
      postal_code || null,
      directions || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );
    
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Update location
router.put('/:id', (req, res) => {
  try {
    const { name, address, city, state, country, postal_code, directions, is_active } = req.body;
    
    const update = db.prepare(`
      UPDATE locations SET
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        country = COALESCE(?, country),
        postal_code = COALESCE(?, postal_code),
        directions = COALESCE(?, directions),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    update.run(
      name || null,
      address || null,
      city || null,
      state || null,
      country || null,
      postal_code || null,
      directions || null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      req.params.id
    );
    
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete location
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM locations WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;
