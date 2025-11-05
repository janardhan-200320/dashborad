import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get all integrations
router.get('/', (req, res) => {
  try {
    const { connected, type } = req.query;
    let query = 'SELECT * FROM integrations WHERE 1=1';
    const params = [];
    
    if (connected !== undefined) {
      query += ' AND is_connected = ?';
      params.push(connected === 'true' ? 1 : 0);
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY name ASC';
    
    const integrations = db.prepare(query).all(...params);
    
    // Parse JSON fields and mask sensitive data
    integrations.forEach(integration => {
      if (integration.settings) {
        integration.settings = JSON.parse(integration.settings);
      }
      // Don't expose full API key, only show if it exists
      if (integration.api_key) {
        integration.has_api_key = true;
        delete integration.api_key;
      }
    });
    
    res.json({
      count: integrations.length,
      results: integrations
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Get integration by ID
router.get('/:id', (req, res) => {
  try {
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    if (integration.settings) {
      integration.settings = JSON.parse(integration.settings);
    }
    
    // Mask API key
    if (integration.api_key) {
      integration.has_api_key = true;
      delete integration.api_key;
    }
    
    res.json(integration);
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

// Create integration
router.post('/', (req, res) => {
  try {
    const { name, type, is_connected, api_key, settings } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    const insert = db.prepare(`
      INSERT INTO integrations (name, type, is_connected, api_key, settings)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      name,
      type,
      is_connected !== undefined ? (is_connected ? 1 : 0) : 0,
      api_key || null,
      settings ? JSON.stringify(settings) : null
    );
    
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ?').get(result.lastInsertRowid);
    
    if (integration.settings) {
      integration.settings = JSON.parse(integration.settings);
    }
    
    if (integration.api_key) {
      integration.has_api_key = true;
      delete integration.api_key;
    }
    
    res.status(201).json(integration);
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

// Update integration
router.put('/:id', (req, res) => {
  try {
    const { name, type, is_connected, api_key, settings } = req.body;
    
    const update = db.prepare(`
      UPDATE integrations SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        is_connected = COALESCE(?, is_connected),
        api_key = COALESCE(?, api_key),
        settings = COALESCE(?, settings),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    update.run(
      name || null,
      type || null,
      is_connected !== undefined ? (is_connected ? 1 : 0) : null,
      api_key || null,
      settings ? JSON.stringify(settings) : null,
      req.params.id
    );
    
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    if (integration.settings) {
      integration.settings = JSON.parse(integration.settings);
    }
    
    if (integration.api_key) {
      integration.has_api_key = true;
      delete integration.api_key;
    }
    
    res.json(integration);
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Delete integration
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM integrations WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

export default router;
