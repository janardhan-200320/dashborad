import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type CustomizationsProps = {
  initialSection?: 'custom-domain' | 'in-product' | 'labels' | 'roles';
};

interface CustomLabel {
  id: number;
  label_type: string;
  label_value: string;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

interface NotificationSettings {
  [entityType: string]: {
    [eventType: string]: boolean;
  };
}

// API functions
const fetchCustomLabels = async (): Promise<CustomLabel[]> => {
  const response = await fetch('http://localhost:8000/api/custom-labels');
  if (!response.ok) throw new Error('Failed to fetch custom labels');
  const data = await response.json();
  return data.results;
};

const updateCustomLabel = async (id: number, updates: Partial<CustomLabel>): Promise<CustomLabel> => {
  const response = await fetch(`http://localhost:8000/api/custom-labels/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update custom label');
  return response.json();
};

const fetchRoles = async (): Promise<Role[]> => {
  const response = await fetch('http://localhost:8000/api/roles');
  if (!response.ok) throw new Error('Failed to fetch roles');
  const data = await response.json();
  return data.results;
};

const updateRole = async (id: number, updates: Partial<Role>): Promise<Role> => {
  const response = await fetch(`http://localhost:8000/api/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update role');
  return response.json();
};

const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await fetch('http://localhost:8000/api/notification-settings');
  if (!response.ok) throw new Error('Failed to fetch notification settings');
  const data = await response.json();
  return data.results;
};

const updateNotificationSetting = async (entityType: string, eventType: string, isEnabled: boolean): Promise<void> => {
  const response = await fetch(`http://localhost:8000/api/notification-settings/${entityType}/${eventType}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_enabled: isEnabled }),
  });
  if (!response.ok) throw new Error('Failed to update notification setting');
};

export default function Customizations({ initialSection }: CustomizationsProps) {
  const [section, setSection] = useState<'custom-domain' | 'in-product' | 'labels' | 'roles'>(initialSection ?? 'custom-domain');
  const [defaultDomain, setDefaultDomain] = useState('https://ddfdf.zohobookings.in');
  const [customDomain, setCustomDomain] = useState('');
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialSection) setSection(initialSection);
  }, [initialSection]);

  // Queries
  const { data: customLabels = [], isLoading: labelsLoading } = useQuery({
    queryKey: ['custom-labels'],
    queryFn: fetchCustomLabels,
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  const { data: notificationSettings = {}, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: fetchNotificationSettings,
  });

  // Mutations
  const updateLabelMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<CustomLabel> }) => 
      updateCustomLabel(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-labels'] });
      setEditingLabel(null);
      toast({ title: 'Label updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update label', variant: 'destructive' });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Role> }) => 
      updateRole(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      toast({ title: 'Role updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update role', variant: 'destructive' });
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: ({ entityType, eventType, isEnabled }: { entityType: string; eventType: string; isEnabled: boolean }) => 
      updateNotificationSetting(entityType, eventType, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: () => {
      toast({ title: 'Failed to update notification setting', variant: 'destructive' });
    },
  });

  return (
    <div className="h-full p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Product Customizations</h1>
          <p className="text-gray-600 mt-1">Customize your booking system</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input className="pl-10" placeholder="Search settings" />
        </div>
      </div>

      <div>
        {/* Content area (no internal left nav) */}
        <div className="w-full">
          {section === 'custom-domain' && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-white border rounded-md p-6">
                    <h3 className="font-medium">Share Booking Page</h3>
                    <p className="text-sm text-gray-500 mt-1">Here's your business booking page. You can customize the default URL or launch your own domain.</p>

                    <div className="mt-4">
                      <label className="text-sm text-gray-600">Default booking domain</label>
                      <div className="mt-2 flex gap-3 items-center">
                        <Input value={defaultDomain} onChange={(e) => setDefaultDomain(e.target.value)} />
                        <Button variant="outline">Customize</Button>
                        <Button>Copy</Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm text-gray-600">Custom Domain</label>
                      <div className="mt-2 flex gap-3 items-center">
                        <Input placeholder="For example, book.zylker.com" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} />
                        <Button>Launch</Button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium">On accessing the booking domain, redirect to</h4>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <label className="flex items-center gap-2"><input type="radio" name="redirect" /> First workspace booking page</label>
                        <label className="flex items-center gap-2"><input type="radio" name="redirect" defaultChecked /> Business booking page (All workspaces)</label>
                        <label className="flex items-center gap-2"><input type="radio" name="redirect" /> External URL</label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'in-product' && (
            <Card>
              <CardHeader>
                <CardTitle>In-product Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="text-center py-4">Loading notification settings...</div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { title: 'Appointment', entityType: 'appointment', events: ['Scheduled', 'Canceled', 'Rescheduled'] },
                      { title: 'Recruiter', entityType: 'recruiter', events: ['Created', 'Edited', 'Deleted', 'On Leave'] },
                      { title: 'Interview', entityType: 'interview', events: ['Created', 'Edited', 'Deleted'] },
                      { title: 'Customer', entityType: 'customer', events: ['Created', 'Edited', 'Deleted'] },
                      { title: 'Payment', entityType: 'payment', events: ['Success', 'Failure'] },
                    ].map((item) => (
                      <div key={item.title} className="border rounded-md p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500">Notify When</div>
                        </div>
                        <div className="flex gap-6">
                          {item.events.map((ev) => (
                            <label key={ev} className="flex items-center gap-2 text-sm">
                              <input 
                                type="checkbox" 
                                checked={notificationSettings[item.entityType]?.[ev.toLowerCase()] || false}
                                onChange={(e) => {
                                  updateNotificationMutation.mutate({
                                    entityType: item.entityType,
                                    eventType: ev.toLowerCase(),
                                    isEnabled: e.target.checked
                                  });
                                }}
                              />
                              <span>{ev}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {section === 'labels' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Custom Labels</CardTitle>
                <Button variant="outline" onClick={() => setEditingLabel(editingLabel ? null : -1)}>
                  {editingLabel ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent>
                {labelsLoading ? (
                  <div className="text-center py-4">Loading labels...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-8">
                    {['workspaces', 'eventType', 'user', 'resource'].map((type) => {
                      const label = customLabels.find(l => l.label_type === type);
                      const isEditing = editingLabel === (label?.id || -1);
                      
                      return (
                        <div key={type} className="py-6 border-b">
                          <div className="font-medium mb-3">
                            {type === 'eventType' ? 'Event Type' : type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                          <div className="space-y-3 text-sm text-gray-600">
                            <div>
                              <div className="text-xs text-gray-400 mb-1">One</div>
                              {isEditing ? (
                                <Input
                                  defaultValue={label?.label_value || ''}
                                  onBlur={(e) => {
                                    if (label && e.target.value !== label.label_value) {
                                      updateLabelMutation.mutate({
                                        id: label.id,
                                        updates: { label_value: e.target.value }
                                      });
                                    }
                                  }}
                                  className="h-8"
                                />
                              ) : (
                                <div>{label?.label_value || 'Not set'}</div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Many</div>
                              <div>{label?.label_value ? label.label_value + 's' : 'Not set'}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {section === 'roles' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Roles and Permissions</CardTitle>
                <div className="flex items-center gap-3">
                  <Input placeholder="Role" className="w-48" />
                </div>
              </CardHeader>
              <CardContent>
                {rolesLoading ? (
                  <div className="text-center py-4">Loading roles...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-sm text-gray-500">
                          <th className="py-3">Role</th>
                          <th className="py-3">View</th>
                          <th className="py-3">Edit</th>
                          <th className="py-3">Add</th>
                          <th className="py-3">Delete</th>
                          <th className="py-3">Export</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.map((role) => (
                          <tr key={role.id} className="border-t">
                            <td className="py-4 font-medium">{role.name}</td>
                            <td className="py-4">
                              <input 
                                type="checkbox" 
                                checked={role.permissions?.includes('view') || false}
                                onChange={(e) => {
                                  const newPermissions = e.target.checked 
                                    ? [...(role.permissions || []), 'view']
                                    : (role.permissions || []).filter(p => p !== 'view');
                                  updateRoleMutation.mutate({
                                    id: role.id,
                                    updates: { permissions: newPermissions }
                                  });
                                }}
                              />
                            </td>
                            <td className="py-4">
                              <input 
                                type="checkbox" 
                                checked={role.permissions?.includes('edit') || false}
                                onChange={(e) => {
                                  const newPermissions = e.target.checked 
                                    ? [...(role.permissions || []), 'edit']
                                    : (role.permissions || []).filter(p => p !== 'edit');
                                  updateRoleMutation.mutate({
                                    id: role.id,
                                    updates: { permissions: newPermissions }
                                  });
                                }}
                              />
                            </td>
                            <td className="py-4">
                              <input 
                                type="checkbox" 
                                checked={role.permissions?.includes('add') || false}
                                onChange={(e) => {
                                  const newPermissions = e.target.checked 
                                    ? [...(role.permissions || []), 'add']
                                    : (role.permissions || []).filter(p => p !== 'add');
                                  updateRoleMutation.mutate({
                                    id: role.id,
                                    updates: { permissions: newPermissions }
                                  });
                                }}
                              />
                            </td>
                            <td className="py-4">
                              <input 
                                type="checkbox" 
                                checked={role.permissions?.includes('delete') || false}
                                onChange={(e) => {
                                  const newPermissions = e.target.checked 
                                    ? [...(role.permissions || []), 'delete']
                                    : (role.permissions || []).filter(p => p !== 'delete');
                                  updateRoleMutation.mutate({
                                    id: role.id,
                                    updates: { permissions: newPermissions }
                                  });
                                }}
                              />
                            </td>
                            <td className="py-4">
                              <input 
                                type="checkbox" 
                                checked={role.permissions?.includes('export') || false}
                                onChange={(e) => {
                                  const newPermissions = e.target.checked 
                                    ? [...(role.permissions || []), 'export']
                                    : (role.permissions || []).filter(p => p !== 'export');
                                  updateRoleMutation.mutate({
                                    id: role.id,
                                    updates: { permissions: newPermissions }
                                  });
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
