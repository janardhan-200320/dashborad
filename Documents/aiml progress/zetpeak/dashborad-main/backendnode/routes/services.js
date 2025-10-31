import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// GET all services (with pagination)
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) as count FROM services').get();
    const services = db.prepare(`
      SELECT * FROM services 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), offset);

    res.json({
      count: total.count,
      next: offset + services.length < total.count ? `?page=${parseInt(page) + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}&limit=${limit}` : null,
      results: services
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET active services
router.get('/active', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services WHERE is_enabled = 1 ORDER BY name').all();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single service
router.get('/:id', (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE service
router.post('/', (req, res) => {
  try {
    const { name, description, duration, price, category, is_enabled } = req.body;
    
    if (!name || !duration) {
      return res.status(400).json({ error: 'Name and duration are required' });
    }

    const insert = db.prepare(`
      INSERT INTO services (name, description, duration, price, category, is_enabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      name, 
      description || null, 
      duration, 
      price || null, 
      category || 'other',
      is_enabled !== undefined ? (is_enabled ? 1 : 0) : 1
    );
    
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE service
router.put('/:id', (req, res) => {
  try {
    const { name, description, duration, price, category, is_enabled } = req.body;
    
    const update = db.prepare(`
      UPDATE services 
      SET name = ?, description = ?, duration = ?, price = ?, category = ?, 
          is_enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = update.run(
      name, 
      description || null, 
      duration, 
      price || null, 
      category || 'other',
      is_enabled !== undefined ? (is_enabled ? 1 : 0) : 1,
      req.params.id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE service
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST toggle enabled
router.post('/:id/toggle_enabled', (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const newStatus = service.is_enabled ? 0 : 1;
    db.prepare('UPDATE services SET is_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, req.params.id);
    
    res.json({ is_enabled: newStatus === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
