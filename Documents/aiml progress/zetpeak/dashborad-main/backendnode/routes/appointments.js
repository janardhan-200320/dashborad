import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// Helper to get appointment with customer and service names
function getAppointmentWithDetails(id) {
  return db.prepare(`
    SELECT 
      a.*,
      c.name as customer_name,
      s.name as service_name
    FROM appointments a
    LEFT JOIN customers c ON a.customer_id = c.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.id = ?
  `).get(id);
}

// GET all appointments (with pagination)
router.get('/', (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        a.id, a.customer_id as customer, a.service_id as service,
        c.name as customer_name, s.name as service_name,
        a.staff, a.date, a.time, a.status, a.notes,
        a.meeting_platform, a.meeting_link, a.created_at, a.updated_at
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
    `;
    
    let countQuery = 'SELECT COUNT(*) as count FROM appointments';
    const params = [];

    if (status) {
      query += ' WHERE a.status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
    }

    const total = db.prepare(countQuery).get(...params);
    
    query += ' ORDER BY a.date DESC, a.time DESC LIMIT ? OFFSET ?';
    const appointments = db.prepare(query).all(...params, parseInt(limit), offset);

    res.json({
      count: total.count,
      next: offset + appointments.length < total.count ? `?page=${parseInt(page) + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}&limit=${limit}` : null,
      results: appointments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET upcoming appointments
router.get('/upcoming', (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT 
        a.id, a.customer_id as customer, a.service_id as service,
        c.name as customer_name, s.name as service_name,
        a.staff, a.date, a.time, a.status, a.notes,
        a.meeting_platform, a.meeting_link, a.created_at, a.updated_at
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.status = 'upcoming'
      ORDER BY a.date ASC, a.time ASC
    `).all();
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET today's appointments
router.get('/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = db.prepare(`
      SELECT 
        a.id, a.customer_id as customer, a.service_id as service,
        c.name as customer_name, s.name as service_name,
        a.staff, a.date, a.time, a.status, a.notes,
        a.meeting_platform, a.meeting_link, a.created_at, a.updated_at
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.date = ?
      ORDER BY a.time ASC
    `).all(today);
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET appointment stats
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
    const upcoming = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'upcoming'").get();
    const completed = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'").get();
    const cancelled = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'").get();
    
    res.json({
      total: total.count,
      upcoming: upcoming.count,
      completed: completed.count,
      cancelled: cancelled.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single appointment
router.get('/:id', (req, res) => {
  try {
    const appointment = getAppointmentWithDetails(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE appointment
router.post('/', (req, res) => {
  try {
    const { customer_id, service_id, staff, date, time, status, notes, meeting_platform, meeting_link } = req.body;
    
    if (!customer_id || !date || !time) {
      return res.status(400).json({ error: 'customer_id, date, and time are required' });
    }
    // Ensure service_id refers to an existing service; if not, set to null to avoid FK errors
    let validServiceId = null;
    if (service_id) {
      const svc = db.prepare('SELECT id FROM services WHERE id = ?').get(service_id);
      if (svc) validServiceId = service_id;
    }

    const insert = db.prepare(`
      INSERT INTO appointments (customer_id, service_id, staff, date, time, status, notes, meeting_platform, meeting_link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      customer_id,
      validServiceId,
      staff || null,
      date,
      time,
      status || 'upcoming',
      notes || null,
      meeting_platform || null,
      meeting_link || null
    );

    // Update customer's total bookings
    db.prepare(`
      UPDATE customers 
      SET total_bookings = (SELECT COUNT(*) FROM appointments WHERE customer_id = ?),
          last_appointment = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(customer_id, date, customer_id);
    
    const appointment = getAppointmentWithDetails(result.lastInsertRowid);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE appointment
router.put('/:id', (req, res) => {
  try {
    const { customer_id, service_id, staff, date, time, status, notes, meeting_platform, meeting_link } = req.body;
    
    const update = db.prepare(`
      UPDATE appointments 
      SET customer_id = COALESCE(?, customer_id),
          service_id = COALESCE(?, service_id),
          staff = COALESCE(?, staff),
          date = COALESCE(?, date),
          time = COALESCE(?, time),
          status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          meeting_platform = COALESCE(?, meeting_platform),
          meeting_link = COALESCE(?, meeting_link),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = update.run(
      customer_id, service_id, staff, date, time, status, notes, meeting_platform, meeting_link,
      req.params.id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const appointment = getAppointmentWithDetails(req.params.id);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE appointment
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST complete appointment
router.post('/:id/complete', (req, res) => {
  try {
    const result = db.prepare(`
      UPDATE appointments 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ status: 'completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST cancel appointment
router.post('/:id/cancel', (req, res) => {
  try {
    const result = db.prepare(`
      UPDATE appointments 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ status: 'cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
