import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// GET dashboard analytics
router.get('/dashboard', (req, res) => {
  try {
    // Bookings stats
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
    const upcomingBookings = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'upcoming'").get();
    const completedBookings = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'").get();
    const cancelledBookings = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'").get();
    
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(today);

    // Customers stats
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
    const newCustomersThisMonth = db.prepare(
      'SELECT COUNT(*) as count FROM customers WHERE created_at >= ?'
    ).get(firstDayStr);

    // Services stats
    const totalServices = db.prepare('SELECT COUNT(*) as count FROM services').get();
    const activeServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE is_enabled = 1').get();

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    const recentBookings = db.prepare(
      'SELECT COUNT(*) as count FROM appointments WHERE created_at >= ?'
    ).get(thirtyDaysStr);
    
    const recentCustomers = db.prepare(
      'SELECT COUNT(*) as count FROM customers WHERE created_at >= ?'
    ).get(thirtyDaysStr);

    res.json({
      bookings: {
        total: totalBookings.count,
        upcoming: upcomingBookings.count,
        completed: completedBookings.count,
        cancelled: cancelledBookings.count,
        today: todayBookings.count
      },
      customers: {
        total: totalCustomers.count,
        new_this_month: newCustomersThisMonth.count
      },
      services: {
        total: totalServices.count,
        active: activeServices.count
      },
      recent_activity: {
        bookings_last_30_days: recentBookings.count,
        customers_last_30_days: recentCustomers.count
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
