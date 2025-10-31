import { db } from '../database/init.js';

console.log('🌱 Seeding admin center data...');

try {
  // Seed organization settings (if not exists)
  const existingOrg = db.prepare('SELECT id FROM organization_settings WHERE id = 1').get();
  if (!existingOrg) {
    db.prepare(`
      INSERT INTO organization_settings (
        company_name, industry, email, phone,
        brand_color, timezone, working_days,
        working_hours_start, working_hours_end,
        booking_url, meta_title, meta_description,
        allow_guest_booking, require_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Zervos Booking',
      'Professional Services',
      'contact@zervos.com',
      '+1 (555) 123-4567',
      '#6366f1',
      'Asia/Kolkata',
      JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      '09:00',
      '18:00',
      'zervos-booking',
      'Book an Appointment | Zervos',
      'Schedule meetings and appointments with our professional team',
      1,
      0
    );
    console.log('✅ Organization settings seeded');
  }

  // Seed workspaces
  const workspaces = [
    { name: 'Main Workspace', description: 'Primary workspace for all team members', members_count: 5, is_active: 1 },
    { name: 'Sales Team', description: 'Dedicated workspace for sales activities', members_count: 3, is_active: 1 },
    { name: 'Support Team', description: 'Customer support and service workspace', members_count: 2, is_active: 1 },
  ];

  workspaces.forEach(workspace => {
    const existing = db.prepare('SELECT id FROM workspaces WHERE name = ?').get(workspace.name);
    if (!existing) {
      db.prepare(`
        INSERT INTO workspaces (name, description, members_count, is_active)
        VALUES (?, ?, ?, ?)
      `).run(workspace.name, workspace.description, workspace.members_count, workspace.is_active);
    }
  });
  console.log('✅ Workspaces seeded');

  // Seed locations
  const locations = [
    { 
      name: 'Main Office', 
      address: '123 Business Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postal_code: '400001',
      directions: 'Near Central Station, take exit 3',
      is_active: 1 
    },
    { 
      name: 'Branch Office - Delhi',
      address: '456 Corporate Avenue',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postal_code: '110001',
      directions: 'Connaught Place area, Metro accessible',
      is_active: 1
    },
    {
      name: 'Virtual Office',
      address: 'Online',
      city: null,
      state: null,
      country: 'Global',
      postal_code: null,
      directions: 'Virtual meetings via Zoom/Google Meet',
      is_active: 1
    }
  ];

  locations.forEach(location => {
    const existing = db.prepare('SELECT id FROM locations WHERE name = ?').get(location.name);
    if (!existing) {
      db.prepare(`
        INSERT INTO locations (name, address, city, state, country, postal_code, directions, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        location.name, location.address, location.city, location.state,
        location.country, location.postal_code, location.directions, location.is_active
      );
    }
  });
  console.log('✅ Locations seeded');

  // Seed resources
  const resources = [
    { name: 'Conference Room A', type: 'room', description: 'Large meeting room with projector (10 people capacity)', is_available: 1 },
    { name: 'Conference Room B', type: 'room', description: 'Medium meeting room (6 people capacity)', is_available: 1 },
    { name: 'Huddle Room', type: 'room', description: 'Small meeting space (4 people capacity)', is_available: 1 },
    { name: 'Projector', type: 'equipment', description: 'Portable projector with HDMI connection', is_available: 1 },
    { name: 'Whiteboard', type: 'equipment', description: 'Mobile whiteboard with markers', is_available: 1 },
    { name: 'Video Conference Kit', type: 'equipment', description: 'Camera, microphone, and speaker set', is_available: 1 },
  ];

  resources.forEach(resource => {
    const existing = db.prepare('SELECT id FROM resources WHERE name = ? AND type = ?').get(resource.name, resource.type);
    if (!existing) {
      db.prepare(`
        INSERT INTO resources (name, type, description, is_available)
        VALUES (?, ?, ?, ?)
      `).run(resource.name, resource.type, resource.description, resource.is_available);
    }
  });
  console.log('✅ Resources seeded');

  // Seed integrations
  const integrations = [
    { name: 'Google Calendar', type: 'calendar', is_connected: 0 },
    { name: 'Outlook Calendar', type: 'calendar', is_connected: 0 },
    { name: 'Apple Calendar', type: 'calendar', is_connected: 0 },
    { name: 'Zoom', type: 'video', is_connected: 0 },
    { name: 'Google Meet', type: 'video', is_connected: 0 },
    { name: 'Microsoft Teams', type: 'video', is_connected: 0 },
    { name: 'Salesforce', type: 'crm', is_connected: 0 },
    { name: 'HubSpot', type: 'crm', is_connected: 0 },
    { name: 'Zoho CRM', type: 'crm', is_connected: 0 },
    { name: 'Stripe', type: 'payment', is_connected: 0 },
    { name: 'Razorpay', type: 'payment', is_connected: 0 },
    { name: 'PayPal', type: 'payment', is_connected: 0 },
    { name: 'Zapier', type: 'automation', is_connected: 0 },
    { name: 'Webhooks', type: 'automation', is_connected: 0 },
    { name: 'Make (Integromat)', type: 'automation', is_connected: 0 },
  ];

  integrations.forEach(integration => {
    const existing = db.prepare('SELECT id FROM integrations WHERE name = ?').get(integration.name);
    if (!existing) {
      db.prepare(`
        INSERT INTO integrations (name, type, is_connected)
        VALUES (?, ?, ?)
      `).run(integration.name, integration.type, integration.is_connected);
    }
  });
  console.log('✅ Integrations seeded');

  // Seed custom labels
  const customLabels = [
    { label_type: 'event_type', label_value: 'Sales Call', description: 'Initial sales consultation' },
    { label_type: 'event_type', label_value: 'Demo', description: 'Product demonstration' },
    { label_type: 'event_type', label_value: 'Support Session', description: 'Customer support meeting' },
    { label_type: 'event_type', label_value: 'Onboarding', description: 'New customer onboarding' },
    { label_type: 'team_member', label_value: 'Salesperson', description: 'Sales team member' },
    { label_type: 'team_member', label_value: 'Support Agent', description: 'Support team member' },
    { label_type: 'team_member', label_value: 'Account Manager', description: 'Account management' },
    { label_type: 'customer', label_value: 'Client', description: 'Active client' },
    { label_type: 'customer', label_value: 'Lead', description: 'Potential customer' },
    { label_type: 'customer', label_value: 'VIP', description: 'VIP customer' },
    { label_type: 'status', label_value: 'Scheduled', description: 'Appointment is scheduled' },
    { label_type: 'status', label_value: 'Completed', description: 'Appointment completed successfully' },
    { label_type: 'status', label_value: 'Cancelled', description: 'Appointment was cancelled' },
    { label_type: 'status', label_value: 'No-show', description: 'Customer did not attend' },
    { label_type: 'status', label_value: 'Rescheduled', description: 'Appointment rescheduled' },
  ];

  customLabels.forEach(label => {
    const existing = db.prepare('SELECT id FROM custom_labels WHERE label_type = ? AND label_value = ?')
      .get(label.label_type, label.label_value);
    if (!existing) {
      db.prepare(`
        INSERT INTO custom_labels (label_type, label_value, description)
        VALUES (?, ?, ?)
      `).run(label.label_type, label.label_value, label.description);
    }
  });
  console.log('✅ Custom labels seeded');

  // Seed roles
  const roles = [
    { 
      name: 'Super Admin',
      description: 'Full access to all features and settings',
      permissions: JSON.stringify(['all'])
    },
    {
      name: 'Admin',
      description: 'Manage bookings, team, customers, and settings',
      permissions: JSON.stringify(['manage_bookings', 'manage_team', 'manage_customers', 'view_analytics', 'manage_settings'])
    },
    {
      name: 'Manager',
      description: 'Manage bookings and view analytics',
      permissions: JSON.stringify(['manage_bookings', 'manage_customers', 'view_analytics'])
    },
    {
      name: 'Staff',
      description: 'View and manage own bookings',
      permissions: JSON.stringify(['view_bookings', 'manage_own_bookings'])
    },
    {
      name: 'Viewer',
      description: 'Read-only access to bookings and analytics',
      permissions: JSON.stringify(['view_only'])
    },
  ];

  roles.forEach(role => {
    const existing = db.prepare('SELECT id FROM roles WHERE name = ?').get(role.name);
    if (!existing) {
      db.prepare(`
        INSERT INTO roles (name, description, permissions)
        VALUES (?, ?, ?)
      `).run(role.name, role.description, role.permissions);
    }
  });
  console.log('✅ Roles seeded');

  console.log('\n🎉 Admin center data seeding completed successfully!\n');
} catch (error) {
  console.error('❌ Error seeding admin center data:', error);
  process.exit(1);
}
