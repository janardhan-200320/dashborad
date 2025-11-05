# Getting Existing Organization IDs from Supabase

## Method 1: Use Database Inspector Page (Recommended - Easiest)

1. **Navigate to Database Inspector:**
   - Go to: `http://localhost:5174/dashboard/database`
   - Or click the link in your dashboard

2. **What You'll See:**
   - ✅ All existing **Organizations** with their IDs
   - ✅ All existing **Businesses** with their IDs
   - ✅ All existing **Users** with their IDs
   - ✅ **Copy ID** buttons for easy copying

3. **Create New Organization (if needed):**
   - Enter organization name
   - Click "Create Organization"
   - Automatically creates with:
     - Timezone: Asia/Kolkata
     - Currency: INR
     - Status: Active
   - Returns the new Organization ID

4. **Copy the ID:**
   - Click the "Copy ID" button next to any organization
   - Paste it into your code where needed

## Method 2: Direct Supabase Query (Browser Console)

1. **Open Browser Console** (F12)

2. **Run this code:**
```javascript
// Import supabase
import { supabase } from '@/lib/supabase';

// Get all organizations
const { data, error } = await supabase
  .from('organizations')
  .select('*');

console.log('Organizations:', data);
// Copy the ID from the output
```

## Method 3: Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - URL: `https://supabase.com/dashboard/project/oioynuvrmvomqtrbszew`

2. **Navigate to Table Editor:**
   - Click "Table Editor" in left sidebar
   - Select `organizations` table
   - View all rows with their IDs

3. **Copy ID:**
   - Click on any ID cell
   - Copy the UUID value

## Method 4: SQL Query in Supabase

1. **Go to SQL Editor** in Supabase Dashboard

2. **Run this query:**
```sql
SELECT id, name, email, timezone, currency, is_active, created_at 
FROM organizations 
ORDER BY created_at DESC;
```

3. **Copy the ID** from the results

## Using the Organization ID

### Option A: Set in WorkspaceContext

```typescript
// In your WorkspaceContext
const defaultOrgId = 'paste-your-org-id-here';
```

### Option B: Use in Components

```typescript
import { useCustomers } from '@/hooks/use-database';

function MyComponent() {
  const orgId = 'paste-your-org-id-here';
  const { data: customers } = useCustomers(orgId);
  
  return <div>...</div>;
}
```

### Option C: Store in Environment Variable

Create `.env` file:
```
VITE_DEFAULT_ORG_ID=paste-your-org-id-here
```

Use in code:
```typescript
const orgId = import.meta.env.VITE_DEFAULT_ORG_ID;
```

## Quick Links

- **Database Inspector Page:** `/dashboard/database`
- **Supabase Project:** `https://supabase.com/dashboard/project/oioynuvrmvomqtrbszew`
- **API Reference:** See `SUPABASE_GUIDE.md`

## Example: Complete Flow

1. Go to `http://localhost:5174/dashboard/database`
2. See existing organizations OR create new one
3. Click "Copy ID" button
4. Paste into your code:
```typescript
const ORGANIZATION_ID = '550e8400-e29b-41d4-a716-446655440000'; // Your copied ID
const { data } = useCustomers(ORGANIZATION_ID);
```

That's it! 🎉
