import { useEffect, useMemo, useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Calendar, ClipboardList, Share2, ExternalLink, Edit as EditIcon } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type TeamPermission = { module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean };
type TeamRole = 'Super Admin' | 'Admin' | 'Manager' | 'Staff';

const ROLE_PERMISSION_TEMPLATES: Record<TeamRole, TeamPermission[]> = {
  'Super Admin': [
    { module: 'Appointments', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'Sales Calls', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'Booking Pages', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'Availability', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'Team', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'Settings', canView: true, canCreate: true, canEdit: true, canDelete: true },
  ],
  'Admin': [
    { module: 'Appointments', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'Sales Calls', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Booking Pages', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Availability', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Team', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Settings', canView: true, canCreate: true, canEdit: true, canDelete: false },
  ],
  'Manager': [
    { module: 'Appointments', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Sales Calls', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Booking Pages', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Availability', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Team', canView: true, canCreate: false, canEdit: true, canDelete: false },
    { module: 'Settings', canView: false, canCreate: false, canEdit: false, canDelete: false },
  ],
  'Staff': [
    { module: 'Appointments', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'Sales Calls', canView: true, canCreate: false, canEdit: false, canDelete: false },
    { module: 'Booking Pages', canView: true, canCreate: false, canEdit: false, canDelete: false },
    { module: 'Availability', canView: true, canCreate: false, canEdit: false, canDelete: false },
    { module: 'Team', canView: false, canCreate: false, canEdit: false, canDelete: false },
    { module: 'Settings', canView: false, canCreate: false, canEdit: false, canDelete: false },
  ],
};

const clonePermissions = (perms: TeamPermission[]): TeamPermission[] => perms.map((perm) => ({ ...perm }));

const getRolePermissionTemplate = (role: TeamRole): TeamPermission[] =>
  clonePermissions(ROLE_PERMISSION_TEMPLATES[role] || ROLE_PERMISSION_TEMPLATES['Staff']);

const mergePermissionsWithRole = (role: TeamRole, existing?: TeamPermission[]): TeamPermission[] => {
  const template = getRolePermissionTemplate(role);
  if (!existing || existing.length === 0) return template;
  const byModule = new Map(template.map((perm) => [perm.module, perm]));
  for (const perm of existing) {
    if (!perm || !perm.module) continue;
    const current = byModule.get(perm.module);
    byModule.set(perm.module, current ? { ...current, ...perm } : { ...perm });
  }
  return Array.from(byModule.values());
};

interface Appointment {
  id: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function TeamPublicView() {
  const [, params] = useRoute('/team/public/:memberId');
  const memberId = params?.memberId || '';

  const [memberName, setMemberName] = useState('Team Member');
  const [memberRole, setMemberRole] = useState<TeamRole>('Staff');
  const [memberEmail, setMemberEmail] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<TeamPermission[]>([]);
  const [calls, setCalls] = useState<Array<{ id: string; name: string; workspace?: string }>>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [section, setSection] = useState<'appointments'|'sales-calls'|'booking-pages'|'availability'|'profile'>('appointments');
  const { workspaces } = useWorkspace();
  const [isCreateCallOpen, setIsCreateCallOpen] = useState(false);
  const [newCall, setNewCall] = useState<{ name: string; minutes: string; workspaceId: string | null }>({ name: '', minutes: '30', workspaceId: null });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<{ name: string; phone: string } | null>(null);

  // Load member basic info
  useEffect(() => {
    try {
      const raw = localStorage.getItem('zervos_salespersons');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          const m = arr.find((p: any) => p?.id === memberId || p?.email === memberId);
          if (m) {
            setMemberName(m.name || m.email || 'Team Member');
            setMemberRole((m.role as TeamRole) || 'Staff');
            setMemberEmail(m.email || null);
            // Merge role defaults so missing modules still appear
            setPermissions(mergePermissionsWithRole((m.role as TeamRole) || 'Staff', m.permissions));
          }
        }
      }
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'zervos_salespersons') {
        try {
          const raw2 = localStorage.getItem('zervos_salespersons');
          const arr2 = raw2 ? JSON.parse(raw2) : [];
          const m2 = Array.isArray(arr2) ? arr2.find((p: any) => p?.id === memberId || p?.email === memberId) : null;
          if (m2) {
            setMemberName(m2.name || m2.email || 'Team Member');
            setMemberRole((m2.role as TeamRole) || 'Staff');
            setMemberEmail(m2.email || null);
            setPermissions(mergePermissionsWithRole((m2.role as TeamRole) || 'Staff', m2.permissions));
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [memberId]);

  // Load assigned calls across all workspaces
  const loadAssignedCalls = () => {
    if (!memberId) return;
    const getKeysByPrefix = (prefix: string) => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      return keys;
    };
    const callKeys = [...getKeysByPrefix('zervos_sales_calls::'), 'zervos_sales_calls'];
    const mine: Array<{ id: string; name: string; workspace?: string }> = [];
    for (const key of callKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          for (const c of arr) {
            const assigned = Array.isArray(c?.assignedSalespersons) ? c.assignedSalespersons : [];
            const includesId = assigned.includes(memberId);
            const includesEmail = memberEmail ? assigned.includes(memberEmail) : false;
            const includesObjId = assigned.some((x: any) => x && typeof x === 'object' && (x.id === memberId || (memberEmail && x.email === memberEmail)));
            if (includesId || includesEmail || includesObjId) {
              mine.push({ id: c.id, name: c.name, workspace: key.includes('::') ? key.split('::')[1] : undefined });
            }
          }
        }
      } catch {}
    }
    setCalls(mine);
  };

  useEffect(() => {
    loadAssignedCalls();
    const onUpdated = () => loadAssignedCalls();
    const onStorage = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('zervos_sales_calls::') || e.key === 'zervos_sales_calls')) loadAssignedCalls();
    };
    window.addEventListener('sales-calls-updated', onUpdated as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('sales-calls-updated', onUpdated as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, [memberId, memberEmail]);

  // Load member appointments
  useEffect(() => {
    if (!memberId) return;
    fetch(`/api/appointments?assignedMemberId=${encodeURIComponent(memberId)}`)
      .then(res => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setAppointments(data);
      })
      .catch(() => setAppointments([]));
  }, [memberId]);

  const filteredCalls = useMemo(() =>
    calls.filter(c => c.name.toLowerCase().includes(searchQ.toLowerCase())), [calls, searchQ]
  );

  const can = (module: string, action: 'view'|'create'|'edit'|'delete') => {
    const perm = permissions.find(p => p.module === module);
    if (!perm) return false;
    if (action === 'view') return !!perm.canView;
    if (action === 'create') return !!perm.canCreate;
    if (action === 'edit') return !!perm.canEdit;
    if (action === 'delete') return !!perm.canDelete;
    return false;
  };

  const handleCreateCall = () => {
    try {
      const wsId = newCall.workspaceId || (workspaces[0]?.id || null);
      if (!wsId) return;
      const key = `zervos_sales_calls::${wsId}`;
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const id = Date.now().toString();
      const wf = {
        id,
        name: newCall.name || 'Untitled Call',
        trigger: 'one-on-one',
        action: `0h ${parseInt(newCall.minutes || '30', 10)}m`,
        isActive: true,
        runsCount: 0,
        description: '',
        duration: { hours: '0', minutes: newCall.minutes || '30' },
        price: 'free',
        priceAmount: '0',
        meetingMode: '',
        bookingType: 'one-on-one',
        scheduleType: 'one-time',
        assignedSalespersons: [memberId].filter(Boolean),
      };
      const updated = Array.isArray(arr) ? [...arr, wf] : [wf];
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sales-calls-updated', { detail: { workspaceId: wsId } }));
      // Update current list in view
      loadAssignedCalls();
      setIsCreateCallOpen(false);
      setNewCall({ name: '', minutes: '30', workspaceId: wsId });
    } catch {}
  };

  // Sidebar-like layout to mimic dashboard UI
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 border-r bg-white p-4 space-y-2 hidden md:block">
          <div className="px-2 py-2 text-xs font-medium text-gray-500">Bookings</div>
          <nav className="space-y-1">
            {(!permissions.length || can('Appointments','view')) && (
              <button className={`w-full text-left px-3 py-2 rounded-md ${section==='appointments'?'bg-purple-50 text-purple-700':'hover:bg-gray-50'}`} onClick={()=>setSection('appointments')}>Appointments</button>
            )}
            {(!permissions.length || can('Sales Calls','view')) && (
              <button className={`w-full text-left px-3 py-2 rounded-md ${section==='sales-calls'?'bg-purple-50 text-purple-700':'hover:bg-gray-50'}`} onClick={()=>setSection('sales-calls')}>Sales Calls</button>
            )}
            {(!permissions.length || can('Booking Pages','view')) && (
              <button className={`w-full text-left px-3 py-2 rounded-md ${section==='booking-pages'?'bg-purple-50 text-purple-700':'hover:bg-gray-50'}`} onClick={()=>setSection('booking-pages')}>Booking Pages</button>
            )}
            {(!permissions.length || can('Availability','view')) && (
              <button className={`w-full text-left px-3 py-2 rounded-md ${section==='availability'?'bg-purple-50 text-purple-700':'hover:bg-gray-50'}`} onClick={()=>setSection('availability')}>Availability</button>
            )}
            <button className={`w-full text-left px-3 py-2 rounded-md ${section==='profile'?'bg-purple-50 text-purple-700':'hover:bg-gray-50'}`} onClick={()=>setSection('profile')}>My Profile</button>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{memberName}</h1>
                <p className="text-gray-600 text-sm">Role: {memberRole}</p>
              </div>
            </div>

            {/* Appointments Section */}
            {section === 'appointments' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Tabs defaultValue="upcoming">
                    <TabsList>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="past">Past</TabsTrigger>
                      <TabsTrigger value="custom">Custom Date</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {can('Appointments','create') && (
                    <Button className="bg-indigo-600 hover:bg-indigo-700">New Appointment</Button>
                  )}
                </div>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    {appointments.length === 0 ? (
                      <div className="text-center text-gray-500 py-16">No upcoming appointments</div>
                    ) : (
                      <div className="space-y-2">
                        {appointments.map(a => (
                          <div key={a.id} className="p-3 border rounded-md flex items-center justify-between">
                            <div>
                              <div className="font-medium">{a.customerName}</div>
                              <div className="text-xs text-gray-500">{a.date} • {a.time}</div>
                            </div>
                            <div className="text-sm text-gray-700">{a.serviceName}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sales Calls Section */}
            {section === 'sales-calls' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Search Calls</div>
                  <div className="w-64"><Input value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} placeholder="Search calls" /></div>
                </div>
                {can('Sales Calls','create') && (
                  <div className="flex justify-end">
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={()=>{
                      if (!newCall.workspaceId && workspaces.length>0) setNewCall(prev=>({ ...prev, workspaceId: workspaces[0].id }));
                      setIsCreateCallOpen(true);
                    }}>New Call</Button>
                  </div>
                )}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {filteredCalls.length === 0 ? (
                      <div className="text-sm text-gray-500">No calls assigned</div>
                    ) : (
                      <div className="space-y-2">
                        {filteredCalls.map(c => (
                          <div key={c.id} className="p-3 border rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{c.name}</div>
                                {c.workspace && <div className="text-xs text-gray-500">Workspace: {c.workspace}</div>}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={()=>window.open(`/book/${c.id}`,'_blank')} className="gap-1"><ExternalLink size={14}/>Open Booking Page</Button>
                                <Button variant="outline" size="sm" onClick={()=>{navigator.clipboard.writeText(window.location.origin+`/book/${c.id}`)}} className="gap-1"><Share2 size={14}/>Copy Link</Button>
                                {can('Sales Calls','edit') && (
                                  <Button variant="outline" size="sm" onClick={()=>{window.location.href='/dashboard/callbacks'}} className="gap-1"><EditIcon size={14}/>Edit in Dashboard</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Booking Pages Section */}
            {section === 'booking-pages' && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="text-sm text-gray-600">Your booking page links for assigned calls</div>
                  {filteredCalls.length === 0 ? (
                    <div className="text-sm text-gray-500">No calls assigned</div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCalls.map(c => (
                        <div key={c.id} className="p-3 border rounded-md flex items-center justify-between">
                          <div className="text-sm font-medium">/book/{c.id}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={()=>window.open(`/book/${c.id}`,'_blank')}>Open</Button>
                            <Button variant="outline" size="sm" onClick={()=>navigator.clipboard.writeText(window.location.origin+`/book/${c.id}`)}>Copy</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Availability Section */}
            {section === 'availability' && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="text-sm text-gray-600">Weekly availability (read-only)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                      <div key={day} className="p-3 border rounded-md flex items-center justify-between">
                        <div className="font-medium">{day}</div>
                        {/* We don't load the per-day times here to keep it simple; can be added by reading availabilitySchedule */}
                        <div className="text-xs text-gray-500">See Admin Center for details</div>
                      </div>
                    ))}
                  </div>
                  {can('Availability','edit') && (
                    <Button variant="outline" onClick={()=>window.location.href='/dashboard/admin-center'}>Edit Availability in Admin Center</Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profile Section */}
            {section === 'profile' && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Name</Label>
                      <div className="text-sm font-medium">{memberName}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Role</Label>
                      <div className="text-sm font-medium">{memberRole}</div>
                    </div>
                  </div>
                  {(can('Team','edit') || can('Settings','edit')) && (
                    <div className="pt-2">
                      <Button variant="outline" onClick={()=>{
                        setEditProfile({ name: memberName, phone: '' });
                        setIsEditProfileOpen(true);
                      }}>Edit Profile</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      {/* Create Call Dialog */}
      <Dialog open={isCreateCallOpen} onOpenChange={setIsCreateCallOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Sales Call</DialogTitle>
            <DialogDescription>Create a call and assign it to yourself</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input value={newCall.name} onChange={(e)=>setNewCall({ ...newCall, name: e.target.value })} placeholder="Discovery Call" />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={newCall.minutes} onChange={(e)=>setNewCall({ ...newCall, minutes: e.target.value })} />
            </div>
            <div>
              <Label>Workspace</Label>
              <select value={newCall.workspaceId || ''} onChange={(e)=>setNewCall({ ...newCall, workspaceId: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                <option value="" disabled>Select workspace</option>
                {workspaces.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setIsCreateCallOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCall} disabled={!newCall.workspaceId || !newCall.name.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your display name and phone</DialogDescription>
          </DialogHeader>
          {editProfile && (
            <div className="space-y-4 py-2">
              <div>
                <Label>Name</Label>
                <Input value={editProfile.name} onChange={(e)=>setEditProfile({ ...editProfile, name: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={editProfile.phone} onChange={(e)=>setEditProfile({ ...editProfile, phone: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={()=>setIsEditProfileOpen(false)}>Cancel</Button>
            <Button onClick={()=>{
              try {
                if (!editProfile) return;
                // Update admin unified store
                const raw = localStorage.getItem('zervos_salespersons');
                const arr = raw ? JSON.parse(raw) : [];
                const updated = Array.isArray(arr) ? arr.map((p:any)=>{
                  if (p?.id === memberId || p?.email === memberId) {
                    return { ...p, name: editProfile.name, phone: editProfile.phone };
                  }
                  return p;
                }) : arr;
                localStorage.setItem('zervos_salespersons', JSON.stringify(updated));
                // Update team members (global)
                const rawTM = localStorage.getItem('zervos_team_members');
                if (rawTM) {
                  try {
                    const arrTM = JSON.parse(rawTM);
                    const updTM = Array.isArray(arrTM) ? arrTM.map((m:any)=> (m?.id===memberId || m?.email===memberId) ? { ...m, name: editProfile.name, phone: editProfile.phone } : m) : arrTM;
                    localStorage.setItem('zervos_team_members', JSON.stringify(updTM));
                  } catch {}
                }
                // Update workspace-scoped team members
                for (let i=0;i<localStorage.length;i++){
                  const k = localStorage.key(i);
                  if (k && k.startsWith('zervos_team_members::')){
                    try {
                      const rawW = localStorage.getItem(k);
                      const arrW = rawW ? JSON.parse(rawW) : [];
                      const updW = Array.isArray(arrW) ? arrW.map((m:any)=> (m?.id===memberId || m?.email===memberId) ? { ...m, name: editProfile.name, phone: editProfile.phone } : m) : arrW;
                      localStorage.setItem(k, JSON.stringify(updW));
                    } catch {}
                  }
                }
                window.dispatchEvent(new CustomEvent('team-members-updated'));
                setMemberName(editProfile.name);
                setIsEditProfileOpen(false);
              } catch {}
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
