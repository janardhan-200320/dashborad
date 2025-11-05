import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'b8035af1-4c81-40d9-a4ac-143350c3d41f';

// Helper to combine date and time into ISO timestamp
const combineDateTimeToISO = (date, time) => {
  if (!date || !time) return null;
  return `${date}T${time}:00Z`;
};

// GET all appointments (with pagination)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 100, organization_id = DEFAULT_ORG_ID } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email),
        service:services(id, name, duration_minutes, price),
        salesperson:salespersons(id, first_name, last_name)
      `, { count: 'exact' })
      .eq('organization_id', organization_id)
      .order('start_time', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error, count } = await query;

    if (error) throw error;

    res.json({
      count: count,
      next: offset + appointments.length < count ? `?page=${parseInt(page) + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}&limit=${limit}` : null,
      results: appointments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET upcoming appointments
router.get('/upcoming', async (req, res) => {
  try {
    const { organization_id = DEFAULT_ORG_ID } = req.query;

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email),
        service:services(id, name, duration_minutes, price),
        salesperson:salespersons(id, first_name, last_name)
      `)
      .eq('organization_id', organization_id)
      .eq('status', 'upcoming')
      .order('start_time', { ascending: true });

    if (error) throw error;
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET today's appointments
router.get('/today', async (req, res) => {
  try {
    const { organization_id = DEFAULT_ORG_ID } = req.query;
    const today = new Date().toISOString().split('T')[0];
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email),
        service:services(id, name, duration_minutes, price),
        salesperson:salespersons(id, first_name, last_name)
      `)
      .eq('organization_id', organization_id)
      .gte('start_time', `${today}T00:00:00Z`)
      .lt('start_time', `${today}T23:59:59Z`)
      .order('start_time', { ascending: true });

    if (error) throw error;
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET appointment stats
router.get('/stats', async (req, res) => {
  try {
    const { organization_id = DEFAULT_ORG_ID } = req.query;

    const { count: total } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id);

    const { count: upcoming } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('status', 'upcoming');

    const { count: completed } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('status', 'completed');

    const { count: cancelled } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('status', 'cancelled');
    
    res.json({
      total: total || 0,
      upcoming: upcoming || 0,
      completed: completed || 0,
      cancelled: cancelled || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single appointment
router.get('/:id', async (req, res) => {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email),
        service:services(id, name, duration_minutes, price),
        salesperson:salespersons(id, first_name, last_name)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      throw error;
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE appointment
router.post('/', async (req, res) => {
  try {
    const { 
      customer_id, 
      service_id, 
      salesperson_id, 
      date, 
      time, 
      status, 
      notes, 
      meeting_platform, 
      meeting_link,
      organization_id = DEFAULT_ORG_ID 
    } = req.body;
    
    if (!customer_id || !date || !time) {
      return res.status(400).json({ error: 'customer_id, date, and time are required' });
    }

    const start_time = combineDateTimeToISO(date, time);
    
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([{
        organization_id,
        customer_id,
        service_id: service_id || null,
        salesperson_id: salesperson_id || null,
        start_time,
        end_time: start_time, // You can calculate based on service duration if needed
        status: status || 'upcoming',
        notes: notes || null,
        meeting_platform: meeting_platform || null,
        meeting_link: meeting_link || null
      }])
      .select(`
        *,
        customer:customers(id, first_name, last_name, email),
        service:services(id, name, duration_minutes, price),
        salesperson:salespersons(id, first_name, last_name)
      `)
      .single();

    if (error) throw error;
    
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE appointment
router.put('/:id', async (req, res) => {
  try {
    const { customer_id, service_id, salesperson_id, date, time, status, notes, meeting_platform, meeting_link } = req.body;
    
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (customer_id !== undefined) updateData.customer_id = customer_id;
    if (service_id !== undefined) updateData.service_id = service_id;
    if (salesperson_id !== undefined) updateData.salesperson_id = salesperson_id;
    if (date && time) updateData.start_time = combineDateTimeToISO(date, time);
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (meeting_platform !== undefined) updateData.meeting_platform = meeting_platform;
    if (meeting_link !== undefined) updateData.meeting_link = meeting_link;
    
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', req.params.id)
      .select(`
        *,
        customer:customers(id, first_name, last_name, email),
        service:services(id, name, duration_minutes, price),
        salesperson:salespersons(id, first_name, last_name)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      throw error;
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST complete appointment
router.post('/:id/complete', async (req, res) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (error) throw error;
    
    res.json({ status: 'completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST cancel appointment
router.post('/:id/cancel', async (req, res) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (error) throw error;
    
    res.json({ status: 'cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
