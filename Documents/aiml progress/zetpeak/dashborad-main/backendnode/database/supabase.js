import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('organizations').select('count');
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

// Helper functions for mapping between SQLite and Supabase schemas
export const schemaMapping = {
  // Map SQLite table names to Supabase table names
  customers: 'customers',
  services: 'services',
  appointments: 'appointments',
  team_members: 'salespersons', // SQLite team_members -> Supabase salespersons
  business_onboarding: 'businesses',
  organization_settings: 'organizations',
  workspaces: 'organizations', // Can reuse organizations or create separate
  resources: 'services', // Map to services for now
  locations: 'organizations', // Store in organization address
  integrations: 'organizations', // Store integration settings in org
  custom_labels: 'business_custom_labels',
  roles: 'salespersons', // Role info in salesperson
  notification_settings: 'organizations', // Store in org settings
  users: 'users'
};

// Convert SQLite customer data to Supabase format
export function mapCustomerToSupabase(sqliteCustomer, organizationId) {
  const [firstName, ...lastNameParts] = (sqliteCustomer.name || '').split(' ');
  return {
    organization_id: organizationId,
    first_name: firstName || 'Unknown',
    last_name: lastNameParts.join(' ') || '',
    email: sqliteCustomer.email,
    phone: sqliteCustomer.phone || null,
    notes: sqliteCustomer.notes || null,
    total_spent: 0,
    total_visits: sqliteCustomer.total_bookings || 0,
    last_visit: sqliteCustomer.last_appointment || null,
    is_active: true
  };
}

// Convert SQLite service data to Supabase format
export function mapServiceToSupabase(sqliteService, organizationId) {
  // Parse duration (e.g., "60 mins" -> 60)
  const durationMinutes = parseInt(sqliteService.duration) || 60;
  const price = parseFloat(sqliteService.price?.replace(/[^0-9.]/g, '')) || 0;
  
  return {
    organization_id: organizationId,
    name: sqliteService.name,
    description: sqliteService.description || null,
    duration_minutes: durationMinutes,
    price: price,
    category: sqliteService.category || 'other',
    is_active: sqliteService.is_enabled || true,
    max_advance_booking_days: 30,
    min_advance_booking_days: 1
  };
}

// Convert SQLite appointment to Supabase format
export function mapAppointmentToSupabase(sqliteAppointment, organizationId) {
  // Parse date and time into ISO timestamps
  const startTime = new Date(`${sqliteAppointment.date}T${sqliteAppointment.time}`).toISOString();
  const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(); // +1 hour default
  
  return {
    organization_id: organizationId,
    customer_id: sqliteAppointment.customer_id,
    salesperson_id: null, // Map from staff name if available
    service_id: sqliteAppointment.service_id,
    title: `Appointment - ${sqliteAppointment.staff || 'General'}`,
    description: sqliteAppointment.notes || null,
    start_time: startTime,
    end_time: endTime,
    status: sqliteAppointment.status || 'pending',
    price: 0,
    payment_status: 'pending',
    notes: sqliteAppointment.notes || null,
    reminder_sent: false
  };
}

// Convert SQLite team member to Supabase salesperson
export function mapTeamMemberToSupabase(sqliteTeamMember, organizationId) {
  const [firstName, ...lastNameParts] = (sqliteTeamMember.name || '').split(' ');
  
  return {
    organization_id: organizationId,
    user_id: null, // Link to auth user if available
    first_name: firstName || 'Unknown',
    last_name: lastNameParts.join(' ') || '',
    email: sqliteTeamMember.email,
    phone: null,
    title: sqliteTeamMember.role || 'salesperson',
    bio: null,
    avatar_url: sqliteTeamMember.avatar || null,
    specialities: [],
    working_hours: {},
    is_active: sqliteTeamMember.is_active !== false,
    commission_rate: null
  };
}

export default supabase;
