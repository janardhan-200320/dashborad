import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Users, Edit, Trash2, Mail, Phone, Briefcase, Upload, Calendar, Award, Copy, Eye, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface AvailabilitySchedule {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface Salesperson {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Super Admin' | 'Admin' | 'Staff' | 'Manager';
  workspace: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  availability?: string;
  workload?: string;
  profilePicture?: string;
  permissions?: Permission[];
  availabilitySchedule?: AvailabilitySchedule[];
  timezone?: string;
  totalBookings?: number;
  averageRating?: number;
  bookingLink?: string;
  notes?: string;
}

// Default permissions template
const DEFAULT_PERMISSIONS: Permission[] = [
  { module: 'Dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
  { module: 'Appointments', canView: true, canCreate: true, canEdit: true, canDelete: false },
  { module: 'Customers', canView: true, canCreate: false, canEdit: false, canDelete: false },
  { module: 'Services', canView: true, canCreate: false, canEdit: false, canDelete: false },
  { module: 'Reports', canView: false, canCreate: false, canEdit: false, canDelete: false },
  { module: 'Settings', canView: false, canCreate: false, canEdit: false, canDelete: false },
  { module: 'Workflows', canView: false, canCreate: false, canEdit: false, canDelete: false },
  { module: 'Team', canView: false, canCreate: false, canEdit: false, canDelete: false },
];

// Default weekly schedule
const DEFAULT_SCHEDULE: AvailabilitySchedule[] = [
  { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
  { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
];

// Helper function to generate booking link
const generateBookingLink = (name: string, id: string): string => {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `/book/team/${slug}-${id}`;
};

export default function Salespersons() {
  const { toast } = useToast();
  // Dynamic labels from organization/company profile
  interface Company { teamMemberLabel?: string }
  const [company, setCompany] = useState<Company | null>(null);
  const [orgLabels, setOrgLabels] = useState<{ teamMemberLabel?: string } | null>(null);
  useEffect(() => {
    const savedCompany = localStorage.getItem('zervos_company');
    if (savedCompany) setCompany(JSON.parse(savedCompany));

    // Fallback: also check organization settings for labels if present
    const orgSettingsRaw = localStorage.getItem('zervos_organization_settings');
    if (orgSettingsRaw) {
      try {
        const orgSettings = JSON.parse(orgSettingsRaw);
        // Support both flat and nested labels shapes
        const tm = orgSettings?.labels?.teamMemberLabel || orgSettings?.teamMemberLabel;
        if (tm) setOrgLabels({ teamMemberLabel: tm });
      } catch {}
    }
  }, []);
  const teamMemberLabel = orgLabels?.teamMemberLabel || company?.teamMemberLabel || 'Salespersons';
  const teamMemberLabelSingular = teamMemberLabel.endsWith('s') ? teamMemberLabel.slice(0, -1) : teamMemberLabel;
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Salesperson | null>(null);
  const [viewingPerson, setViewingPerson] = useState<Salesperson | null>(null);
  
  const [salespersons, setSalespersons] = useState<Salesperson[]>([
    {
      id: '1',
      name: 'Bharath Reddy',
      email: 'bharathreddyn6@gmail.com',
      phone: '+1 (555) 123-4567',
      role: 'Super Admin',
      workspace: 'bharath',
      status: 'Active',
      availability: 'Full Time',
      workload: 'Medium'
    }
  ]);

  const [newPerson, setNewPerson] = useState<Omit<Salesperson, 'id'>>({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    workspace: 'bharath',
    status: 'Active',
    availability: 'Full Time',
    workload: 'Low',
    profilePicture: '',
    permissions: [...DEFAULT_PERMISSIONS],
    availabilitySchedule: [...DEFAULT_SCHEDULE],
    timezone: 'Asia/Kolkata',
    totalBookings: 0,
    averageRating: 0,
    notes: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('zervos_salespersons');
    if (saved) {
      setSalespersons(JSON.parse(saved));
    }
  }, []);

  const saveToLocalStorage = (data: Salesperson[]) => {
    localStorage.setItem('zervos_salespersons', JSON.stringify(data));
    setSalespersons(data);
  };

  const handleAddPerson = () => {
    const id = Date.now().toString();
    const person: Salesperson = {
      id,
      ...newPerson,
      bookingLink: generateBookingLink(newPerson.name, id),
    };
    const updated = [...salespersons, person];
    saveToLocalStorage(updated);
    setAddModalOpen(false);
    setNewPerson({
      name: '',
      email: '',
      phone: '',
      role: 'Staff',
      workspace: 'bharath',
      status: 'Active',
      availability: 'Full Time',
      workload: 'Low',
      profilePicture: '',
      permissions: [...DEFAULT_PERMISSIONS],
      availabilitySchedule: [...DEFAULT_SCHEDULE],
      timezone: 'Asia/Kolkata',
      totalBookings: 0,
      averageRating: 0,
      notes: '',
    });
    toast({
      title: "Success",
      description: `${teamMemberLabelSingular} added successfully`,
    });
  };

  const handleEditPerson = () => {
    if (!editingPerson) return;
    const updated = salespersons.map(p => p.id === editingPerson.id ? editingPerson : p);
    saveToLocalStorage(updated);
    setEditModalOpen(false);
    setEditingPerson(null);
    toast({
      title: "Success",
      description: `${teamMemberLabelSingular} updated successfully`,
    });
  };

  const handleDeletePerson = (id: string) => {
    const updated = salespersons.filter(p => p.id !== id);
    saveToLocalStorage(updated);
    toast({
      title: "Success",
      description: `${teamMemberLabelSingular} removed`,
    });
  };

  const handleToggleStatus = (id: string) => {
    const person = salespersons.find(p => p.id === id);
    if (!person) return;
    
    const statuses: ('Active' | 'Inactive' | 'On Leave')[] = ['Active', 'Inactive', 'On Leave'];
    const currentIndex = statuses.indexOf(person.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    const updated = salespersons.map(p => 
      p.id === id ? { ...p, status: nextStatus } : p
    );
    saveToLocalStorage(updated);
    toast({
      title: "Success",
      description: "Status updated",
    });
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isEditing && editingPerson) {
        setEditingPerson({ ...editingPerson, profilePicture: base64String });
      } else {
        setNewPerson({ ...newPerson, profilePicture: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyBookingLink = (link: string) => {
    navigator.clipboard.writeText(window.location.origin + link);
    toast({
      title: "Success",
      description: "Booking link copied to clipboard",
    });
  };

  const filteredSalespersons = salespersons.filter(sp =>
    sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{teamMemberLabel}</h1>
          <Badge variant="secondary" className="text-sm">
            {salespersons.length} Total
          </Badge>
          <Badge variant="secondary" className="text-sm bg-green-100 text-green-700">
            {salespersons.filter(p => p.status === 'Active').length} Active
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="text"
              placeholder="Search by name, email, or role"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-80"
            />
          </div>
          <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} />
            {`Add ${teamMemberLabelSingular}`}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {teamMemberLabelSingular.toUpperCase()}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CONTACT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROLE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                WORKSPACE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AVAILABILITY
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSalespersons.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {person.profilePicture ? (
                      <img src={person.profilePicture} alt={person.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{person.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        {person.totalBookings !== undefined && (
                          <span>{person.totalBookings} bookings</span>
                        )}
                        {person.averageRating !== undefined && person.averageRating > 0 && (
                          <span>⭐ {person.averageRating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      {person.email}
                    </div>
                    {person.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        {person.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant="secondary" 
                    className={
                      person.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                      person.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
                      person.role === 'Manager' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }
                  >
                    {person.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="secondary" className="bg-pink-50 text-pink-700">
                    <Briefcase size={12} className="mr-1" />
                    {person.workspace}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{person.availability || 'Full Time'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(person.id)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      person.status === 'Active' ? 'bg-green-500' : 
                      person.status === 'On Leave' ? 'bg-yellow-500' : 
                      'bg-gray-400'
                    }`}></div>
                    <span className="text-sm text-gray-900">{person.status}</span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="View Details"
                      onClick={() => {
                        setViewingPerson(person);
                        setViewDetailsOpen(true);
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Edit"
                      onClick={() => {
                        setEditingPerson(person);
                        setEditModalOpen(true);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    {person.bookingLink && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Copy Booking Link"
                        onClick={() => handleCopyBookingLink(person.bookingLink!)}
                      >
                        <Copy size={16} />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Delete"
                      onClick={() => handleDeletePerson(person.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredSalespersons.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-1">No salespersons found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Add your first team member to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setAddModalOpen(true)} className="gap-2">
                <Plus size={16} />
                Add Salesperson
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>Add a new team member with permissions and availability</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {newPerson.profilePicture ? (
                    <img src={newPerson.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-gray-400" size={32} />
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => document.getElementById('add-profile-upload')?.click()}>
                  Upload Photo
                </Button>
                <input
                  id="add-profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleProfilePictureUpload(e, false)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={newPerson.email}
                    onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={newPerson.phone}
                    onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Select value={newPerson.role} onValueChange={(value: any) => setNewPerson({ ...newPerson, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select value={newPerson.timezone} onValueChange={(value: any) => setNewPerson({ ...newPerson, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Workspace</Label>
                  <Input
                    value={newPerson.workspace}
                    onChange={(e) => setNewPerson({ ...newPerson, workspace: e.target.value })}
                    placeholder="bharath"
                  />
                </div>
                <div>
                  <Label>Availability Type</Label>
                  <Select value={newPerson.availability} onValueChange={(value: any) => setNewPerson({ ...newPerson, availability: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Part Time">Part Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newPerson.notes}
                    onChange={(e) => setNewPerson({ ...newPerson, notes: e.target.value })}
                    placeholder="Additional notes about this team member..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">Set weekly working hours for this team member</p>
              {newPerson.availabilitySchedule?.map((schedule, index) => (
                <div key={schedule.day} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 w-32">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => {
                        const updated = [...(newPerson.availabilitySchedule || [])];
                        updated[index].enabled = checked;
                        setNewPerson({ ...newPerson, availabilitySchedule: updated });
                      }}
                    />
                    <Label className="font-medium">{schedule.day}</Label>
                  </div>
                  {schedule.enabled && (
                    <>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => {
                            const updated = [...(newPerson.availabilitySchedule || [])];
                            updated[index].startTime = e.target.value;
                            setNewPerson({ ...newPerson, availabilitySchedule: updated });
                          }}
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => {
                            const updated = [...(newPerson.availabilitySchedule || [])];
                            updated[index].endTime = e.target.value;
                            setNewPerson({ ...newPerson, availabilitySchedule: updated });
                          }}
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">Configure module access permissions</p>
              <div className="space-y-2">
                {newPerson.permissions?.map((perm, index) => (
                  <div key={perm.module} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={16} className="text-indigo-600" />
                      <span className="font-medium">{perm.module}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 ml-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={perm.canView}
                          onCheckedChange={(checked) => {
                            const updated = [...(newPerson.permissions || [])];
                            updated[index].canView = checked;
                            setNewPerson({ ...newPerson, permissions: updated });
                          }}
                        />
                        <Label className="text-sm">View</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={perm.canCreate}
                          onCheckedChange={(checked) => {
                            const updated = [...(newPerson.permissions || [])];
                            updated[index].canCreate = checked;
                            setNewPerson({ ...newPerson, permissions: updated });
                          }}
                        />
                        <Label className="text-sm">Create</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={perm.canEdit}
                          onCheckedChange={(checked) => {
                            const updated = [...(newPerson.permissions || [])];
                            updated[index].canEdit = checked;
                            setNewPerson({ ...newPerson, permissions: updated });
                          }}
                        />
                        <Label className="text-sm">Edit</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={perm.canDelete}
                          onCheckedChange={(checked) => {
                            const updated = [...(newPerson.permissions || [])];
                            updated[index].canDelete = checked;
                            setNewPerson({ ...newPerson, permissions: updated });
                          }}
                        />
                        <Label className="text-sm">Delete</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPerson} disabled={!newPerson.name || !newPerson.email}>
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal - Similar to Add but with existing data */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update team member information, permissions, and availability</DialogDescription>
          </DialogHeader>
          {editingPerson && (
            <>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {editingPerson.profilePicture ? (
                        <img src={editingPerson.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-white font-bold bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-2xl">
                          {editingPerson.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('edit-profile-upload')?.click()}>
                      Change Photo
                    </Button>
                    <input
                      id="edit-profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProfilePictureUpload(e, true)}
                    />
                  </div>
                  
                  {editingPerson.bookingLink && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-indigo-600" />
                        <span className="font-medium text-indigo-900">Booking Link:</span>
                        <code className="bg-white px-2 py-1 rounded text-xs">{editingPerson.bookingLink}</code>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleCopyBookingLink(editingPerson.bookingLink!)}>
                        <Copy size={14} />
                      </Button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={editingPerson.name}
                        onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        value={editingPerson.email}
                        onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        value={editingPerson.phone || ''}
                        onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Role *</Label>
                      <Select value={editingPerson.role} onValueChange={(value: any) => setEditingPerson({ ...editingPerson, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Staff">Staff</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Super Admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Timezone</Label>
                      <Select value={editingPerson.timezone || 'Asia/Kolkata'} onValueChange={(value: any) => setEditingPerson({ ...editingPerson, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Workspace</Label>
                      <Input
                        value={editingPerson.workspace}
                        onChange={(e) => setEditingPerson({ ...editingPerson, workspace: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Availability Type</Label>
                      <Select value={editingPerson.availability} onValueChange={(value: any) => setEditingPerson({ ...editingPerson, availability: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Time">Full Time</SelectItem>
                          <SelectItem value="Part Time">Part Time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={editingPerson.notes || ''}
                        onChange={(e) => setEditingPerson({ ...editingPerson, notes: e.target.value })}
                        placeholder="Additional notes..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="availability" className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">Manage weekly working hours</p>
                  {(editingPerson.availabilitySchedule || DEFAULT_SCHEDULE).map((schedule, index) => (
                    <div key={schedule.day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2 w-32">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={(checked) => {
                            const updated = [...(editingPerson.availabilitySchedule || DEFAULT_SCHEDULE)];
                            updated[index] = { ...updated[index], enabled: checked };
                            setEditingPerson({ ...editingPerson, availabilitySchedule: updated });
                          }}
                        />
                        <Label className="font-medium">{schedule.day}</Label>
                      </div>
                      {schedule.enabled && (
                        <>
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => {
                              const updated = [...(editingPerson.availabilitySchedule || DEFAULT_SCHEDULE)];
                              updated[index] = { ...updated[index], startTime: e.target.value };
                              setEditingPerson({ ...editingPerson, availabilitySchedule: updated });
                            }}
                            className="w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => {
                              const updated = [...(editingPerson.availabilitySchedule || DEFAULT_SCHEDULE)];
                              updated[index] = { ...updated[index], endTime: e.target.value };
                              setEditingPerson({ ...editingPerson, availabilitySchedule: updated });
                            }}
                            className="w-32"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">Manage module access permissions</p>
                  {(editingPerson.permissions || DEFAULT_PERMISSIONS).map((perm, index) => (
                    <div key={perm.module} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={16} className="text-indigo-600" />
                        <span className="font-medium">{perm.module}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 ml-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={perm.canView}
                            onCheckedChange={(checked) => {
                              const updated = [...(editingPerson.permissions || DEFAULT_PERMISSIONS)];
                              updated[index] = { ...updated[index], canView: checked };
                              setEditingPerson({ ...editingPerson, permissions: updated });
                            }}
                          />
                          <Label className="text-sm">View</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={perm.canCreate}
                            onCheckedChange={(checked) => {
                              const updated = [...(editingPerson.permissions || DEFAULT_PERMISSIONS)];
                              updated[index] = { ...updated[index], canCreate: checked };
                              setEditingPerson({ ...editingPerson, permissions: updated });
                            }}
                          />
                          <Label className="text-sm">Create</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={perm.canEdit}
                            onCheckedChange={(checked) => {
                              const updated = [...(editingPerson.permissions || DEFAULT_PERMISSIONS)];
                              updated[index] = { ...updated[index], canEdit: checked };
                              setEditingPerson({ ...editingPerson, permissions: updated });
                            }}
                          />
                          <Label className="text-sm">Edit</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={perm.canDelete}
                            onCheckedChange={(checked) => {
                              const updated = [...(editingPerson.permissions || DEFAULT_PERMISSIONS)];
                              updated[index] = { ...updated[index], canDelete: checked };
                              setEditingPerson({ ...editingPerson, permissions: updated });
                            }}
                          />
                          <Label className="text-sm">Delete</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPerson}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      {viewingPerson && (
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Team Member Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {viewingPerson.profilePicture ? (
                  <img src={viewingPerson.profilePicture} alt={viewingPerson.name} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {viewingPerson.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{viewingPerson.name}</h3>
                  <p className="text-gray-600">{viewingPerson.email}</p>
                  <Badge className="mt-2">{viewingPerson.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
                  <p className="text-2xl font-bold">{viewingPerson.totalBookings || 0}</p>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <Award className="mx-auto mb-2 text-yellow-600" size={24} />
                  <p className="text-2xl font-bold">{(viewingPerson.averageRating || 0).toFixed(1)} ⭐</p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <Users className="mx-auto mb-2 text-green-600" size={24} />
                  <p className="text-2xl font-bold">{viewingPerson.status}</p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>

              {viewingPerson.bookingLink && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-medium mb-2 block">Booking Link</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                      {window.location.origin}{viewingPerson.bookingLink}
                    </code>
                    <Button size="sm" onClick={() => handleCopyBookingLink(viewingPerson.bookingLink!)}>
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
              )}

              {viewingPerson.notes && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Notes</Label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{viewingPerson.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
