import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'b8035af1-4c81-40d9-a4ac-143350c3d41f';

// GET all team members (with pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 100, organization_id = DEFAULT_ORG_ID } = req.query;
    const offset = (page - 1) * limit;

    const { data: members, error, count } = await supabase
      .from('salespersons')
      .select('*', { count: 'exact' })
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      count: count,
      next: offset + members.length < count ? `?page=${parseInt(page) + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}&limit=${limit}` : null,
      results: members
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET active team members
router.get('/active', async (req, res) => {
  try {
    const { organization_id = DEFAULT_ORG_ID } = req.query;

    const { data: members, error } = await supabase
      .from('salespersons')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) throw error;

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single team member
router.get('/:id', async (req, res) => {
  try {
    const { data: member, error } = await supabase
      .from('salespersons')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Team member not found' });
      }
      throw error;
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE team member
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, role, avatar, color, is_active, organization_id = DEFAULT_ORG_ID } = req.body;
    
    if (!first_name || !email) {
      return res.status(400).json({ error: 'First name and email are required' });
    }

    const { data: member, error } = await supabase
      .from('salespersons')
      .insert([{
        organization_id,
        first_name,
        last_name: last_name || '',
        email,
        role: role || 'salesperson',
        avatar: avatar || null,
        color: color || 'bg-gradient-to-r from-blue-500 to-purple-500',
        is_active: is_active !== undefined ? is_active : true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      throw error;
    }
    
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE team member
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, role, avatar, color, is_active } = req.body;
    
    const { data: member, error } = await supabase
      .from('salespersons')
      .update({
        first_name,
        last_name: last_name || '',
        email,
        role: role || 'salesperson',
        avatar: avatar || null,
        color: color || 'bg-gradient-to-r from-blue-500 to-purple-500',
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Team member not found' });
      }
      throw error;
    }
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE team member
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('salespersons')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST toggle active
router.post('/:id/toggle_active', async (req, res) => {
  try {
    const { data: member, error: fetchError } = await supabase
      .from('salespersons')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Team member not found' });
      }
      throw fetchError;
    }

    const newStatus = !member.is_active;
    
    const { error: updateError } = await supabase
      .from('salespersons')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (updateError) throw updateError;
    
    res.json({ is_active: newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
