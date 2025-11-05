import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'b8035af1-4c81-40d9-a4ac-143350c3d41f';

// Export appointments
router.get('/appointments', async (req, res) => {
  try {
    const { format = 'json', status, date_from, date_to, organization_id = DEFAULT_ORG_ID } = req.query;
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(first_name, last_name, email, phone),
        service:services(name, duration_minutes, price)
      `)
      .eq('organization_id', organization_id)
      .order('start_time', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (date_from) {
      query = query.gte('start_time', `${date_from}T00:00:00Z`);
    }
    
    if (date_to) {
      query = query.lte('start_time', `${date_to}T23:59:59Z`);
    }
    
    const { data: appointments, error } = await query;
    if (error) throw error;
    
    if (format === 'csv') {
      const headers = [
        'ID', 'Customer Name', 'Customer Email', 'Customer Phone',
        'Service', 'Start Time', 'Status', 'Salesperson ID',
        'Duration (mins)', 'Price', 'Meeting Platform', 'Meeting Link', 'Notes'
      ];
      
      const rows = appointments.map(a => [
        a.id,
        a.customer ? `${a.customer.first_name} ${a.customer.last_name}` : '',
        a.customer?.email || '',
        a.customer?.phone || '',
        a.service?.name || '',
        a.start_time || '',
        a.status || '',
        a.salesperson_id || '',
        a.service?.duration_minutes || '',
        a.service?.price || '',
        a.meeting_platform || '',
        a.meeting_link || '',
        (a.notes || '').replace(/"/g, '""')
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=appointments.csv');
      res.send(csv);
    } else {
      res.json({
        count: appointments.length,
        results: appointments
      });
    }
  } catch (error) {
    console.error('Error exporting appointments:', error);
    res.status(500).json({ error: 'Failed to export appointments' });
  }
});

// Export customers
router.get('/customers', async (req, res) => {
  try {
    const { format = 'json', organization_id = DEFAULT_ORG_ID } = req.query;
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (format === 'csv') {
      const headers = [
        'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Notes', 'Active', 'Created At'
      ];
      
      const rows = customers.map(c => [
        c.id,
        c.first_name || '',
        c.last_name || '',
        c.email || '',
        c.phone || '',
        (c.notes || '').replace(/"/g, '""'),
        c.is_active ? 'Yes' : 'No',
        c.created_at || ''
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      res.send(csv);
    } else {
      res.json({
        count: customers.length,
        results: customers
      });
    }
  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({ error: 'Failed to export customers' });
  }
});

// Export services
router.get('/services', async (req, res) => {
  try {
    const { format = 'json', organization_id = DEFAULT_ORG_ID } = req.query;
    
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('organization_id', organization_id)
      .order('name', { ascending: true });

    if (error) throw error;
    
    if (format === 'csv') {
      const headers = [
        'ID', 'Name', 'Description', 'Duration (mins)', 'Price',
        'Category', 'Enabled', 'Created At'
      ];
      
      const rows = services.map(s => [
        s.id,
        s.name || '',
        (s.description || '').replace(/"/g, '""'),
        s.duration_minutes || '',
        s.price || '',
        s.category || '',
        s.is_enabled ? 'Yes' : 'No',
        s.created_at || ''
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=services.csv');
      res.send(csv);
    } else {
      res.json({
        count: services.length,
        results: services
      });
    }
  } catch (error) {
    console.error('Error exporting services:', error);
    res.status(500).json({ error: 'Failed to export services' });
  }
});

// Export team members
router.get('/team-members', async (req, res) => {
  try {
    const { format = 'json', organization_id = DEFAULT_ORG_ID } = req.query;
    
    const { data: teamMembers, error } = await supabase
      .from('salespersons')
      .select('*')
      .eq('organization_id', organization_id)
      .order('first_name', { ascending: true });

    if (error) throw error;
    
    if (format === 'csv') {
      const headers = [
        'ID', 'First Name', 'Last Name', 'Email', 'Role', 'Active', 'Created At'
      ];
      
      const rows = teamMembers.map(t => [
        t.id,
        t.first_name || '',
        t.last_name || '',
        t.email || '',
        t.role || '',
        t.is_active ? 'Yes' : 'No',
        t.created_at || ''
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=team_members.csv');
      res.send(csv);
    } else {
      res.json({
        count: teamMembers.length,
        results: teamMembers
      });
    }
  } catch (error) {
    console.error('Error exporting team members:', error);
    res.status(500).json({ error: 'Failed to export team members' });
  }
});

// Export all data (bulk export)
router.get('/all', async (req, res) => {
  try {
    const { format = 'json', organization_id = DEFAULT_ORG_ID } = req.query;
    
    const [appointments, customers, services, salespersons, businesses] = await Promise.all([
      supabase.from('appointments').select('*').eq('organization_id', organization_id).order('start_time', { ascending: false }),
      supabase.from('customers').select('*').eq('organization_id', organization_id).order('first_name', { ascending: true }),
      supabase.from('services').select('*').eq('organization_id', organization_id).order('name', { ascending: true }),
      supabase.from('salespersons').select('*').eq('organization_id', organization_id).order('first_name', { ascending: true }),
      supabase.from('businesses').select('*').eq('organization_id', organization_id)
    ]);

    const data = {
      appointments: appointments.data || [],
      customers: customers.data || [],
      services: services.data || [],
      team_members: salespersons.data || [],
      businesses: businesses.data || []
    };
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=full_export.json');
      res.json(data);
    } else {
      res.status(400).json({ error: 'CSV format not supported for bulk export. Use format=json' });
    }
  } catch (error) {
    console.error('Error exporting all data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
