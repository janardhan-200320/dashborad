import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Filter, Plus, MoreVertical, Clock, User, CheckCircle, XCircle, Edit } from 'lucide-react';
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

interface Appointment {
  id: string;
  customerName: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      customerName: 'John Doe',
      service: 'Technical Interview',
      staff: 'Sarah Johnson',
      date: '2025-11-02',
      time: '10:00 AM',
      status: 'upcoming'
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      service: 'HR Screening',
      staff: 'Mike Williams',
      date: '2025-11-03',
      time: '2:00 PM',
      status: 'upcoming'
    },
    {
      id: '3',
      customerName: 'Robert Brown',
      service: 'Final Round',
      staff: 'Sarah Johnson',
      date: '2025-10-28',
      time: '11:00 AM',
      status: 'completed'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    service: '',
    staff: '',
    date: '',
    time: '',
  });
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    reason: ''
  });
  const [cancelReason, setCancelReason] = useState('');

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAppointment = () => {
    const newApt: Appointment = {
      id: Date.now().toString(),
      ...newAppointment,
      status: 'upcoming'
    };
    setAppointments([...appointments, newApt]);
    setIsNewAppointmentOpen(false);
    setNewAppointment({
      customerName: '',
      service: '',
      staff: '',
      date: '',
      time: '',
    });
  };

  const handleUpdateStatus = (id: string, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, status: newStatus } : apt
    );
    setAppointments(updated);
    localStorage.setItem('zervos_appointments', JSON.stringify(updated));
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setRescheduleData({
      date: apt.date,
      time: apt.time,
      reason: ''
    });
    setIsRescheduleOpen(true);
  };

  const handleReschedule = () => {
    if (!selectedAppointment) return;
    
    const updated = appointments.map(apt =>
      apt.id === selectedAppointment.id 
        ? { ...apt, date: rescheduleData.date, time: rescheduleData.time } 
        : apt
    );
    setAppointments(updated);
    localStorage.setItem('zervos_appointments', JSON.stringify(updated));
    setIsRescheduleOpen(false);
    setRescheduleData({ date: '', time: '', reason: '' });
    setSelectedAppointment(null);
  };

  const handleOpenCancel = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setCancelReason('');
    setIsCancelOpen(true);
  };

  const handleCancel = () => {
    if (!selectedAppointment) return;
    
    const updated = appointments.map(apt =>
      apt.id === selectedAppointment.id 
        ? { ...apt, status: 'cancelled' as const } 
        : apt
    );
    setAppointments(updated);
    localStorage.setItem('zervos_appointments', JSON.stringify(updated));
    setIsCancelOpen(false);
    setCancelReason('');
    setSelectedAppointment(null);
  };

  // Load appointments from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zervos_appointments');
      if (saved) {
        setAppointments(JSON.parse(saved));
      } else {
        // Save default appointments
        localStorage.setItem('zervos_appointments', JSON.stringify(appointments));
      }
    } catch {}
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">Manage all your bookings and schedules</p>
          </div>
          <Button onClick={() => setIsNewAppointmentOpen(true)} className="gap-2">
            <Plus size={18} />
            New Appointment
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by customer or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointments Table */}
        {filteredAppointments.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{apt.customerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{apt.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{apt.staff}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={16} className="text-gray-400" />
                        {apt.date}
                        <Clock size={16} className="text-gray-400 ml-2" />
                        {apt.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(apt.status)}`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(apt.id, 'completed')}>
                            <CheckCircle size={16} className="mr-2" />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenCancel(apt)}>
                            <XCircle size={16} className="mr-2" />
                            Cancel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenReschedule(apt)}>
                            <Edit size={16} className="mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first appointment'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => setIsNewAppointmentOpen(true)} className="gap-2">
                <Plus size={18} />
                Create Appointment
              </Button>
            )}
          </div>
        )}

        {/* New Appointment Modal */}
        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a new appointment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="John Doe"
                  value={newAppointment.customerName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Input
                  id="service"
                  placeholder="Technical Interview"
                  value={newAppointment.service}
                  onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Input
                  id="staff"
                  placeholder="Sarah Johnson"
                  value={newAppointment.staff}
                  onChange={(e) => setNewAppointment({ ...newAppointment, staff: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAppointment}
                disabled={!newAppointment.customerName || !newAppointment.service || !newAppointment.staff || !newAppointment.date || !newAppointment.time}
              >
                Create Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Modal */}
        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Change the date and time for {selectedAppointment?.customerName}'s appointment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Current booking:</p>
                <p className="font-medium">{selectedAppointment?.service}</p>
                <p className="text-sm text-gray-600">
                  {selectedAppointment?.date} at {selectedAppointment?.time}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reschedule-date">New Date</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reschedule-time">New Time</Label>
                  <Input
                    id="reschedule-time"
                    type="time"
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-reason">Reason (Optional)</Label>
                <Input
                  id="reschedule-reason"
                  placeholder="e.g., Schedule conflict"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={!rescheduleData.date || !rescheduleData.time}
              >
                Confirm Reschedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Modal */}
        <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <XCircle size={20} className="text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">{selectedAppointment?.service}</p>
                    <p className="text-sm text-red-700">
                      {selectedAppointment?.customerName}
                    </p>
                    <p className="text-sm text-red-600">
                      {selectedAppointment?.date} at {selectedAppointment?.time}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
                <Input
                  id="cancel-reason"
                  placeholder="e.g., Customer request, Emergency"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-600">
                The customer will be notified about this cancellation.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
                Keep Appointment
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancel}
              >
                Cancel Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
