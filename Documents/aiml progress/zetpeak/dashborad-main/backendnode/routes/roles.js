import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get all roles
router.get('/', (req, res) => {
  try {
    const roles = db.prepare('SELECT * FROM roles ORDER BY name ASC').all();
    
    // Parse permissions JSON
    roles.forEach(role => {
      if (role.permissions) {
        role.permissions = JSON.parse(role.permissions);
      }
    });
    
    res.json({
      count: roles.length,
      results: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get role by ID
router.get('/:id', (req, res) => {
  try {
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    if (role.permissions) {
      role.permissions = JSON.parse(role.permissions);
    }
    
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// Create role
router.post('/', (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    if (!name || !permissions) {
      return res.status(400).json({ error: 'Name and permissions are required' });
    }
    
    const insert = db.prepare(`
      INSERT INTO roles (name, description, permissions)
      VALUES (?, ?, ?)
    `);
    
    try {
      const result = insert.run(
        name,
        description || null,
        JSON.stringify(permissions)
      );
      
      const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(result.lastInsertRowid);
      
      if (role.permissions) {
        role.permissions = JSON.parse(role.permissions);
      }
      
      res.status(201).json(role);
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Role with this name already exists' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role
router.put('/:id', (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    const update = db.prepare(`
      UPDATE roles SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        permissions = COALESCE(?, permissions),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    try {
      update.run(
        name || null,
        description || null,
        permissions ? JSON.stringify(permissions) : null,
        req.params.id
      );
      
      const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
      
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      if (role.permissions) {
        role.permissions = JSON.parse(role.permissions);
      }
      
      res.json(role);
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Role with this name already exists' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM roles WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;
