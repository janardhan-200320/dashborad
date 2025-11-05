import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Get all notification settings
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM notification_settings ORDER BY entity_type ASC, event_type ASC').all();

    // Group by entity type for easier frontend consumption
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.entity_type]) {
        acc[setting.entity_type] = {};
      }
      acc[setting.entity_type][setting.event_type] = setting.is_enabled;
      return acc;
    }, {});

    res.json({
      count: settings.length,
      results: groupedSettings
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification setting
router.put('/:entityType/:eventType', (req, res) => {
  try {
    const { entityType, eventType } = req.params;
    const { is_enabled } = req.body;

    if (typeof is_enabled !== 'boolean') {
      return res.status(400).json({ error: 'is_enabled must be a boolean' });
    }

    // Insert or update the setting
    const upsert = db.prepare(`
      INSERT INTO notification_settings (entity_type, event_type, is_enabled, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(entity_type, event_type) DO UPDATE SET
        is_enabled = excluded.is_enabled,
        updated_at = CURRENT_TIMESTAMP
    `);

    upsert.run(entityType, eventType, is_enabled ? 1 : 0);

    res.json({
      entity_type: entityType,
      event_type: eventType,
      is_enabled: is_enabled
    });
  } catch (error) {
    console.error('Error updating notification setting:', error);
    res.status(500).json({ error: 'Failed to update notification setting' });
  }
});

// Bulk update notification settings
router.put('/', (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      Object.entries(settings).forEach(([entityType, events]) => {
        Object.entries(events).forEach(([eventType, isEnabled]) => {
          const upsert = db.prepare(`
            INSERT INTO notification_settings (entity_type, event_type, is_enabled, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(entity_type, event_type) DO UPDATE SET
              is_enabled = excluded.is_enabled,
              updated_at = CURRENT_TIMESTAMP
          `);
          upsert.run(entityType, eventType, isEnabled ? 1 : 0);
        });
      });
    });

    transaction();

    res.json({ message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

export default router;