import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  organizationApi, 
  customersApi, 
  salespersonsApi, 
  servicesApi, 
  appointmentsApi,
  workflowsApi 
} from '@/lib/api';
import { useToast } from './use-toast';

// Example: Organization hooks
export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      organizationApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organization', data.id] });
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update organization",
        variant: "destructive",
      });
    },
  });
}

// Customers hooks
export function useCustomers(organizationId: string) {
  return useQuery({
    queryKey: ['customers', organizationId],
    queryFn: () => customersApi.getAll(organizationId),
    enabled: !!organizationId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['customers', variables.organization_id] });
      await queryClient.refetchQueries({ queryKey: ['customers', variables.organization_id] });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      customersApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });
}

// Salespersons hooks
export function useSalespersons(organizationId: string) {
  return useQuery({
    queryKey: ['salespersons', organizationId],
    queryFn: () => salespersonsApi.getAll(organizationId),
    enabled: !!organizationId,
  });
}

export function useCreateSalesperson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: salespersonsApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salespersons', variables.organization_id] });
      toast({
        title: "Success",
        description: "Team member created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team member",
        variant: "destructive",
      });
    },
  });
}

// Services hooks
export function useServices(organizationId: string) {
  return useQuery({
    queryKey: ['services', organizationId],
    queryFn: () => servicesApi.getAll(organizationId),
    enabled: !!organizationId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: servicesApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services', variables.organization_id] });
      toast({
        title: "Success",
        description: "Service created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    },
  });
}

// Appointments hooks
export function useAppointments(organizationId: string) {
  return useQuery({
    queryKey: ['appointments', organizationId],
    queryFn: () => appointmentsApi.getAll(organizationId),
    enabled: !!organizationId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.organization_id] });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    },
  });
}

// Workflows hooks
export function useWorkflows(organizationId: string) {
  return useQuery({
    queryKey: ['workflows', organizationId],
    queryFn: () => workflowsApi.getAll(organizationId),
    enabled: !!organizationId,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: workflowsApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows', variables.organization_id] });
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workflow",
        variant: "destructive",
      });
    },
  });
}
