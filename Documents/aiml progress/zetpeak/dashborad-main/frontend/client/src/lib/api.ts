import { supabase } from './supabase';

// Organization operations
export const organizationApi = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(org: {
    name: string;
    description?: string;
    website_url?: string;
    logo_url?: string;
    phone?: string;
    email?: string;
    timezone?: string;
    currency?: string;
  }) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([org])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Customers operations
export const customersApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(customer: {
    organization_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    address?: any;
    notes?: string;
    tags?: string[];
  }) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Salespersons operations
export const salespersonsApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('salespersons')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(salesperson: {
    organization_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    title?: string;
    bio?: string;
    avatar_url?: string;
    specialities?: string[];
    working_hours?: any;
    commission_rate?: number;
  }) {
    const { data, error } = await supabase
      .from('salespersons')
      .insert([salesperson])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('salespersons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('salespersons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Services operations
export const servicesApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(service: {
    organization_id: string;
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
    category?: string;
    max_advance_booking_days?: number;
    min_advance_booking_days?: number;
  }) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Appointments operations
export const appointmentsApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(*),
        salesperson:salespersons(*),
        service:services(*)
      `)
      .eq('organization_id', organizationId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(appointment: {
    organization_id: string;
    customer_id: string;
    salesperson_id?: string;
    service_id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    price: number;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Workflows operations
export const workflowsApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_actions(*),
        workflow_conditions(*)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(workflow: {
    organization_id: string;
    user_id: string;
    name: string;
    description?: string;
    trigger_type: string;
    is_active?: boolean;
  }) {
    const { data, error } = await supabase
      .from('workflows')
      .insert([workflow])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async addAction(action: {
    workflow_id: string;
    action_type: string;
    action_data?: any;
  }) {
    const { data, error } = await supabase
      .from('workflow_actions')
      .insert([action])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addCondition(condition: {
    workflow_id: string;
    condition_type: string;
    condition_value: string;
  }) {
    const { data, error } = await supabase
      .from('workflow_conditions')
      .insert([condition])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
