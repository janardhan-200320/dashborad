import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'b8035af1-4c81-40d9-a4ac-143350c3d41f';

// Helper to parse duration string like "60 mins" to minutes
const parseDuration = (duration) => {
  if (typeof duration === 'number') return duration;
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

// GET all services (with pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 100, organization_id = DEFAULT_ORG_ID } = req.query;
    const offset = (page - 1) * limit;

    const { data: services, error, count } = await supabase
      .from('services')
      .select('*', { count: 'exact' })
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      count: count,
      next: offset + services.length < count ? `?page=${parseInt(page) + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}&limit=${limit}` : null,
      results: services
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET active services
router.get('/active', async (req, res) => {
  try {
    const { organization_id = DEFAULT_ORG_ID } = req.query;

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('is_enabled', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single service
router.get('/:id', async (req, res) => {
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Service not found' });
      }
      throw error;
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE service
router.post('/', async (req, res) => {
  try {
    const { name, description, duration, price, category, is_enabled, organization_id = DEFAULT_ORG_ID } = req.body;
    
    if (!name || !duration) {
      return res.status(400).json({ error: 'Name and duration are required' });
    }

    const { data: service, error } = await supabase
      .from('services')
      .insert([{
        organization_id,
        name,
        description: description || null,
        duration_minutes: parseDuration(duration),
        price: price ? parseFloat(price) : null,
        category: category || 'other',
        is_enabled: is_enabled !== undefined ? is_enabled : true
      }])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE service
router.put('/:id', async (req, res) => {
  try {
    const { name, description, duration, price, category, is_enabled } = req.body;
    
    const { data: service, error } = await supabase
      .from('services')
      .update({
        name,
        description: description || null,
        duration_minutes: parseDuration(duration),
        price: price ? parseFloat(price) : null,
        category: category || 'other',
        is_enabled: is_enabled !== undefined ? is_enabled : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Service not found' });
      }
      throw error;
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST toggle enabled
router.post('/:id/toggle_enabled', async (req, res) => {
  try {
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Service not found' });
      }
      throw fetchError;
    }

    const newStatus = !service.is_enabled;
    
    const { error: updateError } = await supabase
      .from('services')
      .update({ 
        is_enabled: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (updateError) throw updateError;
    
    res.json({ is_enabled: newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
