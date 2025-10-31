import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get organization settings
router.get('/', (req, res) => {
  try {
    let settings = db.prepare('SELECT * FROM organization_settings WHERE id = 1').get();
    
    // If no settings exist, create default
    if (!settings) {
      const insert = db.prepare(`
        INSERT INTO organization_settings (
          company_name, brand_color, timezone, working_days,
          working_hours_start, working_hours_end, allow_guest_booking, require_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insert.run(
        'My Company',
        '#6366f1',
        'Asia/Kolkata',
        JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        '09:00',
        '18:00',
        1,
        0
      );
      
      settings = db.prepare('SELECT * FROM organization_settings WHERE id = ?').get(result.lastInsertRowid);
    }
    
    // Parse JSON fields
    if (settings.working_days) {
      settings.working_days = JSON.parse(settings.working_days);
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    res.status(500).json({ error: 'Failed to fetch organization settings' });
  }
});

// Update organization settings
router.put('/', (req, res) => {
  try {
    const {
      company_name,
      industry,
      email,
      phone,
      logo,
      brand_color,
      timezone,
      working_days,
      working_hours_start,
      working_hours_end,
      booking_url,
      meta_title,
      meta_description,
      allow_guest_booking,
      require_login
    } = req.body;

    const update = db.prepare(`
      UPDATE organization_settings SET
        company_name = ?,
        industry = ?,
        email = ?,
        phone = ?,
        logo = ?,
        brand_color = ?,
        timezone = ?,
        working_days = ?,
        working_hours_start = ?,
        working_hours_end = ?,
        booking_url = ?,
        meta_title = ?,
        meta_description = ?,
        allow_guest_booking = ?,
        require_login = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    update.run(
      company_name,
      industry,
      email,
      phone,
      logo,
      brand_color,
      timezone,
      JSON.stringify(working_days),
      working_hours_start,
      working_hours_end,
      booking_url,
      meta_title,
      meta_description,
      allow_guest_booking ? 1 : 0,
      require_login ? 1 : 0
    );

    const settings = db.prepare('SELECT * FROM organization_settings WHERE id = 1').get();
    if (settings.working_days) {
      settings.working_days = JSON.parse(settings.working_days);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating organization settings:', error);
    res.status(500).json({ error: 'Failed to update organization settings' });
  }
});

export default router;
