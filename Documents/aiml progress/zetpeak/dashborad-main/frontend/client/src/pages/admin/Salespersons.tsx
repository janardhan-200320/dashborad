import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Users, Edit, Trash2, Mail, Phone, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Salesperson {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Super Admin' | 'Admin' | 'Staff' | 'Manager';
  workspace: string;
  status: 'Active' | 'Inactive';
  availability?: string;
  workload?: string;
}

export default function Salespersons() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Salesperson | null>(null);
  
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
    workload: 'Low'
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
    const person: Salesperson = {
      id: Date.now().toString(),
      ...newPerson
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
      workload: 'Low'
    });
    toast({
      title: "Success",
      description: "Salesperson added successfully",
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
      description: "Salesperson updated successfully",
    });
  };

  const handleDeletePerson = (id: string) => {
    const updated = salespersons.filter(p => p.id !== id);
    saveToLocalStorage(updated);
    toast({
      title: "Success",
      description: "Salesperson removed",
    });
  };

  const handleToggleStatus = (id: string) => {
    const updated = salespersons.map(p => 
      p.id === id ? { ...p, status: (p.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : p
    );
    saveToLocalStorage(updated);
    toast({
      title: "Success",
      description: "Status updated",
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
          <h1 className="text-2xl font-semibold text-gray-900">Salespersons</h1>
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
            Add Salesperson
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TEAM MEMBER
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
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{person.name}</div>
                      <div className="text-xs text-gray-500">{person.workload || 'Medium'} workload</div>
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
                    <div className={`w-2 h-2 rounded-full ${person.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-900">{person.status}</span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingPerson(person);
                        setEditModalOpen(true);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Salesperson</DialogTitle>
            <DialogDescription>Add a new team member to your organization</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
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
              <Label>Workspace</Label>
              <Input
                value={newPerson.workspace}
                onChange={(e) => setNewPerson({ ...newPerson, workspace: e.target.value })}
                placeholder="bharath"
              />
            </div>
            <div>
              <Label>Availability</Label>
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
            <div>
              <Label>Workload</Label>
              <Select value={newPerson.workload} onValueChange={(value: any) => setNewPerson({ ...newPerson, workload: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPerson} disabled={!newPerson.name || !newPerson.email}>
              Add Salesperson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Salesperson</DialogTitle>
            <DialogDescription>Update team member information</DialogDescription>
          </DialogHeader>
          {editingPerson && (
            <div className="grid grid-cols-2 gap-4 py-4">
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
                <Label>Workspace</Label>
                <Input
                  value={editingPerson.workspace}
                  onChange={(e) => setEditingPerson({ ...editingPerson, workspace: e.target.value })}
                />
              </div>
              <div>
                <Label>Availability</Label>
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
              <div>
                <Label>Workload</Label>
                <Select value={editingPerson.workload} onValueChange={(value: any) => setEditingPerson({ ...editingPerson, workload: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPerson}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
