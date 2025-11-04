import { useState, useEffect, useMemo, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Zap, Search, MoreVertical, Play, Pause, Trash2, Share2, Copy, ExternalLink, Users, UserCheck, UsersRound, Camera, Info, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  lastRun?: string;
  runsCount: number;
  // Additional booking details
  description?: string;
  duration?: { hours: string; minutes: string };
  price?: string;
  priceAmount?: string;
  meetingMode?: string;
  bookingType?: string;
  scheduleType?: string;
  assignedSalespersons?: string[];
}

interface Salesperson {
  id: string;
  name: string;
  email?: string;
  avatar: string;
}

type BookingType = 'one-on-one' | 'group' | 'collective' | null;
type ScheduleType = 'one-time' | 'recurring' | null;

export default function WorkflowsPage() {
  const { selectedWorkspace } = useWorkspace();
  const [company, setCompany] = useState<any>(null);
  const { toast } = useToast();

  // Compute workspace-scoped storage key
  const salesCallsStorageKey = useMemo(() => {
    return selectedWorkspace ? `zervos_sales_calls::${selectedWorkspace.id}` : null;
  }, [selectedWorkspace]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('zervos_company');
      if (raw) setCompany(JSON.parse(raw));
    } catch {}
  }, []);

  // Load saved sales calls when workspace changes
  useEffect(() => {
    if (!salesCallsStorageKey) {
      // No workspace selected, clear in-memory list to avoid cross-leakage
      setWorkflows([]);
      return;
    }
    try {
      const savedCalls = localStorage.getItem(salesCallsStorageKey);
      if (savedCalls) {
        setWorkflows(JSON.parse(savedCalls));
      } else {
        // Keep defaults if no saved data for this workspace
        setWorkflows(defaultWorkflowsRef.current);
      }
    } catch {}
  }, [salesCallsStorageKey]);

  // Get dynamic label
  const eventTypeLabel = company?.eventTypeLabel || 'Sales Calls';
  const eventTypeSingular = eventTypeLabel.endsWith('s') ? eventTypeLabel.slice(0, -1) : eventTypeLabel;
  const teamMemberLabel = company?.teamMemberLabel || 'Salespersons';

  // Default examples (used when a workspace has no saved data yet)
  const defaultWorkflowsRef = useRef<Workflow[]>([
    {
      id: '1',
      name: 'Send Reminder 1 Day Before',
      trigger: '1 day before appointment',
      action: 'Send Email Reminder',
      isActive: true,
      lastRun: '2 hours ago',
      runsCount: 45
    },
    {
      id: '2',
      name: 'Welcome New Booking',
      trigger: 'After booking created',
      action: 'Send WhatsApp Message',
      isActive: true,
      lastRun: '5 mins ago',
      runsCount: 128
    },
    {
      id: '3',
      name: 'Follow-up Completed Appointment',
      trigger: 'After appointment completed',
      action: 'Send Feedback Form',
      isActive: false,
      lastRun: '1 day ago',
      runsCount: 32
    },
  ]);

  const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflowsRef.current);

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewWorkflowOpen, setIsNewWorkflowOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [bookingType, setBookingType] = useState<BookingType>(null);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(null);
  const [searchSalespersons, setSearchSalespersons] = useState('');
  const [selectedSalespersons, setSelectedSalespersons] = useState<string[]>([]);
  
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    duration: { hours: '0', minutes: '30' },
    price: 'free',
    priceAmount: '0',
    meetingMode: '',
    description: '',
    repeatFrequency: 'daily',
    repeatEvery: '1',
    repeatUnit: 'Day(s)',
    numberOfRecurrences: '1',
  });

  // Load salespersons from localStorage
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);

  // Load team members/salespersons on mount
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem('zervos_team_members');
      if (savedMembers) {
        const members = JSON.parse(savedMembers);
        const formatted = members.map((member: any) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          avatar: member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        }));
        setSalespersons(formatted);
      } else {
        // Default salespersons
        setSalespersons([
          {
            id: '1',
            name: 'Bharath Reddy',
            email: 'bharathreddyn6@gmail.com',
            avatar: 'BR'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@company.com',
            avatar: 'SJ'
          },
          {
            id: '3',
            name: 'Mike Williams',
            email: 'mike@company.com',
            avatar: 'MW'
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  }, []);

  const filteredWorkflows = workflows.filter(wf =>
    wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wf.trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSalespersons = salespersons.filter(sp =>
    sp.name.toLowerCase().includes(searchSalespersons.toLowerCase())
  );

  const persistWorkflows = (items: Workflow[]) => {
    setWorkflows(items);
    if (salesCallsStorageKey) {
      try {
        localStorage.setItem(salesCallsStorageKey, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  };

  const handleCreateWorkflow = () => {
    if (!selectedWorkspace || !salesCallsStorageKey) {
      toast({ title: 'Select a workspace', description: 'Please select a workspace from My Space to create sessions.' });
      return;
    }
    const newWf: Workflow = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      trigger: bookingType || 'one-on-one',
      action: `${newWorkflow.duration.hours}h ${newWorkflow.duration.minutes}m`,
      isActive: true,
      runsCount: 0,
      description: newWorkflow.description || `Ideal for ${bookingType === 'one-on-one' ? 'one-to-one meetings' : bookingType === 'group' ? 'workshops and classes' : 'panel meetings'}`,
      duration: newWorkflow.duration,
      price: newWorkflow.price,
      priceAmount: newWorkflow.priceAmount,
      meetingMode: newWorkflow.meetingMode,
      bookingType: bookingType || 'one-on-one',
      scheduleType: scheduleType || 'one-time',
      assignedSalespersons: selectedSalespersons,
    };
    
    const updatedWorkflows = [...workflows, newWf];
    persistWorkflows(updatedWorkflows);
    
    handleCloseModal();
    toast({
      title: 'Success!',
      description: `${eventTypeSingular} created successfully`,
    });
  };

  const handleCloseModal = () => {
    setIsNewWorkflowOpen(false);
    setCreateStep(1);
    setBookingType(null);
    setScheduleType(null);
    setSelectedSalespersons([]);
    setSearchSalespersons('');
    setNewWorkflow({
      name: '',
      duration: { hours: '0', minutes: '30' },
      price: 'free',
      priceAmount: '0',
      meetingMode: '',
      description: '',
      repeatFrequency: 'daily',
      repeatEvery: '1',
      repeatUnit: 'Day(s)',
      numberOfRecurrences: '1',
    });
  };

  const handleSelectBookingType = (type: BookingType) => {
    setBookingType(type);
  };

  const handleSelectScheduleType = (type: ScheduleType) => {
    setScheduleType(type);
    setCreateStep(2);
  };

  const handleNextToAssign = () => {
    if (newWorkflow.name) {
      setCreateStep(3);
    }
  };

  const handleToggleSalesperson = (id: string) => {
    setSelectedSalespersons(prev =>
      prev.includes(id) ? prev.filter(spId => spId !== id) : [...prev, id]
    );
  };

  const handleSelectAllSalespersons = () => {
    if (selectedSalespersons.length === salespersons.length) {
      setSelectedSalespersons([]);
    } else {
      setSelectedSalespersons(salespersons.map(sp => sp.id));
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = workflows.map(wf =>
      wf.id === id ? { ...wf, isActive: !wf.isActive } : wf
    );
    persistWorkflows(updated);
  };

  const handleDeleteWorkflow = (id: string) => {
    const updated = workflows.filter(wf => wf.id !== id);
    persistWorkflows(updated);
  };

  const handleShareBookingLink = (workflowId: string, workflowName: string) => {
    const bookingUrl = `${window.location.origin}/book/${workflowId}`;
    navigator.clipboard.writeText(bookingUrl);
    toast({
      title: "Link Copied!",
      description: `Booking link for "${workflowName}" copied to clipboard`,
    });
  };

  const handleOpenBookingPage = (workflowId: string) => {
    window.open(`/book/${workflowId}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Workspace guard */}
        {!selectedWorkspace && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            Please select a workspace from the "My Space" dropdown to manage your {eventTypeLabel.toLowerCase()}.
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="text-yellow-500" size={28} />
              {eventTypeLabel}
            </h1>
            <p className="text-gray-600 mt-1">Manage your {eventTypeLabel.toLowerCase()} and automation</p>
          </div>
          <Button onClick={() => setIsNewWorkflowOpen(true)} className="gap-2" disabled={!selectedWorkspace}>
            <Plus size={18} />
            New {eventTypeSingular}
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder={`Search ${eventTypeLabel.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Workflows List */}
        {filteredWorkflows.length > 0 ? (
          <div className="grid gap-4">
            {filteredWorkflows.map((wf) => (
              <div key={wf.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${wf.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Zap className={wf.isActive ? 'text-green-600' : 'text-gray-400'} size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{wf.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          wf.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {wf.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Trigger:</span> {wf.trigger}</p>
                        <p><span className="font-medium">Action:</span> {wf.action}</p>
                      </div>
                      <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        {wf.lastRun && <span>Last run: {wf.lastRun}</span>}
                        <span>Total runs: {wf.runsCount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareBookingLink(wf.id, wf.name)}
                      className="gap-2"
                    >
                      <Share2 size={16} />
                      Share
                    </Button>
                    <Switch
                      checked={wf.isActive}
                      onCheckedChange={() => handleToggleActive(wf.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenBookingPage(wf.id)}>
                          <ExternalLink size={16} className="mr-2" />
                          Open Booking Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareBookingLink(wf.id, wf.name)}>
                          <Copy size={16} className="mr-2" />
                          Copy Booking Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(wf.id)}>
                          {wf.isActive ? (
                            <><Pause size={16} className="mr-2" />Pause</>
                          ) : (
                            <><Play size={16} className="mr-2" />Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteWorkflow(wf.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Zap size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {eventTypeLabel.toLowerCase()} found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : `Create your first ${eventTypeSingular.toLowerCase()} to get started`}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsNewWorkflowOpen(true)} className="gap-2">
                <Plus size={18} />
                Create {eventTypeSingular}
              </Button>
            )}
          </div>
        )}

        {/* New Sales Call Modal - Multi-Step */}
  <Dialog open={isNewWorkflowOpen && !!selectedWorkspace} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>

            {/* STEP 1: Choose Booking Type */}
            {createStep === 1 && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl">Create New {eventTypeSingular}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  {/* One-on-One */}
                  <div 
                    className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-purple-300 ${
                      bookingType === 'one-on-one' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelectBookingType('one-on-one')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-purple-100 rounded-lg">
                        <UserCheck size={32} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">One-on-One</h3>
                          <Info size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Ideal for support calls, client meetings, and any one-to-one meetings
                        </p>
                        {bookingType === 'one-on-one' && (
                          <div className="flex gap-2">
                            <Button
                              variant={scheduleType === 'one-time' ? 'default' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectScheduleType('one-time');
                              }}
                            >
                              One Time
                            </Button>
                            <Button
                              variant={scheduleType === 'recurring' ? 'default' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectScheduleType('recurring');
                              }}
                            >
                              Recurring
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Group Booking */}
                  <div 
                    className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-purple-300 ${
                      bookingType === 'group' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelectBookingType('group')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-purple-100 rounded-lg">
                        <Users size={32} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">Group Booking</h3>
                          <Info size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Ideal for workshops, webinars, and classes
                        </p>
                        {bookingType === 'group' && (
                          <div className="flex gap-2">
                            <Button
                              variant={scheduleType === 'one-time' ? 'default' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectScheduleType('one-time');
                              }}
                            >
                              One Time
                            </Button>
                            <Button
                              variant={scheduleType === 'recurring' ? 'default' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectScheduleType('recurring');
                              }}
                            >
                              Recurring
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collective Booking */}
                  <div 
                    className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-purple-300 ${
                      bookingType === 'collective' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      handleSelectBookingType('collective');
                      handleSelectScheduleType('one-time'); // Auto select one-time for collective
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-purple-100 rounded-lg">
                        <UsersRound size={32} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">Collective Booking</h3>
                          <Info size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Ideal for panel interviews, board meetings, and any many-to-one meetings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Sales Call Details */}
            {createStep === 2 && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Camera size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">{newWorkflow.name || 'testing'}</h3>
                      <p className="text-sm text-gray-600">
                        {bookingType === 'one-on-one' ? 'One-on-One' : bookingType === 'group' ? 'Group Booking' : 'Collective Booking'}
                      </p>
                    </div>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4">
                    <DialogTitle className="text-lg">SALES CALL DETAILS</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="salesCallName">
                      {eventTypeSingular} Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="salesCallName"
                      placeholder="testing"
                      value={newWorkflow.name}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Select 
                        value={newWorkflow.duration.hours} 
                        onValueChange={(val) => setNewWorkflow({ ...newWorkflow, duration: { ...newWorkflow.duration, hours: val } })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                            <SelectItem key={h} value={h.toString()}>{h} Hours</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={newWorkflow.duration.minutes} 
                        onValueChange={(val) => setNewWorkflow({ ...newWorkflow, duration: { ...newWorkflow.duration, minutes: val } })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['0', '15', '30', '45'].map(m => (
                            <SelectItem key={m} value={m}>{m} Minutes</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Price</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={newWorkflow.price === 'free' ? 'default' : 'outline'}
                        onClick={() => setNewWorkflow({ ...newWorkflow, price: 'free', priceAmount: '0' })}
                        className="flex-1"
                      >
                        Free
                      </Button>
                      <Button
                        type="button"
                        variant={newWorkflow.price === 'paid' ? 'default' : 'outline'}
                        onClick={() => setNewWorkflow({ ...newWorkflow, price: 'paid' })}
                        className="flex-1"
                      >
                        Paid
                      </Button>
                    </div>
                    {newWorkflow.price === 'paid' && (
                      <div className="flex gap-2 mt-2">
                        <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                          <span className="text-gray-600">₹</span>
                        </div>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newWorkflow.priceAmount}
                          onChange={(e) => setNewWorkflow({ ...newWorkflow, priceAmount: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meetingMode">Meeting Mode</Label>
                    <Select 
                      value={newWorkflow.meetingMode} 
                      onValueChange={(val) => setNewWorkflow({ ...newWorkflow, meetingMode: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Conference</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="in-person">In Person</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recurring Information Section */}
                  {scheduleType === 'recurring' && (
                    <>
                      <div className="border-l-4 border-purple-600 pl-4 mt-6">
                        <h3 className="text-lg font-semibold text-gray-700">RECURRING INFORMATION</h3>
                      </div>

                      <div className="space-y-2">
                        <Label>Repeat frequency</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant={newWorkflow.repeatFrequency === 'daily' ? 'default' : 'outline'}
                            onClick={() => setNewWorkflow({ ...newWorkflow, repeatFrequency: 'daily', repeatUnit: 'Day(s)' })}
                            className="w-full"
                          >
                            Daily
                          </Button>
                          <Button
                            type="button"
                            variant={newWorkflow.repeatFrequency === 'weekly' ? 'default' : 'outline'}
                            onClick={() => setNewWorkflow({ ...newWorkflow, repeatFrequency: 'weekly', repeatUnit: 'Week(s)' })}
                            className="w-full"
                          >
                            Weekly
                          </Button>
                          <Button
                            type="button"
                            variant={newWorkflow.repeatFrequency === 'monthly' ? 'default' : 'outline'}
                            onClick={() => setNewWorkflow({ ...newWorkflow, repeatFrequency: 'monthly', repeatUnit: 'Month(s)' })}
                            className="w-full"
                          >
                            Monthly
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Repeat Every</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Select 
                            value={newWorkflow.repeatEvery} 
                            onValueChange={(val) => setNewWorkflow({ ...newWorkflow, repeatEvery: val })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center px-3 py-2 border rounded-md bg-gray-50">
                            <span className="text-gray-700">{newWorkflow.repeatUnit}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>No. of Recurrences</Label>
                        <Select 
                          value={newWorkflow.numberOfRecurrences} 
                          onValueChange={(val) => setNewWorkflow({ ...newWorkflow, numberOfRecurrences: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setCreateStep(1)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextToAssign}
                    disabled={!newWorkflow.name}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Next
                  </Button>
                </DialogFooter>
              </>
            )}

            {/* STEP 3: Assign Salespersons */}
            {createStep === 3 && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Camera size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">{newWorkflow.name}</h3>
                      <p className="text-sm text-gray-600">
                        {bookingType === 'one-on-one' ? 'One-on-One' : bookingType === 'group' ? 'Group Booking' : 'Collective Booking'}
                      </p>
                    </div>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4">
                    <DialogTitle className="text-lg">ASSIGN {teamMemberLabel.toUpperCase()}</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="text"
                        placeholder={`Search ${teamMemberLabel}`}
                        value={searchSalespersons}
                        onChange={(e) => setSearchSalespersons(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllSalespersons}
                    >
                      <Checkbox
                        checked={selectedSalespersons.length === salespersons.length}
                        className="mr-2"
                      />
                      Select All
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredSalespersons.map((sp) => (
                      <div
                        key={sp.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => handleToggleSalesperson(sp.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {sp.avatar}
                          </div>
                          <span className="font-medium text-gray-900">{sp.name}</span>
                        </div>
                        <Checkbox checked={selectedSalespersons.includes(sp.id)} />
                      </div>
                    ))}
                  </div>

                  {selectedSalespersons.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        {teamMemberLabel} Assigned: <span className="font-semibold">{selectedSalespersons.length}</span>
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setCreateStep(2)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreateWorkflow}
                    disabled={selectedSalespersons.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Create {eventTypeSingular}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
