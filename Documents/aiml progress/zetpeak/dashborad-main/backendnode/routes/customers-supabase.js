import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();

// Get organization ID from request (you'll need to implement auth middleware)
const getOrganizationId = (req) => {
  // For now, return a default org ID - replace with actual auth logic
  return req.headers['x-organization-id'] || null;
};

// GET all customers
router.get('/', async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { page = 1, limit = 10, search = '', sort = 'created_at', order = 'desc' } = req.query;
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Search filter
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      results: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { id } = req.params;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { first_name, last_name, email, phone, notes, date_of_birth, address, tags } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{
        organization_id: organizationId,
        first_name,
        last_name,
        email,
        phone: phone || null,
        notes: notes || null,
        date_of_birth: date_of_birth || null,
        address: address || null,
        tags: tags || [],
        total_spent: 0,
        total_visits: 0,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Customer with this email already exists' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { id } = req.params;
    const { first_name, last_name, email, phone, notes, date_of_birth, address, tags, is_active } = req.body;

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (notes !== undefined) updates.notes = notes;
    if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
    if (address !== undefined) updates.address = address;
    if (tags !== undefined) updates.tags = tags;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { id } = req.params;

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw error;
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// GET customer statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { id } = req.params;

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('total_spent, total_visits, last_visit')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (customerError) {
      throw customerError;
    }

    // Get appointment count
    const { count: appointmentCount, error: appointmentError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id)
      .eq('organization_id', organizationId);

    if (appointmentError) {
      throw appointmentError;
    }

    res.json({
      total_spent: customer.total_spent || 0,
      total_visits: customer.total_visits || 0,
      total_appointments: appointmentCount || 0,
      last_visit: customer.last_visit
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
});

export default router;
