-- =====================================================
-- SUPABASE SCHEMA CHECK & MIGRATION SCRIPT
-- =====================================================
-- Run this first to check which tables already exist
-- Then run only the CREATE statements you need
-- =====================================================

-- Check existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check existing types
SELECT typname 
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'
ORDER BY typname;

-- =====================================================
-- MIGRATION QUERIES (Run only what you need)
-- =====================================================

-- If tables already exist, use ALTER TABLE instead of CREATE TABLE
-- Example: Add missing columns to existing customers table

-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMPTZ;
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS address JSONB;
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT[];
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0;

-- Example: Add missing columns to existing services table
-- ALTER TABLE services ADD COLUMN IF NOT EXISTS max_advance_booking_days INTEGER DEFAULT 30;
-- ALTER TABLE services ADD COLUMN IF NOT EXISTS min_advance_booking_days INTEGER DEFAULT 1;

-- Example: Add missing columns to existing appointments table
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- =====================================================
-- CREATE MISSING TABLES ONLY
-- =====================================================

-- Workspaces (if doesn't exist)
CREATE TABLE IF NOT EXISTS workspaces (
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

-- Resources (if doesn't exist)
CREATE TABLE IF NOT EXISTS resources (
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

-- Locations (if doesn't exist)
CREATE TABLE IF NOT EXISTS locations (
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

-- Integrations (if doesn't exist)
CREATE TABLE IF NOT EXISTS integrations (
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

-- Custom Labels (if doesn't exist)
CREATE TABLE IF NOT EXISTS custom_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  label_type TEXT NOT NULL,
  label_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles (if doesn't exist)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Settings (if doesn't exist)
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADD INDEXES FOR NEW TABLES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_workspaces_organization ON workspaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_resources_organization ON resources(organization_id);
CREATE INDEX IF NOT EXISTS idx_locations_organization ON locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_organization ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_labels_organization ON custom_labels(organization_id);
CREATE INDEX IF NOT EXISTS idx_roles_organization ON roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_organization ON notification_settings(organization_id);

-- =====================================================
-- ADD UPDATED_AT TRIGGERS FOR NEW TABLES
-- =====================================================

CREATE TRIGGER IF NOT EXISTS update_workspaces_updated_at 
  BEFORE UPDATE ON workspaces 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_resources_updated_at 
  BEFORE UPDATE ON resources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_locations_updated_at 
  BEFORE UPDATE ON locations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_integrations_updated_at 
  BEFORE UPDATE ON integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_custom_labels_updated_at 
  BEFORE UPDATE ON custom_labels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_roles_updated_at 
  BEFORE UPDATE ON roles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_notification_settings_updated_at 
  BEFORE UPDATE ON notification_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA FOR NEW TABLES
-- =====================================================

-- Insert default custom labels (if organization exists)
INSERT INTO custom_labels (organization_id, label_type, label_value, description)
SELECT 
  id,
  'event_type',
  'Appointment',
  'Default label for appointment type'
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM custom_labels 
  WHERE organization_id = organizations.id 
  AND label_type = 'event_type'
)
LIMIT 1;

-- Insert default roles (if organization exists)
INSERT INTO roles (organization_id, name, description, permissions)
SELECT 
  id,
  'Admin',
  'Full system access',
  '{"all": true}'::jsonb
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM roles 
  WHERE organization_id = organizations.id 
  AND name = 'Admin'
)
LIMIT 1;

-- Insert default notification settings
INSERT INTO notification_settings (organization_id, entity_type, event_type, is_enabled)
SELECT 
  o.id,
  unnest(ARRAY['appointment', 'customer', 'service']),
  unnest(ARRAY['created', 'updated', 'cancelled']),
  true
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM notification_settings 
  WHERE organization_id = o.id
)
LIMIT 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count records in each table
SELECT 'organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'salespersons', COUNT(*) FROM salespersons
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'businesses', COUNT(*) FROM businesses
UNION ALL
SELECT 'events', COUNT(*) FROM Events
UNION ALL
SELECT 'workspaces', COUNT(*) FROM workspaces
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'locations', COUNT(*) FROM locations
UNION ALL
SELECT 'integrations', COUNT(*) FROM integrations
UNION ALL
SELECT 'custom_labels', COUNT(*) FROM custom_labels
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'notification_settings', COUNT(*) FROM notification_settings;

-- Check all foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- CLEANUP (Use with caution!)
-- =====================================================

-- Drop all tables (DANGEROUS - only for fresh start)
-- DO NOT RUN THIS unless you want to delete all data!

/*
DROP TABLE IF EXISTS workflow_logs CASCADE;
DROP TABLE IF EXISTS workflow_actions CASCADE;
DROP TABLE IF EXISTS workflow_conditions CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS custom_labels CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS Events CASCADE;
DROP TABLE IF EXISTS business_custom_labels CASCADE;
DROP TABLE IF EXISTS business_availability CASCADE;
DROP TABLE IF EXISTS business_industry_details CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS salespersons CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

DROP TYPE IF EXISTS schedule_type;
DROP TYPE IF EXISTS event_type;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS appointment_status;
*/
