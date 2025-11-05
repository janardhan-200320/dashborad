import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'b8035af1-4c81-40d9-a4ac-143350c3d41f';

// GET dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const { organization_id = DEFAULT_ORG_ID } = req.query;

    // Bookings stats
    const { count: totalBookings } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id);

    const { count: upcomingBookings } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('status', 'upcoming');

    const { count: completedBookings } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('status', 'completed');

    const { count: cancelledBookings } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('status', 'cancelled');
    
    const today = new Date().toISOString().split('T')[0];
    const { count: todayBookings } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .gte('start_time', `${today}T00:00:00Z`)
      .lt('start_time', `${today}T23:59:59Z`);

    // Customers stats
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id);
    
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const firstDayStr = firstDayOfMonth.toISOString();
    const { count: newCustomersThisMonth } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .gte('created_at', firstDayStr);

    // Services stats
    const { count: totalServices } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id);

    const { count: activeServices } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('is_enabled', true);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString();
    
    const { count: recentBookings } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .gte('created_at', thirtyDaysStr);
    
    const { count: recentCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .gte('created_at', thirtyDaysStr);

    res.json({
      bookings: {
        total: totalBookings || 0,
        upcoming: upcomingBookings || 0,
        completed: completedBookings || 0,
        cancelled: cancelledBookings || 0,
        today: todayBookings || 0
      },
      customers: {
        total: totalCustomers || 0,
        new_this_month: newCustomersThisMonth || 0
      },
      services: {
        total: totalServices || 0,
        active: activeServices || 0
      },
      recent_activity: {
        bookings_last_30_days: recentBookings || 0,
        customers_last_30_days: recentCustomers || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
