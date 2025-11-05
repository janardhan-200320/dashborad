# Supabase Integration Guide

This guide will help you integrate your existing Supabase database with the Zervos Booking System backend.

## ✅ Prerequisites Complete

- ✅ Supabase account and project
- ✅ Existing database schema with tables
- ✅ Supabase credentials configured in `.env`

## Your Existing Supabase Schema

Your Supabase database already has the following tables:
- ✅ `organizations` - Organization/business details
- ✅ `customers` - Customer information
- ✅ `services` - Service offerings
- ✅ `appointments` - Booking appointments
- ✅ `salespersons` - Team members/sales staff
- ✅ `users` - User authentication
- ✅ `businesses` - Business profiles
- ✅ `Events` - Event management
- ✅ `workflows` - Workflow automation
- ✅ And more...

## Schema Mapping (SQLite → Supabase)

The backend currently uses SQLite with these table mappings to Supabase:

| SQLite Table | Supabase Table | Notes |
|-------------|----------------|-------|
| `customers` | `customers` | ✅ Direct mapping |
| `services` | `services` | ✅ Direct mapping |
| `appointments` | `appointments` | ✅ Direct mapping |
| `team_members` | `salespersons` | Team members = Salespersons |
| `business_onboarding` | `businesses` | Business setup data |
| `organization_settings` | `organizations` | Organization config |
| `users` | `users` | ✅ Direct mapping |
| `workspaces` | `organizations` | Can be stored in org |
| `custom_labels` | `business_custom_labels` | Label customization |
| `integrations` | Store in `organizations.address` as JSONB |
| `notification_settings` | Store in `organizations.address` as JSONB |

## Step 1: Test Supabase Connection

The Supabase client is already configured in `backendnode/database/supabase.js`.

To test the connection:

```bash
cd backendnode
node -e "import('./database/supabase.js').then(m => m.testSupabaseConnection())"
```

## Step 2: Environment Variables

Your `.env` file already has:

```env
SUPABASE_URL=https://oioynuvrmvomqtrbszew.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Using Supabase Routes

### Example: Customers Route (Supabase Version)

A new file `routes/customers-supabase.js` has been created showing how to:
- ✅ Query customers with pagination
- ✅ Create new customers
- ✅ Update customer details
- ✅ Delete customers
- ✅ Get customer statistics

### Key Differences from SQLite:

**SQLite (better-sqlite3):**
```javascript
const customers = db.prepare('SELECT * FROM customers').all();
```

**Supabase:**
```javascript
const { data, error } = await supabase
  .from('customers')
  .select('*');
```

## Step 4: Important Schema Differences

### Customer Names
- **SQLite**: Single `name` field
- **Supabase**: Separate `first_name` and `last_name`

### UUIDs vs Auto-increment IDs
- **SQLite**: Integer IDs (1, 2, 3...)
- **Supabase**: UUID IDs (`550e8400-e29b-41d4-a716-446655440000`)

### Organization Context
- **Supabase requires `organization_id`** for multi-tenancy
- You need to track which organization the user belongs to

## Step 5: Migration Strategy

### Option A: Dual Mode (Recommended for Testing)
Keep both SQLite and Supabase, switch via environment variable:

```env
DATABASE_MODE=supabase  # or 'sqlite'
```

### Option B: Full Migration
1. Export data from SQLite
2. Transform to Supabase format
3. Import to Supabase
4. Update all routes to use Supabase

## Step 6: Next Steps

### Immediate Tasks:
1. ✅ Install Supabase client - DONE
2. ✅ Configure environment variables - DONE  
3. ✅ Create Supabase client wrapper - DONE
4. ⏳ Test connection to your Supabase instance
5. ⏳ Create/update one route to use Supabase
6. ⏳ Test the route thoroughly
7. ⏳ Migrate remaining routes incrementally

### Create Organization First

Before using the API, you need at least one organization in Supabase:

```sql
-- Run this in Supabase SQL Editor
INSERT INTO organizations (name, timezone, currency)
VALUES ('Your Business Name', 'Asia/Kolkata', 'INR')
RETURNING id;
```

Copy the returned `id` - you'll need it for API calls.

## Step 7: Authentication Flow

Your existing schema has:
- ✅ `users` table for user accounts
- ✅ `sessions` table for session management
- ✅ `password_reset_tokens` for password reset
- ✅ `profiles` linked to `auth.users`

### Integration with Supabase Auth

You can use Supabase's built-in auth OR your custom users table:

**Option A: Supabase Auth (Recommended)**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

**Option B: Custom Auth**
Use your existing `users` table with password hashing (bcrypt).

## Supabase Dashboard Links

- **Project Dashboard**: https://supabase.com/dashboard/project/oioynuvrmvomqtrbszew
- **SQL Editor**: https://supabase.com/dashboard/project/oioynuvrmvomqtrbszew/sql
- **Table Editor**: https://supabase.com/dashboard/project/oioynuvrmvomqtrbszew/editor
- **API Docs**: https://supabase.com/dashboard/project/oioynuvrmvomqtrbszew/api
- **Auth**: https://supabase.com/dashboard/project/oioynuvrmvomqtrbszew/auth/users

## Benefits of Your Current Setup

- ✅ **Multi-tenancy Ready** - Organization-based data isolation
- ✅ **UUID Primary Keys** - Better for distributed systems
- ✅ **JSONB Columns** - Flexible schema for settings/metadata
- ✅ **Comprehensive Schema** - Workflows, events, profiles
- ✅ **Row Level Security** - Built-in security policies
- ✅ **Real-time** - Can subscribe to database changes

## Example: Testing the Supabase Integration

1. **Test Connection**:
```bash
cd backendnode
npm start
# Check console for "✅ Supabase connected successfully"
```

2. **Create an organization** (via Supabase dashboard or SQL)

3. **Test API with organization ID**:
```bash
curl -X GET http://localhost:8000/api/customers \
  -H "x-organization-id: YOUR_ORG_ID_HERE"
```

## Need Help?

Check the example route in `routes/customers-supabase.js` for patterns on:
- Querying with filters
- Pagination
- Error handling
- UUID handling
- Organization scoping
