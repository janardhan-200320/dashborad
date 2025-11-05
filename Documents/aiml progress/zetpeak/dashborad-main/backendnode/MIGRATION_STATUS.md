# SQLite to Supabase Migration Status

## ✅ Completed Migrations (4/17 routes)

### 1. **customers.js** ✅ MIGRATED
- **Status**: Fully migrated to Supabase
- **Table**: `customers`
- **Key Changes**:
  - `name` field → split into `first_name` + `last_name`
  - Added `organization_id` filter to all queries
  - Converted all synchronous `db.prepare()` to async Supabase queries
  - Updated error handling for Supabase error codes (PGRST116, 23505)
  - Search uses `.ilike` for case-insensitive matching
- **Endpoints**: GET /, GET /:id, POST /, PUT /:id, DELETE /:id

### 2. **team-members.js** ✅ MIGRATED
- **Status**: Fully migrated to Supabase
- **Table**: `team_members` (SQLite) → `salespersons` (Supabase)
- **Key Changes**:
  - Table name change: team_members → salespersons
  - `name` field → split into `first_name` + `last_name`
  - Boolean fields: SQLite 0/1 → Supabase true/false
  - Added `organization_id` filter
  - Converted to async/await
- **Endpoints**: GET /, GET /active, GET /:id, POST /, PUT /:id, DELETE /:id, POST /:id/toggle_active

### 3. **services.js** ✅ MIGRATED
- **Status**: Fully migrated to Supabase
- **Table**: `services`
- **Key Changes**:
  - `duration` string (e.g., "60 mins") → `duration_minutes` integer
  - `price` string → numeric type with parseFloat()
  - `is_enabled` SQLite 0/1 → Supabase boolean
  - Added `organization_id` filter
  - Created helper function `parseDuration()` for string to int conversion
- **Endpoints**: GET /, GET /active, GET /:id, POST /, PUT /:id, DELETE /:id, POST /:id/toggle_enabled

### 4. **appointments.js** ✅ MIGRATED
- **Status**: Fully migrated to Supabase
- **Table**: `appointments`
- **Key Changes**:
  - Separate `date` + `time` fields → combined `start_time` ISO timestamp
  - `staff` string → `salesperson_id` UUID (references salespersons table)
  - Added Supabase joins with nested `select()` for customer/service/salesperson details
  - Created helper function `combineDateTimeToISO()` for timestamp conversion
  - Stats endpoint uses `count: 'exact', head: true` for efficient counting
  - Removed customer total_bookings update (can be done via database triggers)
- **Endpoints**: GET /, GET /upcoming, GET /today, GET /stats, GET /:id, POST /, PUT /:id, DELETE /:id, POST /:id/complete, POST /:id/cancel

---

## 🔄 Pending Migrations (13/17 routes)

### Priority: HIGH (Core Business Logic)

These routes are **not yet migrated** and will **fail** until converted:

#### **auth.js** - Authentication & Data Sync
- **Tables**: users, customers, services, team_members, custom_labels, appointments
- **Complexity**: HIGH - handles user auth + bulk data sync from frontend
- **Notes**: Uses multiple tables, needs complete rewrite for Supabase auth
- **Lines**: 200+ with multiple prepared statements

### Priority: MEDIUM (Settings & Configuration)

#### **onboarding.js** - Business Onboarding
- **Table**: `business_onboarding` (SQLite) → `businesses` (Supabase)
- **Complexity**: MEDIUM
- **Changes Needed**:
  - Convert to async/await
  - Add organization_id
  - Handle JSONB fields for industry_needs, availability, custom_labels
- **Endpoints**: GET /, GET /:id, POST /, PUT /:id

#### **organization-settings.js**
- **Table**: `organization_settings` → `organizations`
- **Complexity**: LOW
- **Changes Needed**: Simple CRUD, add organization_id filter

#### **workspaces.js**
- **Table**: `workspaces` → `organizations` (or separate if needed)
- **Complexity**: LOW
- **Changes Needed**: Map to organizations table or keep separate

#### **custom-labels.js**
- **Table**: `custom_labels` → `business_custom_labels`
- **Complexity**: LOW
- **Changes Needed**: Add organization_id, business_id linking

#### **integrations.js**
- **Table**: `integrations` → `organizations` (JSONB field)
- **Complexity**: MEDIUM
- **Changes Needed**: Store integration configs as JSONB in organizations

#### **locations.js**
- **Table**: `locations` → `organizations.address` (JSONB field)
- **Complexity**: LOW
- **Changes Needed**: Map to organizations address field

#### **notification-settings.js**
- **Table**: `notification_settings` → `organizations.notification_settings` (JSONB)
- **Complexity**: LOW
- **Changes Needed**: Store as JSONB in organizations table

#### **resources.js**
- **Table**: `resources` → `services`
- **Complexity**: LOW - likely duplicate of services.js
- **Changes Needed**: May need to merge with services.js or remove

#### **roles.js**
- **Table**: `roles` → `salespersons.role` field
- **Complexity**: LOW
- **Changes Needed**: Map to salespersons role field

### Priority: LOW (Reporting & Export)

#### **analytics.js** - Dashboard Metrics
- **Tables**: appointments, customers, services
- **Complexity**: MEDIUM
- **Changes Needed**:
  - Convert all count queries to Supabase
  - Update date filtering for ISO timestamps
  - Add organization_id to all aggregations
  - Use Supabase's `.count()` method
- **Endpoints**: GET /dashboard, GET /bookings-by-status, GET /recent-activity

#### **export.js** - CSV Export
- **Tables**: customers, services, team_members, appointments
- **Complexity**: MEDIUM
- **Changes Needed**:
  - Convert all queries to Supabase
  - Update field names (name → first_name/last_name, etc.)
  - Handle async/await for data fetching
- **Endpoints**: GET /customers, GET /services, GET /team-members, GET /appointments, GET /all

---

## 🏗️ Infrastructure Changes

### ✅ Completed
1. **server.js** - Removed SQLite initialization
2. **.env** - Removed DB_PATH, added DEFAULT_ORG_ID
3. **database/supabase.js** - Created Supabase client and mapping functions

### ⏳ Pending
1. **database/init.js** - Can be deleted (no longer used)
2. **database.sqlite** - Can be removed after data migration
3. **Remove all SQLite dependencies** from package.json (optional)

---

## 📝 Migration Checklist for Remaining Routes

For each route file, follow this process:

1. **Read current implementation** to understand all endpoints
2. **Identify table mappings** (SQLite → Supabase)
3. **Update imports**: `import db from '../database/init.js'` → `import { supabase } from '../database/supabase.js'`
4. **Add organization_id constant**: `const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'b8035af1-4c81-40d9-a4ac-143350c3d41f'`
5. **Convert all route handlers to async**: `router.get('/', (req, res) =>` → `router.get('/', async (req, res) =>`
6. **Replace db.prepare() with supabase queries**:
   - `db.prepare('SELECT * FROM table').all()` → `await supabase.from('table').select('*')`
   - `db.prepare('SELECT * FROM table WHERE id = ?').get(id)` → `await supabase.from('table').select('*').eq('id', id).single()`
   - `db.prepare('INSERT...').run(...)` → `await supabase.from('table').insert([{...}]).select()`
   - `db.prepare('UPDATE...').run(...)` → `await supabase.from('table').update({...}).eq('id', id)`
   - `db.prepare('DELETE...').run(...)` → `await supabase.from('table').delete().eq('id', id)`
7. **Add organization_id filter** to ALL queries
8. **Handle schema differences**:
   - name → first_name + last_name
   - duration string → duration_minutes integer
   - date + time → start_time ISO timestamp
   - Boolean 0/1 → true/false
9. **Update error handling**:
   - Check `error.code === 'PGRST116'` for not found (404)
   - Check `error.code === '23505'` for unique constraint (400)
10. **Test all endpoints** with Postman or curl

---

## 🔑 Key Supabase Patterns

### Query Patterns
```javascript
// SELECT ALL with pagination
const { data, error, count } = await supabase
  .from('table_name')
  .select('*', { count: 'exact' })
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// SELECT ONE
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', id)
  .single();

// INSERT
const { data, error } = await supabase
  .from('table_name')
  .insert([{ organization_id: orgId, ...fields }])
  .select()
  .single();

// UPDATE
const { data, error } = await supabase
  .from('table_name')
  .update({ ...fields, updated_at: new Date().toISOString() })
  .eq('id', id)
  .select()
  .single();

// DELETE
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id);

// COUNT
const { count } = await supabase
  .from('table_name')
  .select('*', { count: 'exact', head: true })
  .eq('organization_id', orgId);

// JOINS (nested select)
const { data, error } = await supabase
  .from('appointments')
  .select(`
    *,
    customer:customers(id, first_name, last_name, email),
    service:services(id, name, duration_minutes)
  `)
  .eq('id', id)
  .single();
```

### Error Handling
```javascript
if (error) {
  if (error.code === 'PGRST116') {
    return res.status(404).json({ error: 'Not found' });
  }
  if (error.code === '23505') {
    return res.status(400).json({ error: 'Duplicate entry' });
  }
  throw error;
}
```

---

## 🎯 Next Steps

### Immediate (Critical for App Functionality)
1. ✅ Test migrated routes (customers, team-members, services, appointments)
2. ⏳ Migrate **auth.js** - Most complex, handles user authentication
3. ⏳ Migrate **analytics.js** - Dashboard metrics
4. ⏳ Migrate **onboarding.js** - Business setup flow

### Short Term
5. Migrate remaining settings routes (organization-settings, workspaces, custom-labels, etc.)
6. Migrate export.js for CSV downloads
7. Test all endpoints with frontend integration
8. Remove SQLite database file after confirming all data is in Supabase

### Long Term
9. Set up proper RLS policies in Supabase (currently disabled)
10. Add database triggers for calculated fields (total_bookings, etc.)
11. Optimize queries with indexes
12. Add database backups and monitoring

---

## 🐛 Known Issues & Considerations

1. **RLS Disabled**: All Supabase tables have RLS disabled for development. Must re-enable with proper policies for production.
2. **Organization ID Hardcoded**: Currently using `b8035af1-4c81-40d9-a4ac-143350c3d41f` from environment. Need multi-tenant support.
3. **No Data Migration Script**: Existing SQLite data needs manual migration or script to copy to Supabase.
4. **Timestamp Handling**: Supabase uses ISO 8601 timestamps, SQLite used various formats.
5. **Foreign Key Constraints**: Supabase enforces FK constraints strictly - must ensure referenced records exist.
6. **Auth System**: Current auth.js uses custom JWT - may want to use Supabase Auth instead.
7. **File Upload**: If any routes handle file uploads, need to migrate to Supabase Storage.

---

## 📊 Migration Progress

**Routes Migrated**: 4 / 17 (23.5%)
**Critical Routes**: 4 / 7 (57%)
**Backend Status**: ✅ Server running successfully with migrated routes
**Database Status**: ✅ Supabase connected, RLS disabled
**Next Priority**: auth.js migration

---

*Last Updated*: Migration completed for customers, team-members, services, and appointments routes.
*Server Status*: Running on http://localhost:8000 with Supabase backend.
