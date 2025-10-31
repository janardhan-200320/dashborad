import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// GET all team members (with pagination)
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) as count FROM team_members').get();
    const members = db.prepare(`
      SELECT * FROM team_members 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), offset);

    res.json({
      count: total.count,
      next: offset + members.length < total.count ? `?page=${parseInt(page) + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}&limit=${limit}` : null,
      results: members
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET active team members
router.get('/active', (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM team_members WHERE is_active = 1 ORDER BY name').all();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single team member
router.get('/:id', (req, res) => {
  try {
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE team member
router.post('/', (req, res) => {
  try {
    const { name, email, role, avatar, color, is_active } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const insert = db.prepare(`
      INSERT INTO team_members (name, email, role, avatar, color, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      name, 
      email, 
      role || 'salesperson', 
      avatar || null,
      color || 'bg-gradient-to-r from-blue-500 to-purple-500',
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );
    
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(member);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// UPDATE team member
router.put('/:id', (req, res) => {
  try {
    const { name, email, role, avatar, color, is_active } = req.body;
    
    const update = db.prepare(`
      UPDATE team_members 
      SET name = ?, email = ?, role = ?, avatar = ?, color = ?, 
          is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = update.run(
      name, 
      email, 
      role || 'salesperson', 
      avatar || null,
      color || 'bg-gradient-to-r from-blue-500 to-purple-500',
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      req.params.id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE team member
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST toggle active
router.post('/:id/toggle_active', (req, res) => {
  try {
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
    
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const newStatus = member.is_active ? 0 : 1;
    db.prepare('UPDATE team_members SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, req.params.id);
    
    res.json({ is_active: newStatus === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
