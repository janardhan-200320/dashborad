import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'b8035af1-4c81-40d9-a4ac-143350c3d41f';

// GET all onboarding records
router.get('/', async (req, res) => {
  try {
    const { organization_id = DEFAULT_ORG_ID } = req.query;

    const { data: onboarding, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      count: onboarding.length,
      next: null,
      previous: null,
      results: onboarding
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single onboarding
router.get('/:id', async (req, res) => {
  try {
    const { data: onboarding, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Onboarding not found' });
      }
      throw error;
    }
    
    res.json(onboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE onboarding
router.post('/', async (req, res) => {
  try {
    const {
      business_name, website_url, currency, industries, business_needs,
      timezone, available_days, available_time_start, available_time_end,
      event_type_label, team_member_label, organization_id = DEFAULT_ORG_ID
    } = req.body;
    
    if (!business_name) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const { data: onboarding, error } = await supabase
      .from('businesses')
      .insert([{
        organization_id,
        business_name,
        website_url: website_url || null,
        currency: currency || 'INR',
        industries: industries || [],
        business_needs: business_needs || [],
        timezone: timezone || null,
        available_days: available_days || [],
        available_time_start: available_time_start || null,
        available_time_end: available_time_end || null,
        event_type_label: event_type_label || null,
        team_member_label: team_member_label || null,
        is_completed: true,
        current_step: 4
      }])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json(onboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE onboarding
router.put('/:id', async (req, res) => {
  try {
    const {
      business_name, website_url, currency, industries, business_needs,
      timezone, available_days, available_time_start, available_time_end,
      event_type_label, team_member_label
    } = req.body;
    
    const { data: onboarding, error } = await supabase
      .from('businesses')
      .update({
        business_name,
        website_url,
        currency,
        industries: industries || [],
        business_needs: business_needs || [],
        timezone,
        available_days: available_days || [],
        available_time_start,
        available_time_end,
        event_type_label,
        team_member_label,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Onboarding not found' });
      }
      throw error;
    }
    
    res.json(onboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
