import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'b8035af1-4c81-40d9-a4ac-143350c3d41f';

// GET all customers (with pagination)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 100, organization_id = DEFAULT_ORG_ID } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: customers, error, count } = await query;

    if (error) throw error;

    res.json({
      count: count,
      next: offset + customers.length < count ? `?page=${parseInt(page) + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}&limit=${limit}` : null,
      results: customers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw error;
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE customer
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, notes, organization_id = DEFAULT_ORG_ID } = req.body;
    
    if (!first_name || !email) {
      return res.status(400).json({ error: 'First name and email are required' });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert([{
        organization_id,
        first_name,
        last_name: last_name || '',
        email,
        phone: phone || null,
        notes: notes || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Email already exists' });
      }
      throw error;
    }
    
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE customer
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, notes } = req.body;
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        first_name,
        last_name: last_name || '',
        email,
        phone: phone || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw error;
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
