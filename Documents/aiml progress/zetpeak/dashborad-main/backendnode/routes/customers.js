import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// Helper function to update timestamp
const updateTimestamp = db.prepare(`
  UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
`);

// GET all customers (with pagination)
router.get('/', (req, res) => {
  try {
    const { search, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers';
    let countQuery = 'SELECT COUNT(*) as count FROM customers';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
      countQuery += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    const total = db.prepare(countQuery).get(...params);
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const customers = db.prepare(query).all(...params, parseInt(limit), offset);

    res.json({
      count: total.count,
      next: offset + customers.length < total.count ? `?page=${parseInt(page) + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}&limit=${limit}` : null,
      results: customers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single customer
router.get('/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE customer
router.post('/', (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const insert = db.prepare(`
      INSERT INTO customers (name, email, phone, notes)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = insert.run(name, email, phone || null, notes || null);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(customer);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// UPDATE customer
router.put('/:id', (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    
    const update = db.prepare(`
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = update.run(name, email, phone || null, notes || null, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE customer
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
