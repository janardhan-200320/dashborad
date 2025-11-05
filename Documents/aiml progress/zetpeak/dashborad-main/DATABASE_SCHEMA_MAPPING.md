# Database Schema Mapping: SQLite vs Supabase

## Overview
This document maps the current SQLite schema to your existing Supabase PostgreSQL schema.

---

## 1. CUSTOMERS TABLE

### SQLite Schema:
```sql
customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  notes TEXT,
  total_bookings INTEGER DEFAULT 0,
  last_appointment TEXT,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Supabase Schema:
```sql
customers (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL, -- ⚠️ REQUIRED - Multi-tenancy
  first_name TEXT NOT NULL,       -- ⚠️ SPLIT from 'name'
  last_name TEXT NOT NULL,        -- ⚠️ SPLIT from 'name'
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth TIMESTAMPTZ,      -- ➕ NEW FIELD
  address JSONB,                  -- ➕ NEW FIELD
  notes TEXT,
  tags TEXT[],                    -- ➕ NEW FIELD (array)
  total_spent NUMERIC DEFAULT 0,  -- ⚠️ RENAMED from total_bookings
  total_visits INTEGER DEFAULT 0, -- ➕ NEW FIELD
  last_visit TIMESTAMPTZ,         -- ⚠️ RENAMED from last_appointment
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Migration Notes:
- ⚠️ **BREAKING**: Split `name` into `first_name` + `last_name`
- ⚠️ **REQUIRED**: Must provide `organization_id` for multi-tenancy
- ⚠️ **UUID vs INTEGER**: IDs are UUIDs not auto-increment integers
- ➕ **New fields**: `date_of_birth`, `address`, `tags`, `total_visits`
- ⚠️ **Renamed**: `total_bookings` → `total_spent` (semantic change!)

---

## 2. SERVICES TABLE

### SQLite Schema:
```sql
services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT NOT NULL,        -- ⚠️ String like "60 mins"
  price TEXT,                    -- ⚠️ String like "$150"
  category TEXT DEFAULT 'other',
  is_enabled BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Supabase Schema:
```sql
services (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,        -- ⚠️ REQUIRED
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,    -- ⚠️ CHANGED to integer
  price NUMERIC NOT NULL,               -- ⚠️ CHANGED to numeric
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,       -- ⚠️ RENAMED from is_enabled
  max_advance_booking_days INTEGER,     -- ➕ NEW FIELD
  min_advance_booking_days INTEGER,     -- ➕ NEW FIELD
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Migration Notes:
- ⚠️ **BREAKING**: `duration` TEXT → `duration_minutes` INTEGER
- ⚠️ **BREAKING**: `price` TEXT → `price` NUMERIC (parse "$150" → 150)
- ⚠️ **RENAMED**: `is_enabled` → `is_active`
- ➕ **New fields**: `max_advance_booking_days`, `min_advance_booking_days`

---

## 3. APPOINTMENTS TABLE

### SQLite Schema:
```sql
appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  service_id INTEGER,
  staff TEXT,                    -- ⚠️ Staff name as text
  date TEXT NOT NULL,            -- ⚠️ Separate date
  time TEXT NOT NULL,            -- ⚠️ Separate time
  status TEXT DEFAULT 'upcoming',
  notes TEXT,
  meeting_platform TEXT,
  meeting_link TEXT,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Supabase Schema:
```sql
appointments (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,     -- ⚠️ REQUIRED
  customer_id UUID NOT NULL,         -- ⚠️ UUID reference
  salesperson_id UUID,               -- ⚠️ CHANGED from staff text
  service_id UUID NOT NULL,          -- ⚠️ UUID reference
  title TEXT NOT NULL,               -- ➕ NEW FIELD
  description TEXT,                  -- ⚠️ RENAMED from notes
  start_time TIMESTAMPTZ NOT NULL,   -- ⚠️ COMBINED date+time
  end_time TIMESTAMPTZ NOT NULL,     -- ➕ NEW FIELD
  status appointment_status,         -- ⚠️ ENUM type
  price NUMERIC NOT NULL,            -- ➕ NEW FIELD
  payment_status payment_status,     -- ➕ NEW FIELD (ENUM)
  notes TEXT,
  cancellation_reason TEXT,          -- ➕ NEW FIELD
  reminder_sent BOOLEAN,             -- ➕ NEW FIELD
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Migration Notes:
- ⚠️ **BREAKING**: `date` + `time` TEXT → `start_time` + `end_time` TIMESTAMPTZ
- ⚠️ **BREAKING**: `staff` TEXT → `salesperson_id` UUID (FK to salespersons)
- ⚠️ **ENUM**: `status` uses custom enum type `appointment_status`
- ➕ **New fields**: `title`, `end_time`, `price`, `payment_status`, `cancellation_reason`, `reminder_sent`
- ❌ **Removed**: `meeting_platform`, `meeting_link` (can add to description/notes)

---

## 4. TEAM MEMBERS / SALESPERSONS TABLE

### SQLite Schema:
```sql
team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'salesperson',
  avatar TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Supabase Schema:
```sql
salespersons (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,    -- ⚠️ REQUIRED
  user_id UUID,                     -- ➕ Link to auth users
  first_name TEXT NOT NULL,         -- ⚠️ SPLIT from name
  last_name TEXT NOT NULL,          -- ⚠️ SPLIT from name
  email TEXT NOT NULL UNIQUE,
  phone TEXT,                       -- ➕ NEW FIELD
  title TEXT,                       -- ⚠️ RENAMED from role
  bio TEXT,                         -- ➕ NEW FIELD
  avatar_url TEXT,                  -- ⚠️ RENAMED from avatar
  specialities TEXT[],              -- ➕ NEW FIELD (array)
  working_hours JSONB,              -- ➕ NEW FIELD
  is_active BOOLEAN DEFAULT TRUE,
  commission_rate NUMERIC,          -- ➕ NEW FIELD
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Migration Notes:
- ⚠️ **TABLE RENAME**: `team_members` → `salespersons`
- ⚠️ **BREAKING**: `name` → `first_name` + `last_name`
- ⚠️ **RENAMED**: `role` → `title`
- ❌ **Removed**: `color` field
- ➕ **New fields**: `user_id`, `phone`, `bio`, `specialities`, `working_hours`, `commission_rate`

---

## 5. BUSINESS ONBOARDING TABLE

### SQLite Schema:
```sql
business_onboarding (
  id INTEGER,
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
  is_completed BOOLEAN,
  current_step INTEGER,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Supabase Schema:
```sql
businesses (
  id UUID PRIMARY KEY,
  business_name VARCHAR NOT NULL,
  business_location VARCHAR,        -- ➕ NEW FIELD
  business_description TEXT,        -- ➕ NEW FIELD
  business_website VARCHAR,         -- ⚠️ RENAMED from website_url
  currency_code VARCHAR DEFAULT 'INR',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- AND --

business_industry_details (
  id UUID PRIMARY KEY,
  business_id UUID FK,              -- ⚠️ Separate table
  industry_name VARCHAR NOT NULL,   -- ⚠️ From industries field
  specific_need TEXT,               -- ⚠️ From business_needs field
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- AND --

business_availability (
  id UUID PRIMARY KEY,
  business_id UUID FK,
  timezone VARCHAR DEFAULT 'Asia/Kolkata',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_dates DATE[] NOT NULL,  -- ⚠️ Array of dates
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- AND --

business_custom_labels (
  id UUID PRIMARY KEY,
  business_id UUID FK,
  event_label VARCHAR DEFAULT 'Event Types',
  team_label VARCHAR DEFAULT 'Team Members',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Migration Notes:
- ⚠️ **BREAKING**: Split into FOUR separate tables:
  1. `businesses` - Core business info
  2. `business_industry_details` - Industry & needs (one-to-many)
  3. `business_availability` - Working hours & days
  4. `business_custom_labels` - Label customization
- ❌ **Removed**: `is_completed`, `current_step` (onboarding state)

---

## 6. ORGANIZATION SETTINGS TABLE

### SQLite Schema:
```sql
organization_settings (
  id INTEGER,
  company_name TEXT NOT NULL,
  industry TEXT,
  email TEXT,
  phone TEXT,
  logo TEXT,
  brand_color TEXT DEFAULT '#6366f1',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  working_days TEXT,
  working_hours_start TEXT,
  working_hours_end TEXT,
  booking_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  allow_guest_booking BOOLEAN,
  require_login BOOLEAN,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Supabase Schema:
```sql
organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,              -- ⚠️ RENAMED from company_name
  description TEXT,                -- ➕ NEW FIELD
  website_url TEXT,                -- ➕ NEW FIELD
  logo_url TEXT,                   -- ⚠️ RENAMED from logo
  phone TEXT,
  email TEXT,
  address JSONB,                   -- ➕ NEW FIELD
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',     -- ➕ NEW FIELD
  is_active BOOLEAN DEFAULT TRUE,  -- ➕ NEW FIELD
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Migration Notes:
- ⚠️ **RENAMED**: `company_name` → `name`
- ❌ **Removed**: `industry`, `brand_color`, `working_days`, `working_hours_*`, `booking_url`, `meta_title`, `meta_description`, `allow_guest_booking`, `require_login`
- 💡 **Solution**: Store removed fields in `address` JSONB field as custom metadata

---

## 7. USERS TABLE

### SQLite Schema:
```sql
users (
  id INTEGER,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  session_token TEXT,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Supabase Schema:
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  username TEXT,                   -- ➕ NEW FIELD
  full_name TEXT,                  -- ⚠️ RENAMED from name
  avatar_url TEXT,                 -- ➕ NEW FIELD
  provider TEXT DEFAULT 'email',   -- ➕ NEW FIELD
  is_active BOOLEAN DEFAULT TRUE,  -- ➕ NEW FIELD
  email_verified BOOLEAN,          -- ➕ NEW FIELD
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- AND --

sessions (
  id INTEGER,
  user_id UUID FK,
  session_token VARCHAR UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

-- AND --

profiles (
  id UUID PRIMARY KEY FK auth.users,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Migration Notes:
- ⚠️ **BREAKING**: `session_token` moved to separate `sessions` table
- ➕ **New tables**: `sessions`, `profiles` (links to Supabase Auth)
- ➕ **New fields**: `username`, `avatar_url`, `provider`, `is_active`, `email_verified`

---

## 8. ADDITIONAL SUPABASE TABLES (No SQLite Equivalent)

### Events Table
```sql
Events (
  id UUID PRIMARY KEY,
  business_id UUID FK,
  event_name VARCHAR NOT NULL,
  event_type VARCHAR CHECK (one_on_one|group|collective),
  schedule_type VARCHAR CHECK (one_time|recurring),
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
  created_by UUID FK profiles,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```
💡 **Purpose**: Advanced event management beyond simple appointments

### Workflows Tables
```sql
workflows (id, organization_id, user_id, name, description, is_active, trigger_type)
workflow_conditions (id, workflow_id, condition_type, condition_value)
workflow_actions (id, workflow_id, action_type, action_data)
workflow_logs (id, workflow_id, log_message, log_status)
```
💡 **Purpose**: Workflow automation system

---

## SUMMARY OF KEY DIFFERENCES

### Data Type Changes
| SQLite | Supabase | Impact |
|--------|----------|--------|
| INTEGER | UUID | ⚠️ **Breaking** - All IDs are UUIDs |
| DATETIME | TIMESTAMPTZ | ⚠️ **Breaking** - Timezone-aware timestamps |
| TEXT (numbers) | NUMERIC/INTEGER | ⚠️ **Breaking** - Parse string numbers |
| BOOLEAN (0/1) | BOOLEAN (true/false) | ⚠️ **Minor** - Boolean handling |
| TEXT (JSON) | JSONB | ✅ **Better** - Native JSON support |

### Architectural Changes
1. **Multi-tenancy**: ALL tables require `organization_id`
2. **Name Splitting**: Single `name` field → `first_name` + `last_name`
3. **Normalized Tables**: Single tables split into multiple related tables
4. **Enhanced Fields**: Many new fields for richer data model
5. **Auth Integration**: Supabase Auth with profiles table

### Missing Tables in Supabase
- ❌ `workspaces` - Can map to `organizations` or create new
- ❌ `resources` - Can map to `services` or create new
- ❌ `locations` - Can store in `organizations.address` JSONB
- ❌ `integrations` - Can store in `organizations.address` JSONB
- ❌ `custom_labels` - EXISTS as `business_custom_labels` (partial)
- ❌ `roles` - Can store in `salespersons.title` or create new
- ❌ `notification_settings` - Can store in `organizations.address` JSONB

---

## MIGRATION STRATEGY RECOMMENDATIONS

### Option 1: Hybrid Approach (Recommended)
- Keep SQLite for local development
- Use Supabase for production
- Create adapter layer to handle differences

### Option 2: Full Supabase Migration
1. Create missing tables in Supabase
2. Export SQLite data
3. Transform data to match Supabase schema
4. Import to Supabase
5. Update all backend routes

### Option 3: Schema Extension
Add missing columns to Supabase to match SQLite:
```sql
ALTER TABLE organizations ADD COLUMN brand_color TEXT;
ALTER TABLE organizations ADD COLUMN working_days TEXT;
-- etc.
```

---

## NEXT STEPS

1. ✅ Review this mapping document
2. ⏳ Decide on migration strategy
3. ⏳ Create organization record in Supabase
4. ⏳ Test Supabase connection
5. ⏳ Update one route to use Supabase (start with customers)
6. ⏳ Test thoroughly
7. ⏳ Gradually migrate remaining routes
