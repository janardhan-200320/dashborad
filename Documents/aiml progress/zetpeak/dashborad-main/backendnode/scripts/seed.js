import db, { initDatabase } from '../database/init.js';

console.log('🌱 Seeding database with sample data...\n');

// Initialize database first
initDatabase();

// Clear existing data
console.log('🗑️  Clearing existing data...');
db.exec('DELETE FROM appointments');
db.exec('DELETE FROM customers');
db.exec('DELETE FROM services');
db.exec('DELETE FROM team_members');
db.exec('DELETE FROM business_onboarding');

// Seed customers
console.log('👥 Creating customers...');
const customers = [
  { name: 'John Doe', email: 'john.doe@example.com', phone: '+1-555-0101', notes: 'VIP customer - prefers video calls' },
  { name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1-555-0102', notes: 'Prefers morning appointments' },
  { name: 'Bob Wilson', email: 'bob.wilson@example.com', phone: '+1-555-0103', notes: 'Enterprise account' },
  { name: 'Alice Brown', email: 'alice.brown@example.com', phone: '+1-555-0104', notes: 'Corporate client - budget approved' },
  { name: 'Charlie Davis', email: 'charlie.davis@example.com', phone: '+1-555-0105', notes: 'Referred by Jane Smith' },
  { name: 'David Miller', email: 'david.miller@example.com', phone: '+1-555-0106', notes: 'Tech startup founder' },
  { name: 'Emma Thompson', email: 'emma.thompson@example.com', phone: '+1-555-0107', notes: 'Returning customer' },
  { name: 'Frank Garcia', email: 'frank.garcia@example.com', phone: '+1-555-0108', notes: 'Needs custom package' },
  { name: 'Grace Lee', email: 'grace.lee@example.com', phone: '+1-555-0109', notes: 'High priority lead' },
  { name: 'Henry Taylor', email: 'henry.taylor@example.com', phone: '+1-555-0110', notes: 'Monthly retainer client' }
];

const customerInsert = db.prepare(`
  INSERT INTO customers (name, email, phone, notes) VALUES (?, ?, ?, ?)
`);

customers.forEach(c => customerInsert.run(c.name, c.email, c.phone, c.notes));
console.log(`✅ Created ${customers.length} customers`);

// Seed services
console.log('🛎️  Creating services...');
const services = [
  { name: 'Technical Interview', description: 'In-depth technical assessment for software engineering roles', duration: '60 mins', price: '$150', category: 'interview', is_enabled: 1 },
  { name: 'HR Screening', description: 'Initial screening call with HR team', duration: '30 mins', price: '$75', category: 'interview', is_enabled: 1 },
  { name: 'Final Round', description: 'Final interview with leadership team', duration: '90 mins', price: '$200', category: 'interview', is_enabled: 1 },
  { name: 'Team Meeting', description: 'Meet with potential team members', duration: '45 mins', price: '$100', category: 'consultation', is_enabled: 1 },
  { name: 'Strategy Consultation', description: 'Business strategy and planning session', duration: '120 mins', price: '$300', category: 'consultation', is_enabled: 1 },
  { name: 'Product Demo', description: 'Live product demonstration and Q&A session', duration: '45 mins', price: '$125', category: 'sales', is_enabled: 1 },
  { name: 'Discovery Call', description: 'Initial consultation to understand client needs', duration: '30 mins', price: '$50', category: 'sales', is_enabled: 1 },
  { name: 'Technical Workshop', description: 'Hands-on technical training session', duration: '180 mins', price: '$500', category: 'training', is_enabled: 1 },
  { name: 'Follow-up Meeting', description: 'Post-service follow-up and feedback session', duration: '30 mins', price: '$75', category: 'support', is_enabled: 1 },
  { name: 'Executive Briefing', description: 'High-level strategic discussion with executives', duration: '60 mins', price: '$350', category: 'consultation', is_enabled: 1 }
];

const serviceInsert = db.prepare(`
  INSERT INTO services (name, description, duration, price, category, is_enabled) 
  VALUES (?, ?, ?, ?, ?, ?)
`);

services.forEach(s => serviceInsert.run(s.name, s.description, s.duration, s.price, s.category, s.is_enabled));
console.log(`✅ Created ${services.length} services`);

// Seed team members
console.log('👨‍💼 Creating team members...');
const teamMembers = [
  { name: 'Sarah Johnson', email: 'sarah.johnson@zetpeak.com', role: 'super_admin', color: 'bg-gradient-to-r from-purple-500 to-pink-500', is_active: 1 },
  { name: 'Mike Williams', email: 'mike.williams@zetpeak.com', role: 'admin', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', is_active: 1 },
  { name: 'David Lee', email: 'david.lee@zetpeak.com', role: 'salesperson', color: 'bg-gradient-to-r from-green-500 to-teal-500', is_active: 1 },
  { name: 'Emma Wilson', email: 'emma.wilson@zetpeak.com', role: 'salesperson', color: 'bg-gradient-to-r from-orange-500 to-red-500', is_active: 1 },
  { name: 'Rachel Martinez', email: 'rachel.martinez@zetpeak.com', role: 'salesperson', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', is_active: 1 },
  { name: 'James Chen', email: 'james.chen@zetpeak.com', role: 'salesperson', color: 'bg-gradient-to-r from-indigo-500 to-purple-500', is_active: 1 },
  { name: 'Tom Anderson', email: 'tom.anderson@zetpeak.com', role: 'viewer', color: 'bg-gradient-to-r from-gray-500 to-slate-500', is_active: 0 },
  { name: 'Lisa Park', email: 'lisa.park@zetpeak.com', role: 'admin', color: 'bg-gradient-to-r from-pink-500 to-rose-500', is_active: 1 }
];

const teamInsert = db.prepare(`
  INSERT INTO team_members (name, email, role, color, is_active) 
  VALUES (?, ?, ?, ?, ?)
`);

teamMembers.forEach(t => teamInsert.run(t.name, t.email, t.role, t.color, t.is_active));
console.log(`✅ Created ${teamMembers.length} team members`);

// Seed appointments
console.log('📅 Creating appointments...');
const appointments = [
  // Upcoming appointments
  { customer_id: 1, service_id: 1, staff: 'Sarah Johnson', date: '2025-11-01', time: '10:00 AM', status: 'upcoming', notes: 'Technical interview - React & Node.js', meeting_platform: 'Google Meet', meeting_link: 'https://meet.google.com/abc-defg-hij' },
  { customer_id: 2, service_id: 2, staff: 'Mike Williams', date: '2025-11-02', time: '02:00 PM', status: 'upcoming', notes: 'Initial screening call', meeting_platform: 'Zoom', meeting_link: 'https://zoom.us/j/123456789' },
  { customer_id: 3, service_id: 3, staff: 'David Lee', date: '2025-11-03', time: '11:00 AM', status: 'upcoming', notes: 'Final round with leadership', meeting_platform: 'Microsoft Teams', meeting_link: 'https://teams.microsoft.com/l/meetup/...' },
  { customer_id: 6, service_id: 6, staff: 'Emma Wilson', date: '2025-11-04', time: '09:00 AM', status: 'upcoming', notes: 'Product demo for enterprise features', meeting_platform: 'Google Meet', meeting_link: 'https://meet.google.com/xyz-abcd-efg' },
  { customer_id: 7, service_id: 7, staff: 'Rachel Martinez', date: '2025-11-05', time: '03:00 PM', status: 'upcoming', notes: 'Discovery call - understanding requirements', meeting_platform: 'Zoom', meeting_link: 'https://zoom.us/j/987654321' },
  { customer_id: 1, service_id: 5, staff: 'David Lee', date: '2025-11-06', time: '01:00 PM', status: 'upcoming', notes: 'Strategy consultation for Q4', meeting_platform: 'Zoom', meeting_link: 'https://zoom.us/j/555666777' },
  { customer_id: 8, service_id: 8, staff: 'James Chen', date: '2025-11-07', time: '10:00 AM', status: 'upcoming', notes: 'Technical workshop - API integration', meeting_platform: 'Microsoft Teams', meeting_link: 'https://teams.microsoft.com/l/...' },
  { customer_id: 9, service_id: 10, staff: 'Sarah Johnson', date: '2025-11-08', time: '02:00 PM', status: 'upcoming', notes: 'Executive briefing on roadmap', meeting_platform: 'Google Meet', meeting_link: 'https://meet.google.com/exec-brief' },
  
  // Completed appointments
  { customer_id: 4, service_id: 1, staff: 'Emma Wilson', date: '2025-10-25', time: '03:00 PM', status: 'completed', notes: 'Completed successfully - hired', meeting_platform: 'Google Meet', meeting_link: null },
  { customer_id: 5, service_id: 6, staff: 'David Lee', date: '2025-10-26', time: '11:00 AM', status: 'completed', notes: 'Product demo went well', meeting_platform: 'Zoom', meeting_link: null },
  { customer_id: 2, service_id: 7, staff: 'Rachel Martinez', date: '2025-10-27', time: '09:00 AM', status: 'completed', notes: 'Discovery call - moving to proposal stage', meeting_platform: 'Google Meet', meeting_link: null },
  { customer_id: 10, service_id: 2, staff: 'Mike Williams', date: '2025-10-28', time: '04:00 PM', status: 'completed', notes: 'HR screening passed', meeting_platform: 'Zoom', meeting_link: null },
  { customer_id: 3, service_id: 9, staff: 'Lisa Park', date: '2025-10-29', time: '01:00 PM', status: 'completed', notes: 'Follow-up completed, client satisfied', meeting_platform: 'Microsoft Teams', meeting_link: null },
  { customer_id: 6, service_id: 5, staff: 'Sarah Johnson', date: '2025-10-30', time: '10:00 AM', status: 'completed', notes: 'Strategy session - action items defined', meeting_platform: 'Google Meet', meeting_link: null },
  
  // Cancelled appointments
  { customer_id: 5, service_id: 2, staff: 'Sarah Johnson', date: '2025-10-20', time: '09:00 AM', status: 'cancelled', notes: 'Client rescheduled', meeting_platform: null, meeting_link: null },
  { customer_id: 7, service_id: 1, staff: 'James Chen', date: '2025-10-22', time: '02:00 PM', status: 'cancelled', notes: 'Position filled', meeting_platform: null, meeting_link: null },
  
  // Today's appointments (October 31, 2025)
  { customer_id: 4, service_id: 4, staff: 'Mike Williams', date: '2025-10-31', time: '10:00 AM', status: 'upcoming', notes: 'Team meeting with project stakeholders', meeting_platform: 'Microsoft Teams', meeting_link: 'https://teams.microsoft.com/today' },
  { customer_id: 8, service_id: 7, staff: 'Emma Wilson', date: '2025-10-31', time: '02:00 PM', status: 'upcoming', notes: 'Discovery call for new project', meeting_platform: 'Zoom', meeting_link: 'https://zoom.us/j/today123' },
  { customer_id: 9, service_id: 9, staff: 'Rachel Martinez', date: '2025-10-31', time: '04:00 PM', status: 'upcoming', notes: 'Follow-up on last week\'s meeting', meeting_platform: 'Google Meet', meeting_link: 'https://meet.google.com/today-fup' }
];

const appointmentInsert = db.prepare(`
  INSERT INTO appointments (customer_id, service_id, staff, date, time, status, notes, meeting_platform, meeting_link) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

appointments.forEach(a => appointmentInsert.run(
  a.customer_id, a.service_id, a.staff, a.date, a.time, a.status, a.notes, a.meeting_platform, a.meeting_link || null
));

// Update customer total_bookings
db.prepare(`
  UPDATE customers 
  SET total_bookings = (SELECT COUNT(*) FROM appointments WHERE customer_id = customers.id)
`).run();

console.log(`✅ Created ${appointments.length} appointments`);

console.log('\n✨ Database seeded successfully!');
console.log('\nSummary:');
console.log(`  - ${customers.length} customers`);
console.log(`  - ${services.length} services (${services.filter(s => s.is_enabled).length} enabled)`);
console.log(`  - ${teamMembers.length} team members (${teamMembers.filter(t => t.is_active).length} active)`);
console.log(`  - ${appointments.length} appointments`);

// Count appointment statuses
const upcomingCount = appointments.filter(a => a.status === 'upcoming').length;
const completedCount = appointments.filter(a => a.status === 'completed').length;
const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
console.log(`    • ${upcomingCount} upcoming`);
console.log(`    • ${completedCount} completed`);
console.log(`    • ${cancelledCount} cancelled\n`);

db.close();
