# Supabase Database Integration Guide

## Overview
Your frontend is now connected to Supabase PostgreSQL database.

## Configuration Files

### 1. `client/src/lib/supabase.ts`
- Supabase client initialization
- Database type definitions
- Connection configuration

### 2. `client/src/lib/api.ts`
- API functions for all database operations
- CRUD operations for each table
- Type-safe methods

### 3. `client/src/hooks/use-database.ts`
- React Query hooks for data fetching
- Automatic caching and revalidation
- Optimistic updates
- Toast notifications

## Usage Examples

### 1. Fetch Customers
```typescript
import { useCustomers } from '@/hooks/use-database';

function CustomersList() {
  const { data: customers, isLoading, error } = useCustomers('org-id-here');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading customers</div>;
  
  return (
    <ul>
      {customers?.map(customer => (
        <li key={customer.id}>
          {customer.first_name} {customer.last_name} - {customer.email}
        </li>
      ))}
    </ul>
  );
}
```

### 2. Create Customer
```typescript
import { useCreateCustomer } from '@/hooks/use-database';

function CreateCustomerForm() {
  const createCustomer = useCreateCustomer();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCustomer.mutateAsync({
      organization_id: 'org-id-here',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Update Organization
```typescript
import { useUpdateOrganization } from '@/hooks/use-database';

function OrgSettings() {
  const updateOrg = useUpdateOrganization();
  
  const handleSave = async () => {
    await updateOrg.mutateAsync({
      id: 'org-id-here',
      updates: {
        name: 'New Name',
        timezone: 'America/New_York'
      }
    });
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### 4. Fetch Appointments with Relations
```typescript
import { useAppointments } from '@/hooks/use-database';

function AppointmentsList() {
  const { data: appointments } = useAppointments('org-id-here');
  
  return (
    <ul>
      {appointments?.map(apt => (
        <li key={apt.id}>
          {apt.title} - {apt.customer.first_name} {apt.customer.last_name}
          <br />
          Service: {apt.service.name}
          <br />
          Salesperson: {apt.salesperson?.first_name}
        </li>
      ))}
    </ul>
  );
}
```

## Available APIs

### Organizations
- `organizationApi.getById(id)`
- `organizationApi.create(data)`
- `organizationApi.update(id, updates)`

### Customers
- `customersApi.getAll(organizationId)`
- `customersApi.create(data)`
- `customersApi.update(id, updates)`
- `customersApi.delete(id)`

### Salespersons (Team Members)
- `salespersonsApi.getAll(organizationId)`
- `salespersonsApi.create(data)`
- `salespersonsApi.update(id, updates)`
- `salespersonsApi.delete(id)`

### Services
- `servicesApi.getAll(organizationId)`
- `servicesApi.create(data)`
- `servicesApi.update(id, updates)`
- `servicesApi.delete(id)`

### Appointments
- `appointmentsApi.getAll(organizationId)`
- `appointmentsApi.create(data)`
- `appointmentsApi.update(id, updates)`
- `appointmentsApi.delete(id)`

### Workflows
- `workflowsApi.getAll(organizationId)`
- `workflowsApi.create(data)`
- `workflowsApi.update(id, updates)`
- `workflowsApi.delete(id)`
- `workflowsApi.addAction(data)`
- `workflowsApi.addCondition(data)`

## React Query Hooks

All hooks automatically:
- ✅ Handle loading states
- ✅ Handle errors
- ✅ Cache data
- ✅ Revalidate on focus
- ✅ Show toast notifications
- ✅ Invalidate related queries

### Available Hooks:
- `useOrganization(id)`
- `useUpdateOrganization()`
- `useCustomers(organizationId)`
- `useCreateCustomer()`
- `useUpdateCustomer()`
- `useDeleteCustomer()`
- `useSalespersons(organizationId)`
- `useCreateSalesperson()`
- `useServices(organizationId)`
- `useCreateService()`
- `useAppointments(organizationId)`
- `useCreateAppointment()`
- `useWorkflows(organizationId)`
- `useCreateWorkflow()`

## Direct Supabase Access

For custom queries:
```typescript
import { supabase } from '@/lib/supabase';

// Custom query
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('email', 'john@example.com')
  .single();

// Realtime subscription
supabase
  .channel('appointments-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'appointments' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe();
```

## Environment Variables

Create a `.env` file in the frontend directory:
```
VITE_SUPABASE_URL=https://oioynuvrmvomqtrbszew.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_DEFAULT_ORG_ID=your_org_id_here
```

## Database Tables

Your Supabase database includes:
- ✅ `organizations` - Business organizations
- ✅ `customers` - Customer records
- ✅ `salespersons` - Team members/staff
- ✅ `services` - Service offerings
- ✅ `appointments` - Scheduled appointments
- ✅ `workflows` - Automation workflows
- ✅ `workflow_actions` - Workflow actions
- ✅ `workflow_conditions` - Workflow conditions
- ✅ `businesses` - Business details
- ✅ `Events` - Event types
- ✅ `users` - User accounts
- ✅ `profiles` - User profiles

## Next Steps

1. **Create an Organization** in Supabase (or use existing)
2. **Set Organization ID** in your workspace context
3. **Replace localStorage** calls with Supabase hooks
4. **Test CRUD operations** with your UI

## Migration from localStorage

Replace this:
```typescript
const data = JSON.parse(localStorage.getItem('zervos_customers') || '[]');
```

With this:
```typescript
const { data } = useCustomers(organizationId);
```
