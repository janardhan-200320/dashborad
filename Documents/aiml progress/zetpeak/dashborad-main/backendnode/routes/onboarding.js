import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// GET all onboarding records
router.get('/', (req, res) => {
  try {
    const onboarding = db.prepare('SELECT * FROM business_onboarding ORDER BY created_at DESC').all();
    
    // Parse JSON fields
    const formatted = onboarding.map(item => ({
      ...item,
      industries: item.industries ? JSON.parse(item.industries) : [],
      business_needs: item.business_needs ? JSON.parse(item.business_needs) : [],
      available_days: item.available_days ? JSON.parse(item.available_days) : []
    }));

    res.json({
      count: formatted.length,
      next: null,
      previous: null,
      results: formatted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single onboarding
router.get('/:id', (req, res) => {
  try {
    const onboarding = db.prepare('SELECT * FROM business_onboarding WHERE id = ?').get(req.params.id);
    
    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    // Parse JSON fields
    const formatted = {
      ...onboarding,
      industries: onboarding.industries ? JSON.parse(onboarding.industries) : [],
      business_needs: onboarding.business_needs ? JSON.parse(onboarding.business_needs) : [],
      available_days: onboarding.available_days ? JSON.parse(onboarding.available_days) : []
    };
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE onboarding
router.post('/', (req, res) => {
  try {
    const {
      business_name, website_url, currency, industries, business_needs,
      timezone, available_days, available_time_start, available_time_end,
      event_type_label, team_member_label
    } = req.body;
    
    if (!business_name) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const insert = db.prepare(`
      INSERT INTO business_onboarding (
        business_name, website_url, currency, industries, business_needs,
        timezone, available_days, available_time_start, available_time_end,
        event_type_label, team_member_label, is_completed, current_step
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      business_name,
      website_url || null,
      currency || 'INR',
      industries ? JSON.stringify(industries) : null,
      business_needs ? JSON.stringify(business_needs) : null,
      timezone || null,
      available_days ? JSON.stringify(available_days) : null,
      available_time_start || null,
      available_time_end || null,
      event_type_label || null,
      team_member_label || null,
      1, // is_completed
      4  // current_step
    );
    
    const onboarding = db.prepare('SELECT * FROM business_onboarding WHERE id = ?').get(result.lastInsertRowid);
    
    // Parse JSON fields
    const formatted = {
      ...onboarding,
      industries: onboarding.industries ? JSON.parse(onboarding.industries) : [],
      business_needs: onboarding.business_needs ? JSON.parse(onboarding.business_needs) : [],
      available_days: onboarding.available_days ? JSON.parse(onboarding.available_days) : []
    };
    
    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE onboarding
router.put('/:id', (req, res) => {
  try {
    const {
      business_name, website_url, currency, industries, business_needs,
      timezone, available_days, available_time_start, available_time_end,
      event_type_label, team_member_label
    } = req.body;
    
    const update = db.prepare(`
      UPDATE business_onboarding 
      SET business_name = ?, website_url = ?, currency = ?, industries = ?,
          business_needs = ?, timezone = ?, available_days = ?,
          available_time_start = ?, available_time_end = ?,
          event_type_label = ?, team_member_label = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = update.run(
      business_name,
      website_url,
      currency,
      industries ? JSON.stringify(industries) : null,
      business_needs ? JSON.stringify(business_needs) : null,
      timezone,
      available_days ? JSON.stringify(available_days) : null,
      available_time_start,
      available_time_end,
      event_type_label,
      team_member_label,
      req.params.id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }
    
    const onboarding = db.prepare('SELECT * FROM business_onboarding WHERE id = ?').get(req.params.id);
    res.json(onboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
