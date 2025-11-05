import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oioynuvrmvomqtrbszew.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pb3ludXZybXZvbXF0cmJzemV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzQxMTQsImV4cCI6MjA3NzMxMDExNH0.g_01yuti2StGkPsTUfBLLt7aR7vfbxZJNBxuMwok5Kw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types based on your schema
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          website_url: string | null;
          logo_url: string | null;
          phone: string | null;
          email: string | null;
          address: any | null;
          timezone: string;
          currency: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          address: any | null;
          notes: string | null;
          tags: string[] | null;
          total_spent: number;
          total_visits: number;
          last_visit: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      salespersons: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          title: string | null;
          bio: string | null;
          avatar_url: string | null;
          specialities: string[] | null;
          working_hours: any | null;
          is_active: boolean;
          commission_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['salespersons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['salespersons']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          category: string | null;
          is_active: boolean;
          max_advance_booking_days: number;
          min_advance_booking_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          salesperson_id: string | null;
          service_id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          price: number;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          notes: string | null;
          cancellation_reason: string | null;
          reminder_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      workflows: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          trigger_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workflows']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workflows']['Insert']>;
      };
      workflow_actions: {
        Row: {
          id: string;
          workflow_id: string;
          action_type: string;
          action_data: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workflow_actions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workflow_actions']['Insert']>;
      };
      workflow_conditions: {
        Row: {
          id: string;
          workflow_id: string;
          condition_type: string;
          condition_value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workflow_conditions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workflow_conditions']['Insert']>;
      };
      businesses: {
        Row: {
          id: string;
          business_name: string;
          business_location: string | null;
          business_description: string | null;
          business_website: string | null;
          currency_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>;
      };
      Events: {
        Row: {
          id: string;
          business_id: string | null;
          event_name: string;
          event_type: 'one_on_one' | 'group' | 'collective' | null;
          schedule_type: 'one_time' | 'recurring' | null;
          description: string | null;
          location: string | null;
          start_time: string | null;
          end_time: string | null;
          duration_minutes: number | null;
          capacity: number;
          price: number;
          currency_code: string;
          recurrence_rule: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['Events']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['Events']['Insert']>;
      };
    };
  };
}
