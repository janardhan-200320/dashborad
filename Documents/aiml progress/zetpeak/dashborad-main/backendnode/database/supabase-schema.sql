-- ============================================
-- Zervos Booking System - Supabase Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  notes TEXT,
  total_bookings INTEGER DEFAULT 0,
  last_appointment TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT NOT NULL,
  price TEXT,
  category TEXT DEFAULT 'other',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_id BIGINT REFERENCES services(id) ON DELETE SET NULL,
  staff TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  notes TEXT,
  meeting_platform TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'salesperson',
  avatar TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BUSINESS ONBOARDING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_onboarding (
  id BIGSERIAL PRIMARY KEY,
  business_name TEXT NOT NULL,
  website_url TEXT,
  currency TEXT DEFAULT 'INR',
  industries TEXT,
  business_needs TEXT,
  timezone TEXT,
  available_days TEXT,
  available_time_start TEXT,
  available_time_end TEXT,
  event_type_label TEXT,
  team_member_label TEXT,
  is_completed BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ORGANIZATION SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organization_settings (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT,
  email TEXT,
  phone TEXT,
  logo TEXT,
  brand_color TEXT DEFAULT '#6366f1',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  working_days TEXT,
  working_hours_start TEXT DEFAULT '09:00',
  working_hours_end TEXT DEFAULT '18:00',
  booking_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  allow_guest_booking BOOLEAN DEFAULT true,
  require_login BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WORKSPACES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workspaces (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  members_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RESOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  directions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INTEGRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integrations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  api_key TEXT,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOM LABELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_labels (
  id BIGSERIAL PRIMARY KEY,
  label_type TEXT NOT NULL,
  label_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATION SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, event_type)
);

-- ============================================
-- USERS TABLE (Authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  session_token TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_notification_settings_entity ON notification_settings(entity_type, event_type);

-- ============================================
-- SEED DEFAULT DATA
-- ============================================

-- Seed default custom labels
INSERT INTO custom_labels (label_type, label_value, description)
VALUES 
  ('workspaces', 'Workspace', 'Label for workspace entities'),
  ('eventType', 'Event Type', 'Label for event/appointment types'),
  ('user', 'User', 'Label for user/team member entities'),
  ('resource', 'Resource', 'Label for resource entities')
ON CONFLICT DO NOTHING;

-- Seed default roles
INSERT INTO roles (name, description, permissions)
VALUES 
  ('Admin', 'Full access to all features', '["view", "edit", "add", "delete", "export"]'::jsonb),
  ('Manager', 'Can manage appointments and customers', '["view", "edit", "add", "export"]'::jsonb),
  ('Staff', 'Basic staff access', '["view", "edit"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Seed default notification settings
INSERT INTO notification_settings (entity_type, event_type, is_enabled)
VALUES 
  -- Appointments
  ('appointment', 'scheduled', true),
  ('appointment', 'canceled', true),
  ('appointment', 'rescheduled', true),
  -- Recruiters
  ('recruiter', 'created', true),
  ('recruiter', 'edited', true),
  ('recruiter', 'deleted', true),
  ('recruiter', 'on leave', false),
  -- Interviews
  ('interview', 'created', true),
  ('interview', 'edited', true),
  ('interview', 'deleted', true),
  -- Customers
  ('customer', 'created', true),
  ('customer', 'edited', true),
  ('customer', 'deleted', true),
  -- Payments
  ('payment', 'success', true),
  ('payment', 'failure', true)
ON CONFLICT (entity_type, event_type) DO NOTHING;

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Allow all for anon/authenticated users)
-- Note: Adjust these policies based on your security requirements
-- ============================================

-- Customers policies
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- Services policies
CREATE POLICY "Allow all operations on services" ON services FOR ALL USING (true) WITH CHECK (true);

-- Appointments policies
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

-- Team members policies
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);

-- Workspaces policies
CREATE POLICY "Allow all operations on workspaces" ON workspaces FOR ALL USING (true) WITH CHECK (true);

-- Resources policies
CREATE POLICY "Allow all operations on resources" ON resources FOR ALL USING (true) WITH CHECK (true);

-- Locations policies
CREATE POLICY "Allow all operations on locations" ON locations FOR ALL USING (true) WITH CHECK (true);

-- Integrations policies
CREATE POLICY "Allow all operations on integrations" ON integrations FOR ALL USING (true) WITH CHECK (true);

-- Custom labels policies
CREATE POLICY "Allow all operations on custom_labels" ON custom_labels FOR ALL USING (true) WITH CHECK (true);

-- Roles policies
CREATE POLICY "Allow all operations on roles" ON roles FOR ALL USING (true) WITH CHECK (true);

-- Notification settings policies
CREATE POLICY "Allow all operations on notification_settings" ON notification_settings FOR ALL USING (true) WITH CHECK (true);

-- Users policies
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
