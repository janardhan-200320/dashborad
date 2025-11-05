import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Mail, Phone, Calendar, MoreVertical, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  appointmentsCount: number;
  availability: string;
}

export default function TeamMembersPage() {
  const [company, setCompany] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    emails: '',
    role: 'Staff',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('zervos_company');
      if (raw) setCompany(JSON.parse(raw));
      
      // Load team members from localStorage
      const savedMembers = localStorage.getItem('zervos_team_members');
      if (savedMembers) {
        setTeamMembers(JSON.parse(savedMembers));
      } else {
        // Set default members if none exist
        const defaultMembers = [
          {
            id: '1',
            name: 'Sarah Johnson',
            role: 'Senior Recruiter',
            email: 'sarah@company.com',
            phone: '+1 234 567 8900',
            appointmentsCount: 45,
            availability: 'Mon-Fri, 9 AM - 5 PM'
          },
          {
            id: '2',
            name: 'Mike Williams',
            role: 'HR Manager',
            email: 'mike@company.com',
            phone: '+1 234 567 8901',
            appointmentsCount: 32,
            availability: 'Mon-Fri, 10 AM - 6 PM'
          },
          {
            id: '3',
            name: 'Emily Davis',
            role: 'Talent Acquisition',
            email: 'emily@company.com',
            phone: '+1 234 567 8902',
            appointmentsCount: 28,
            availability: 'Tue-Sat, 9 AM - 5 PM'
          },
        ];
        setTeamMembers(defaultMembers);
        localStorage.setItem('zervos_team_members', JSON.stringify(defaultMembers));
      }
    } catch {}
  }, []);

  const handleCreateMember = () => {
    // Parse multiple emails
    const emailList = newMember.emails
      .split(/[\s,]+/)
      .filter(email => email.trim() !== '');
    
    const newMembers = emailList.map(email => ({
      id: `${Date.now()}-${Math.random()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: newMember.role,
      email: email.trim(),
      phone: '',
      appointmentsCount: 0,
      availability: 'Mon-Fri, 9 AM - 5 PM'
    }));

    const updatedMembers = [...teamMembers, ...newMembers];
    setTeamMembers(updatedMembers);
    
    // Save to localStorage
    localStorage.setItem('zervos_team_members', JSON.stringify(updatedMembers));
    
    setIsNewMemberOpen(false);
    setNewMember({
      emails: '',
      role: 'Staff',
    });
  };

  const teamMemberLabel = company?.teamMemberLabel || 'Team Members';
  const teamMemberSingular = teamMemberLabel.endsWith('s') ? teamMemberLabel.slice(0, -1) : teamMemberLabel;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-purple-600" size={28} />
              {teamMemberLabel}
            </h1>
            <p className="text-gray-600 mt-1">Manage your {teamMemberLabel.toLowerCase()} and their availability</p>
          </div>
          <Button onClick={() => setIsNewMemberOpen(true)} className="gap-2">
            <UserPlus size={18} />
            Add {teamMemberSingular}
          </Button>
        </div>

        {/* Team Members Grid */}
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{member.availability}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Appointments</span>
                    <span className="text-lg font-semibold text-purple-600">{member.appointmentsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {teamMemberLabel.toLowerCase()} yet</h3>
            <p className="text-gray-600 mb-4">
              Add your first {teamMemberSingular.toLowerCase()} to start managing assignments
            </p>
            <Button onClick={() => setIsNewMemberOpen(true)} className="gap-2">
              <UserPlus size={18} />
              Add {teamMemberSingular}
            </Button>
          </div>
        )}

        {/* Invite Member Modal */}
        <Dialog open={isNewMemberOpen} onOpenChange={setIsNewMemberOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite {teamMemberLabel}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="emails">
                  Emails <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emails"
                  placeholder="Enter email addresses separated by a space or comma"
                  value={newMember.emails}
                  onChange={(e) => setNewMember({ ...newMember, emails: e.target.value })}
                  className="h-20"
                />
                <p className="text-xs text-gray-500">
                  You can invite multiple people by separating email addresses with spaces or commas
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <select
                  id="role"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsNewMemberOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMember}
                disabled={!newMember.emails.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Member Profile Modal */}
        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedMember.name}</DialogTitle>
                <DialogDescription>{selectedMember.role}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="text-sm">{selectedMember.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Phone</Label>
                    <p className="text-sm">{selectedMember.phone}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Availability</Label>
                    <p className="text-sm">{selectedMember.availability}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Total Appointments</Label>
                    <p className="text-2xl font-bold text-purple-600">{selectedMember.appointmentsCount}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedMember(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
