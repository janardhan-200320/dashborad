import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database/init.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

// Signup
router.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const info = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name || null, email, password_hash);
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed', message: err.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = db.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // store session token (optional)
    try {
      db.prepare('UPDATE users SET session_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(token, user.id);
    } catch (e) {
      // non-fatal
      console.warn('Failed to store session token:', e.message);
    }

    res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// Middleware to protect routes
function authenticate(req, res, next) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: 'Missing token' });
  const token = m[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Sync endpoint: accepts client data and persists idempotently
router.post('/sync', authenticate, (req, res) => {
  try {
    const payload = req.body || {};
    const customers = Array.isArray(payload.customers) ? payload.customers : [];
    const services = Array.isArray(payload.services) ? payload.services : [];
    const team_members = Array.isArray(payload.team_members) ? payload.team_members : [];
    const appointments = Array.isArray(payload.appointments) ? payload.appointments : [];
    const custom_labels = Array.isArray(payload.custom_labels) ? payload.custom_labels : [];

    const summary = {
      customers: { inserted: 0, updated: 0 },
      services: { inserted: 0, updated: 0 },
      team_members: { inserted: 0, updated: 0 },
      appointments: { inserted: 0, updated: 0 },
      custom_labels: { inserted: 0, updated: 0 }
    };

    // Customers: upsert by email
    const findCustomerByEmail = db.prepare('SELECT * FROM customers WHERE email = ?');
    const insertCustomer = db.prepare('INSERT INTO customers (name, email, phone, notes, total_bookings, last_appointment) VALUES (?, ?, ?, ?, ?, ?)');
    const updateCustomer = db.prepare('UPDATE customers SET name = ?, phone = ?, notes = ?, total_bookings = ?, last_appointment = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?');

    for (const c of customers) {
      if (!c.email) continue;
      const existing = findCustomerByEmail.get(c.email);
      if (existing) {
        updateCustomer.run(c.name || existing.name, c.phone || existing.phone, c.notes || existing.notes, c.total_bookings ?? existing.total_bookings, c.last_appointment || existing.last_appointment, c.email);
        summary.customers.updated++;
      } else {
        insertCustomer.run(c.name || null, c.email, c.phone || null, c.notes || null, c.total_bookings || 0, c.last_appointment || null);
        summary.customers.inserted++;
      }
    }

    // Services: upsert by id if provided else by name
    const findServiceById = db.prepare('SELECT * FROM services WHERE id = ?');
    const findServiceByName = db.prepare('SELECT * FROM services WHERE name = ?');
    const insertService = db.prepare('INSERT INTO services (name, description, duration, price, category, is_enabled) VALUES (?, ?, ?, ?, ?, ?)');
    const updateService = db.prepare('UPDATE services SET name = ?, description = ?, duration = ?, price = ?, category = ?, is_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

    for (const s of services) {
      if (s.id) {
        const existing = findServiceById.get(s.id);
        if (existing) {
          updateService.run(s.name || existing.name, s.description || existing.description, s.duration || existing.duration, s.price || existing.price, s.category || existing.category, s.is_enabled ?? existing.is_enabled, s.id);
          summary.services.updated++;
          continue;
        }
      }
      if (s.name) {
        const byName = findServiceByName.get(s.name);
        if (byName) {
          updateService.run(s.name || byName.name, s.description || byName.description, s.duration || byName.duration, s.price || byName.price, s.category || byName.category, s.is_enabled ?? byName.is_enabled, byName.id);
          summary.services.updated++;
        } else {
          insertService.run(s.name, s.description || null, s.duration || '00:00', s.price || null, s.category || 'other', s.is_enabled ?? 1);
          summary.services.inserted++;
        }
      }
    }

    // Team members: upsert by email
    const findMemberByEmail = db.prepare('SELECT * FROM team_members WHERE email = ?');
    const insertMember = db.prepare('INSERT INTO team_members (name, email, role, avatar, color, is_active) VALUES (?, ?, ?, ?, ?, ?)');
    const updateMember = db.prepare('UPDATE team_members SET name = ?, role = ?, avatar = ?, color = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?');

    for (const m of team_members) {
      if (!m.email) continue;
      const existing = findMemberByEmail.get(m.email);
      if (existing) {
        updateMember.run(m.name || existing.name, m.role || existing.role, m.avatar || existing.avatar, m.color || existing.color, m.is_active ?? existing.is_active, m.email);
        summary.team_members.updated++;
      } else {
        insertMember.run(m.name || null, m.email, m.role || 'salesperson', m.avatar || null, m.color || null, m.is_active ?? 1);
        summary.team_members.inserted++;
      }
    }

    // Custom labels: upsert by label_type+label_value
    const findLabel = db.prepare('SELECT * FROM custom_labels WHERE label_type = ? AND label_value = ?');
    const insertLabel = db.prepare('INSERT INTO custom_labels (label_type, label_value, description) VALUES (?, ?, ?)');
    const updateLabel = db.prepare('UPDATE custom_labels SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

    for (const l of custom_labels) {
      if (!l.label_type || !l.label_value) continue;
      const existing = findLabel.get(l.label_type, l.label_value);
      if (existing) {
        updateLabel.run(l.description || existing.description, existing.id);
        summary.custom_labels.updated++;
      } else {
        insertLabel.run(l.label_type, l.label_value, l.description || null);
        summary.custom_labels.inserted++;
      }
    }

    // Appointments: try to upsert by id or by customer+date+time+service
    const findApptById = db.prepare('SELECT * FROM appointments WHERE id = ?');
    const findApptByUnique = db.prepare('SELECT * FROM appointments WHERE customer_id = ? AND date = ? AND time = ? AND service_id = ?');
    const insertAppt = db.prepare('INSERT INTO appointments (customer_id, service_id, staff, date, time, status, notes, meeting_platform, meeting_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const updateAppt = db.prepare('UPDATE appointments SET customer_id = ?, service_id = ?, staff = ?, date = ?, time = ?, status = ?, notes = ?, meeting_platform = ?, meeting_link = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

    for (const a of appointments) {
      // Resolve customer_id
      let customer_id = null;
      if (a.customer_id) {
        const c = db.prepare('SELECT id FROM customers WHERE id = ?').get(a.customer_id);
        if (c) customer_id = c.id;
      }
      if (!customer_id && a.customer_email) {
        const c = findCustomerByEmail.get(a.customer_email);
        if (c) customer_id = c.id;
        else {
          const info = insertCustomer.run(a.customer_name || null, a.customer_email, a.customer_phone || null, a.customer_notes || null, 0, null);
          customer_id = info.lastInsertRowid;
        }
      }

      if (!customer_id) {
        // skip if we cannot resolve a customer
        continue;
      }

      if (a.id) {
        const existing = findApptById.get(a.id);
        if (existing) {
          updateAppt.run(customer_id, a.service_id || existing.service_id, a.staff || existing.staff, a.date || existing.date, a.time || existing.time, a.status || existing.status, a.notes || existing.notes, a.meeting_platform || existing.meeting_platform, a.meeting_link || existing.meeting_link, a.id);
          summary.appointments.updated++;
          continue;
        }
      }

      const byUnique = findApptByUnique.get(customer_id, a.date, a.time, a.service_id || null);
      if (byUnique) {
        updateAppt.run(customer_id, a.service_id || byUnique.service_id, a.staff || byUnique.staff, a.date || byUnique.date, a.time || byUnique.time, a.status || byUnique.status, a.notes || byUnique.notes, a.meeting_platform || byUnique.meeting_platform, a.meeting_link || byUnique.meeting_link, byUnique.id);
        summary.appointments.updated++;
      } else {
        insertAppt.run(customer_id, a.service_id || null, a.staff || null, a.date, a.time, a.status || 'upcoming', a.notes || null, a.meeting_platform || null, a.meeting_link || null);
        summary.appointments.inserted++;
      }
    }

    res.json({ ok: true, summary });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Sync failed', message: err.message });
  }
});

export default router;
