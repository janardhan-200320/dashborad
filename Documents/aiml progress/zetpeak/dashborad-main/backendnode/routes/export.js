import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Export appointments
router.get('/appointments', (req, res) => {
  try {
    const { format = 'json', status, date_from, date_to } = req.query;
    
    let query = `
      SELECT 
        a.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        s.name as service_name,
        s.duration as service_duration,
        s.price as service_price
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    if (date_from) {
      query += ' AND a.date >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND a.date <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY a.date DESC, a.time DESC';
    
    const appointments = db.prepare(query).all(...params);
    
    if (format === 'csv') {
      // Convert to CSV
      const headers = [
        'ID', 'Customer Name', 'Customer Email', 'Customer Phone',
        'Service', 'Date', 'Time', 'Status', 'Staff',
        'Duration', 'Price', 'Meeting Platform', 'Meeting Link', 'Notes'
      ];
      
      const rows = appointments.map(a => [
        a.id,
        a.customer_name || '',
        a.customer_email || '',
        a.customer_phone || '',
        a.service_name || '',
        a.date || '',
        a.time || '',
        a.status || '',
        a.staff || '',
        a.service_duration || '',
        a.service_price || '',
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
router.get('/customers', (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const customers = db.prepare(`
      SELECT * FROM customers
      ORDER BY created_at DESC
    `).all();
    
    if (format === 'csv') {
      const headers = [
        'ID', 'Name', 'Email', 'Phone', 'Total Bookings',
        'Last Appointment', 'Notes', 'Created At'
      ];
      
      const rows = customers.map(c => [
        c.id,
        c.name || '',
        c.email || '',
        c.phone || '',
        c.total_bookings || 0,
        c.last_appointment || '',
        (c.notes || '').replace(/"/g, '""'),
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
router.get('/services', (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const services = db.prepare(`
      SELECT * FROM services
      ORDER BY name ASC
    `).all();
    
    if (format === 'csv') {
      const headers = [
        'ID', 'Name', 'Description', 'Duration', 'Price',
        'Category', 'Enabled', 'Created At'
      ];
      
      const rows = services.map(s => [
        s.id,
        s.name || '',
        (s.description || '').replace(/"/g, '""'),
        s.duration || '',
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
router.get('/team-members', (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const teamMembers = db.prepare(`
      SELECT * FROM team_members
      ORDER BY name ASC
    `).all();
    
    if (format === 'csv') {
      const headers = [
        'ID', 'Name', 'Email', 'Role', 'Active', 'Created At'
      ];
      
      const rows = teamMembers.map(t => [
        t.id,
        t.name || '',
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
router.get('/all', (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const data = {
      appointments: db.prepare('SELECT * FROM appointments ORDER BY date DESC').all(),
      customers: db.prepare('SELECT * FROM customers ORDER BY name ASC').all(),
      services: db.prepare('SELECT * FROM services ORDER BY name ASC').all(),
      team_members: db.prepare('SELECT * FROM team_members ORDER BY name ASC').all(),
      workspaces: db.prepare('SELECT * FROM workspaces ORDER BY name ASC').all(),
      resources: db.prepare('SELECT * FROM resources ORDER BY name ASC').all(),
      locations: db.prepare('SELECT * FROM locations ORDER BY name ASC').all(),
      integrations: db.prepare('SELECT id, name, type, is_connected FROM integrations ORDER BY name ASC').all(),
      custom_labels: db.prepare('SELECT * FROM custom_labels ORDER BY label_type ASC').all(),
      roles: db.prepare('SELECT * FROM roles ORDER BY name ASC').all()
    };
    
    // Parse JSON fields
    data.workspaces.forEach(w => {
      if (w.settings) w.settings = JSON.parse(w.settings);
    });
    
    data.integrations.forEach(i => {
      if (i.settings) i.settings = JSON.parse(i.settings);
    });
    
    data.roles.forEach(r => {
      if (r.permissions) r.permissions = JSON.parse(r.permissions);
    });
    
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
