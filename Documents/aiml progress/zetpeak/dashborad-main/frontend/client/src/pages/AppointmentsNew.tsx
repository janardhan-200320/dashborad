import { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter, CalendarX } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export default function AppointmentsNew() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    email: '',
    phone: '',
    serviceName: '',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    // Prefer backend appointments if available, fallback to localStorage
    fetch('/api/appointments')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        if (Array.isArray(data)) setAppointments(data);
      })
      .catch(() => {
        const saved = localStorage.getItem('zervos_appointments');
        if (saved) setAppointments(JSON.parse(saved));
      });
  }, []);

  const handleCreateAppointment = () => {
    const appointment: Appointment = {
      id: Date.now().toString(),
      ...newAppointment,
      status: 'upcoming',
    };
    
    const updated = [...appointments, appointment];
    setAppointments(updated);
    localStorage.setItem('zervos_appointments', JSON.stringify(updated));

    // Also send to backend for persistence across devices
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    }).catch(() => {/* ignore errors for now */});
    
    setNewAppointmentOpen(false);
    setNewAppointment({
      customerName: '',
      email: '',
      phone: '',
      serviceName: '',
      date: '',
      time: '',
      notes: '',
    });
    
    toast({ title: "Success", description: "Appointment created successfully" });
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled');

  const renderAppointmentsList = (appointmentsList: Appointment[]) => {
    if (appointmentsList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center relative">
                <Calendar size={48} className="text-indigo-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <CalendarX size={16} className="text-white" />
                </div>
                <div className="absolute top-3 left-3 w-4 h-4 bg-indigo-600 rounded-sm"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full"></div>
                <div className="absolute -top-4 right-8 w-5 h-5 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
          </h3>
          <p className="text-gray-500 mb-6">
            Organize your schedule by adding appointments here.
          </p>
          <Button 
            onClick={() => setNewAppointmentOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Plus size={18} />
            New Appointment
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {appointmentsList.map((appointment) => (
          <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{appointment.customerName}</h3>
                <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{appointment.date}</span>
                  <span>•</span>
                  <span>{appointment.time}</span>
                  <span>•</span>
                  <span>{appointment.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'upcoming' 
                    ? 'bg-green-100 text-green-700' 
                    : appointment.status === 'completed'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming" className="px-6">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="px-6">
                Past
              </TabsTrigger>
              <TabsTrigger value="custom" className="px-6">
                Custom Date
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {renderAppointmentsList(upcomingAppointments)}
            </TabsContent>

            <TabsContent value="past">
              {renderAppointmentsList(pastAppointments)}
            </TabsContent>

            <TabsContent value="custom">
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                      <Calendar size={48} className="text-indigo-600" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a custom date range</h3>
                <p className="text-gray-500 mb-6">Choose dates to view appointments</p>
                <div className="flex gap-3">
                  <Input type="date" className="w-40" />
                  <span className="text-gray-500 flex items-center">to</span>
                  <Input type="date" className="w-40" />
                  <Button variant="outline">Filter</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* New Appointment Modal */}
        <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Appointment</DialogTitle>
              <DialogDescription>
                Create a new appointment for your customer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    value={newAppointment.customerName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newAppointment.email}
                    onChange={(e) => setNewAppointment({ ...newAppointment, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newAppointment.phone}
                    onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service *</Label>
                  <Select value={newAppointment.serviceName} onValueChange={(v) => setNewAppointment({ ...newAppointment, serviceName: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Demo">Demo</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewAppointmentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAppointment} className="bg-indigo-600 hover:bg-indigo-700">
                Create Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
