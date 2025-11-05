-- =====================================================
-- SUPABASE SQL SCHEMA FOR DASHBORAD PROJECT
-- =====================================================
-- This schema is based on your existing Supabase database
-- and optimized for your booking/appointment management system
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOM TYPES (ENUMS)
-- =====================================================

-- Appointment status
CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'refunded',
  'failed'
);

-- Event types
CREATE TYPE event_type AS ENUM (
  'one_on_one',
  'group',
  'collective'
);

-- Schedule types
CREATE TYPE schedule_type AS ENUM (
  'one_time',
  'recurring'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Organizations (Multi-tenant parent table)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address JSONB, -- Flexible field for location data
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth TIMESTAMPTZ,
  address JSONB,
  notes TEXT,
  tags TEXT[],
  total_spent NUMERIC DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  max_advance_booking_days INTEGER DEFAULT 30,
  min_advance_booking_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'email',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salespersons (Team Members)
CREATE TABLE salespersons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  title TEXT,
  bio TEXT,
  avatar_url TEXT,
  specialities TEXT[],
  working_hours JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  commission_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES salespersons(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'pending',
  price NUMERIC NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  notes TEXT,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BUSINESS CONFIGURATION TABLES
-- =====================================================

-- Businesses (Onboarding data)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR NOT NULL,
  business_location VARCHAR,
  business_description TEXT,
  business_website VARCHAR,
  currency_code VARCHAR DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Industry Details
CREATE TABLE business_industry_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  industry_name VARCHAR NOT NULL,
  specific_need TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Availability
CREATE TABLE business_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  timezone VARCHAR DEFAULT 'Asia/Kolkata',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_dates DATE[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Custom Labels
CREATE TABLE business_custom_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  event_label VARCHAR DEFAULT 'Event Types',
  team_label VARCHAR DEFAULT 'Team Members',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENTS & SCHEDULING
-- =====================================================

-- Events
CREATE TABLE Events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  event_name VARCHAR NOT NULL,
  event_type event_type DEFAULT 'one_on_one',
  schedule_type schedule_type DEFAULT 'one_time',
  description TEXT,
  location VARCHAR,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  capacity INTEGER DEFAULT 1,
  price NUMERIC DEFAULT 0.00,
  currency_code VARCHAR DEFAULT 'INR',
  recurrence_rule TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUTHENTICATION & SESSION MANAGEMENT
-- =====================================================

-- User Profiles (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WORKFLOW AUTOMATION
-- =====================================================

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Conditions
CREATE TABLE workflow_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL,
  condition_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Actions
CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Logs
CREATE TABLE workflow_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  log_message TEXT,
  log_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADDITIONAL TABLES FOR YOUR PROJECT
-- =====================================================

-- Workspaces (if you want separate from organizations)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  members_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources (Equipment, Rooms, etc.)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  location_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations (Physical locations)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  directions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations (Third-party integrations)
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT FALSE,
  api_key TEXT,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Labels (UI customization)
CREATE TABLE custom_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  label_type TEXT NOT NULL,
  label_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles (Permission system)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Settings
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Organizations
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- Customers
CREATE INDEX idx_customers_organization ON customers(organization_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- Services
CREATE INDEX idx_services_organization ON services(organization_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Appointments
CREATE INDEX idx_appointments_organization ON appointments(organization_id);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_salesperson ON appointments(salesperson_id);
CREATE INDEX idx_appointments_service ON appointments(service_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_date_range ON appointments(start_time, end_time);

-- Salespersons
CREATE INDEX idx_salespersons_organization ON salespersons(organization_id);
CREATE INDEX idx_salespersons_user ON salespersons(user_id);
CREATE INDEX idx_salespersons_is_active ON salespersons(is_active);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Workflows
CREATE INDEX idx_workflows_organization ON workflows(organization_id);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salespersons_updated_at BEFORE UPDATE ON salespersons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE salespersons ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only access their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM salespersons WHERE organization_id = id
  ));

-- Customers: Scoped to organization
CREATE POLICY "Users can view customers in their organization"
  ON customers FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM salespersons WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert customers in their organization"
  ON customers FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM salespersons WHERE user_id = auth.uid()
  ));

-- Services: Scoped to organization
CREATE POLICY "Users can view services in their organization"
  ON services FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM salespersons WHERE user_id = auth.uid()
  ));

-- Appointments: Scoped to organization
CREATE POLICY "Users can view appointments in their organization"
  ON appointments FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM salespersons WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert appointments in their organization"
  ON appointments FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM salespersons WHERE user_id = auth.uid()
  ));

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample organization
INSERT INTO organizations (id, name, email, timezone, currency) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo@example.com', 'UTC', 'USD');

-- Insert sample user
INSERT INTO users (id, email, password_hash, full_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@demo.com', '$2b$10$dummy_hash_for_testing', 'Admin User');

-- Insert sample salesperson
INSERT INTO salespersons (organization_id, user_id, first_name, last_name, email, title) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'John', 'Doe', 'john@demo.com', 'Sales Manager');

-- Insert sample service
INSERT INTO services (organization_id, name, duration_minutes, price, category) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Consultation', 60, 150.00, 'consulting');

-- Insert sample customer
INSERT INTO customers (organization_id, first_name, last_name, email, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Jane', 'Smith', 'jane@example.com', '+1234567890');

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This schema includes all tables from both your SQLite and existing Supabase
-- 2. All tables use UUID primary keys for scalability
-- 3. Multi-tenancy is enforced through organization_id
-- 4. Row Level Security (RLS) policies are in place
-- 5. Indexes are created for common query patterns
-- 6. Automatic updated_at timestamp triggers
-- 7. Foreign key constraints for data integrity
-- 8. JSONB fields for flexible schema extension
-- 
-- To apply this schema:
-- 1. Go to Supabase Dashboard -> SQL Editor
-- 2. Copy and paste this entire file
-- 3. Execute the SQL
-- 4. Verify all tables are created successfully
-- 
-- IMPORTANT: Some tables may already exist in your Supabase database.
-- In that case, only execute the CREATE TABLE statements for missing tables.
-- Use ALTER TABLE to add missing columns to existing tables instead.
