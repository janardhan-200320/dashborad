import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  Users,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TimeSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  maxBookings: number;
  currentBookings: number;
}

interface SlotBooking {
  id: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [isEditSlotOpen, setIsEditSlotOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'full' | 'inactive'>('all');
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    maxBookings: 5,
    isActive: true,
  });

  // Load data from localStorage
  useEffect(() => {
    const loadedSlots = localStorage.getItem('zervos_timeslots');
    const loadedBookings = localStorage.getItem('zervos_slot_bookings');
    
    if (loadedSlots) {
      setTimeSlots(JSON.parse(loadedSlots));
    } else {
      // Default slots
      const defaultSlots: TimeSlot[] = [
        { id: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', isActive: true, maxBookings: 5, currentBookings: 3 },
        { id: '2', dayOfWeek: 'Monday', startTime: '10:00', endTime: '11:00', isActive: true, maxBookings: 5, currentBookings: 5 },
        { id: '3', dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '15:00', isActive: true, maxBookings: 3, currentBookings: 1 },
        { id: '4', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:00', isActive: false, maxBookings: 5, currentBookings: 0 },
      ];
      setTimeSlots(defaultSlots);
      localStorage.setItem('zervos_timeslots', JSON.stringify(defaultSlots));
    }
    
    if (loadedBookings) {
      setBookings(JSON.parse(loadedBookings));
    }
  }, []);

  // Save to localStorage whenever slots change
  useEffect(() => {
    if (timeSlots.length > 0) {
      localStorage.setItem('zervos_timeslots', JSON.stringify(timeSlots));
      // Trigger event for booking page to refresh
      window.dispatchEvent(new Event('timeslots-updated'));
    }
  }, [timeSlots]);

  // Statistics
  const stats = useMemo(() => {
    const totalSlots = timeSlots.length;
    const activeSlots = timeSlots.filter(s => s.isActive).length;
    const totalCapacity = timeSlots.reduce((sum, s) => sum + s.maxBookings, 0);
    const totalBooked = timeSlots.reduce((sum, s) => sum + s.currentBookings, 0);
    const utilizationRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;
    
    return {
      totalSlots,
      activeSlots,
      totalCapacity,
      totalBooked,
      utilizationRate,
      availableSlots: totalCapacity - totalBooked,
    };
  }, [timeSlots]);

  // Filtered slots
  const filteredSlots = useMemo(() => {
    let filtered = timeSlots;
    
    if (selectedDay !== 'All') {
      filtered = filtered.filter(s => s.dayOfWeek === selectedDay);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => {
        if (filterStatus === 'available') return s.isActive && s.currentBookings < s.maxBookings;
        if (filterStatus === 'full') return s.currentBookings >= s.maxBookings;
        if (filterStatus === 'inactive') return !s.isActive;
        return true;
      });
    }
    
    return filtered;
  }, [timeSlots, selectedDay, filterStatus]);

  const handleAddSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      isActive: formData.isActive,
      maxBookings: formData.maxBookings,
      currentBookings: 0,
    };
    
    setTimeSlots([...timeSlots, newSlot]);
    setIsAddSlotOpen(false);
    resetForm();
  };

  const handleEditSlot = () => {
    if (!selectedSlot) return;
    
    setTimeSlots(timeSlots.map(slot => 
      slot.id === selectedSlot.id 
        ? { ...slot, ...formData }
        : slot
    ));
    
    setIsEditSlotOpen(false);
    setSelectedSlot(null);
    resetForm();
  };

  const handleDeleteSlot = (id: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id 
        ? { ...slot, isActive: !slot.isActive }
        : slot
    ));
  };

  const openEditDialog = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxBookings: slot.maxBookings,
      isActive: slot.isActive,
    });
    setIsEditSlotOpen(true);
  };

  const resetForm = () => {
    setFormData({
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      maxBookings: 5,
      isActive: true,
    });
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.isActive) return { label: 'Inactive', color: 'bg-slate-500', textColor: 'text-slate-700' };
    if (slot.currentBookings >= slot.maxBookings) return { label: 'Full', color: 'bg-red-500', textColor: 'text-red-700' };
    if (slot.currentBookings > 0) return { label: 'Partially Booked', color: 'bg-amber-500', textColor: 'text-amber-700' };
    return { label: 'Available', color: 'bg-emerald-500', textColor: 'text-emerald-700' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Time Slot Management</h1>
            <p className="mt-1 text-slate-600">Manage your availability and booking slots</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddSlotOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Add Time Slot
          </motion.button>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Total Slots',
              value: stats.totalSlots,
              icon: Clock,
              color: 'from-blue-400 to-blue-500',
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600',
            },
            {
              title: 'Active Slots',
              value: stats.activeSlots,
              icon: CheckCircle,
              color: 'from-emerald-400 to-emerald-500',
              bgColor: 'bg-emerald-50',
              iconColor: 'text-emerald-600',
            },
            {
              title: 'Total Booked',
              value: `${stats.totalBooked}/${stats.totalCapacity}`,
              icon: Users,
              color: 'from-purple-400 to-purple-500',
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600',
            },
            {
              title: 'Utilization Rate',
              value: `${stats.utilizationRate.toFixed(1)}%`,
              icon: TrendingUp,
              color: 'from-amber-400 to-amber-500',
              bgColor: 'bg-amber-50',
              iconColor: 'text-amber-600',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-0 bg-white shadow-lg transition-all hover:shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl ${stat.bgColor} p-3`}>
                      <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Filters:</span>
              </div>
              
              {/* Day filter */}
              <div className="flex flex-wrap gap-2">
                {['All', ...daysOfWeek].map((day) => (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(day)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      selectedDay === day
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </motion.button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Status' },
                  { value: 'available', label: 'Available' },
                  { value: 'full', label: 'Full' },
                  { value: 'inactive', label: 'Inactive' },
                ].map((status) => (
                  <motion.button
                    key={status.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterStatus(status.value as any)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      filterStatus === status.value
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Time Slots Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredSlots.map((slot, index) => {
                const status = getSlotStatus(slot);
                const availableSpots = slot.maxBookings - slot.currentBookings;
                const percentage = (slot.currentBookings / slot.maxBookings) * 100;
                
                return (
                  <motion.div
                    key={slot.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden border-0 bg-white shadow-lg transition-all hover:shadow-xl">
                      {/* Status indicator bar */}
                      <div className={`absolute left-0 top-0 h-1 w-full ${status.color}`} />
                      
                      <div className="p-6">
                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-lg ${slot.isActive ? 'bg-blue-50' : 'bg-slate-50'} p-2`}>
                              <Clock className={`h-5 w-5 ${slot.isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{slot.dayOfWeek}</h3>
                              <p className="text-sm text-slate-600">
                                {slot.startTime} - {slot.endTime}
                              </p>
                            </div>
                          </div>
                          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${status.textColor} bg-${status.color.split('-')[1]}-100`}>
                            {status.label}
                          </div>
                        </div>

                        {/* Booking Progress */}
                        <div className="mb-4">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-slate-600">Bookings</span>
                            <span className="font-semibold text-slate-900">
                              {slot.currentBookings}/{slot.maxBookings}
                            </span>
                          </div>
                          <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.05 }}
                              className={`h-full ${
                                percentage >= 100 
                                  ? 'bg-red-500' 
                                  : percentage >= 70 
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          {availableSpots > 0 && slot.isActive && (
                            <p className="mt-1 text-xs text-emerald-600">
                              {availableSpots} spot{availableSpots !== 1 ? 's' : ''} available
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditDialog(slot)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleActive(slot.id)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                              slot.isActive
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {slot.isActive ? (
                              <>
                                <XCircle className="h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredSlots.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <AlertCircle className="mx-auto h-16 w-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No time slots found</h3>
              <p className="mt-2 text-slate-600">
                Try adjusting your filters or add a new time slot.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Add Slot Dialog */}
        <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Add New Time Slot
              </DialogTitle>
              <DialogDescription>
                Create a new time slot for customers to book appointments.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Max Bookings</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxBookings}
                  onChange={(e) => setFormData({ ...formData, maxBookings: parseInt(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Active (available for booking)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsAddSlotOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSlot}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Add Slot
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Slot Dialog */}
        <Dialog open={isEditSlotOpen} onOpenChange={setIsEditSlotOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                Edit Time Slot
              </DialogTitle>
              <DialogDescription>
                Update the details of this time slot.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Max Bookings</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxBookings}
                  onChange={(e) => setFormData({ ...formData, maxBookings: parseInt(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <label htmlFor="isActiveEdit" className="text-sm font-medium text-slate-700">
                  Active (available for booking)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsEditSlotOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSlot}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TimeSlots;
