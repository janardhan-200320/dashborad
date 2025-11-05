import { useState, useEffect, useMemo } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  User, 
  Mail, 
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Globe,
  Building2,
  Download,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  generateGoogleCalendarUrl, 
  generateOutlookCalendarUrl, 
  downloadICalFile,
  createEventDate,
  type CalendarEvent 
} from '@/lib/calendar-utils';

type DynamicFieldType = 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea';
interface LoginField {
  id: string;
  name: string;
  type: DynamicFieldType;
  required: boolean;
  placeholder?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  durationMinutes: number;
  locationType: 'in-person' | 'phone' | 'video' | 'custom';
  hostName: string;
  color: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function PublicBookingPage() {
  const [, params] = useRoute('/book/:serviceId');
  const serviceId = params?.serviceId;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [callData, setCallData] = useState<any | null>(null);
  // Dynamic booking form fields driven by Admin Center -> Customer Login Preferences
  const [loginFields, setLoginFields] = useState<LoginField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Load booking form field configuration
  useEffect(() => {
    // Helper to load organization defaults
    const loadOrgDefaults = () => {
      try {
        const raw = localStorage.getItem('zervos_login_prefs');
        if (raw) {
          const prefs = JSON.parse(raw);
          const fields: LoginField[] = Array.isArray(prefs.loginFields) ? prefs.loginFields : [];
          setLoginFields(fields);
          const init: Record<string, string> = {};
          fields.forEach((f) => { init[f.id] = ''; });
          setFormData((prev) => ({ ...init, ...prev }));
          return;
        }
      } catch {}
      // Default fields when none configured or on error
      const defaults: LoginField[] = [
        { id: 'full_name', name: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
        { id: 'email', name: 'Email Address', type: 'email', required: true, placeholder: 'your@email.com' },
        { id: 'phone', name: 'Contact Number', type: 'tel', required: true, placeholder: '+1 (555) 123-4567' },
        { id: 'notes', name: 'Additional Notes', type: 'textarea', required: false, placeholder: 'Anything we should know?' },
      ];
      setLoginFields(defaults);
      const init: Record<string, string> = {};
      defaults.forEach((f) => { init[f.id] = ''; });
      setFormData((prev) => ({ ...init, ...prev }));
    };

    // Prefer per-call custom fields when explicitly set
    if (callData && callData.useOrgFormFields === false && Array.isArray(callData.customFormFields) && callData.customFormFields.length > 0) {
      const fields: LoginField[] = callData.customFormFields;
      setLoginFields(fields);
      const init: Record<string, string> = {};
      fields.forEach((f) => { init[f.id] = ''; });
      setFormData((prev) => ({ ...init, ...prev }));
    } else {
      loadOrgDefaults();
    }
  }, [callData]);

  // Load service data dynamically from localStorage (workspace-aware)
  useEffect(() => {
    try {
      if (!serviceId) return;

      // Helper: get all localStorage keys that match prefix
      const getKeysByPrefix = (prefix: string) => {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(prefix)) keys.push(k);
        }
        return keys;
      };

      // 1) Find the sales call by id across all workspace-scoped keys (and global fallback)
      const callKeys = [
        ...getKeysByPrefix('zervos_sales_calls::'),
        'zervos_sales_calls'
      ];

      let salesCall: any | null = null;
      let workspaceIdForCall: string | null = null;
      for (const key of callKeys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            const found = arr.find((c: any) => c?.id === serviceId);
            if (found) {
              salesCall = found;
              workspaceIdForCall = key.includes('::') ? key.split('::')[1] : null;
              break;
            }
          }
        } catch {}
      }

      if (!salesCall) {
        // Fallback default if not found
        setService({
          id: serviceId,
          name: 'Lead Qualification Session',
          description: 'Initial consultation to understand your needs and see how we can help',
          duration: '30 mins',
          durationMinutes: 30,
          locationType: 'video',
          hostName: 'Bharath Reddy',
          color: 'from-purple-500 to-pink-500'
        });
        return;
      }

      // 2) Resolve host name from assignedSalespersons via workspace/global member lists
      const primaryAssigneeId = Array.isArray(salesCall.assignedSalespersons) && salesCall.assignedSalespersons.length > 0
        ? salesCall.assignedSalespersons[0]
        : null;

      const resolveMemberName = (id: string | null): string => {
        if (!id) return 'Team Member';
        const candidateKeys: string[] = [];
        if (workspaceIdForCall) {
          candidateKeys.push(`zervos_team_members::${workspaceIdForCall}`);
          candidateKeys.push(`zervos_salespersons::${workspaceIdForCall}`);
        }
        // Add globals
        candidateKeys.push('zervos_team_members');
        candidateKeys.push('zervos_salespersons');
        // As a last resort, scan all potential team member keys across all workspaces
        const allMemberKeys = [
          ...getKeysByPrefix('zervos_team_members::'),
          ...getKeysByPrefix('zervos_salespersons::')
        ];
        for (const k of allMemberKeys) if (!candidateKeys.includes(k)) candidateKeys.push(k);

        for (const key of candidateKeys) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              const m = arr.find((x: any) => x?.id === id || x?.email === id);
              if (m) return m.name || m.email || 'Team Member';
            }
          } catch {}
        }
        return 'Team Member';
      };

      const hostName = resolveMemberName(primaryAssigneeId);

      // 3) Map meeting mode to location type
      let locationType: 'in-person' | 'phone' | 'video' | 'custom' = 'video';
      if (salesCall.meetingMode === 'phone') locationType = 'phone';
      else if (salesCall.meetingMode === 'in-person') locationType = 'in-person';
      else if (salesCall.meetingMode === 'custom') locationType = 'custom';
      else if (salesCall.meetingMode === 'video') locationType = 'video';

      // 4) Format duration and compute minutes
      const hours = parseInt(salesCall.duration?.hours || '0');
      const minutes = parseInt(salesCall.duration?.minutes || '30');
      const totalMinutes = (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
      let durationText = '';
      if ((hours || 0) > 0) durationText += `${hours} hour${hours > 1 ? 's' : ''}`;
      if ((minutes || 0) > 0) durationText += `${hours > 0 ? ' ' : ''}${minutes} mins`;
      if (!durationText) durationText = '30 mins';

      // 5) Set service and expose raw call data
      setService({
        id: salesCall.id,
        name: salesCall.name,
        description: salesCall.description || 'Book your appointment for this service',
        duration: durationText,
        durationMinutes: totalMinutes || 30,
        locationType,
        hostName,
        color: 'from-purple-500 to-pink-500'
      });
      setCallData(salesCall);
    } catch (error) {
      // Fallback to default on error
      setService({
        id: serviceId || '1',
        name: 'Lead Qualification Session',
        description: 'Initial consultation to understand your needs and see how we can help',
        duration: '30 mins',
        durationMinutes: 30,
        locationType: 'video',
        hostName: 'Bharath Reddy',
        color: 'from-purple-500 to-pink-500'
      });
      setCallData(null);
    }
  }, [serviceId]);

  // Generate calendar days for current month
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 35; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  // Generate time slots
  const timeSlots: TimeSlot[] = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: true },
    { time: '10:00 AM', available: false },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '11:30 AM', available: true },
    { time: '12:00 PM', available: false },
    { time: '01:00 PM', available: true },
    { time: '01:30 PM', available: true },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '03:30 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '04:30 PM', available: false },
    { time: '05:00 PM', available: true },
  ];

  const isDateAvailable = (date: Date) => {
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && day !== 0 && day !== 6; // Not Sunday or Saturday
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDateSelect = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    } else if (step === 2) {
      // Validate required dynamic fields
      const allValid = loginFields.every((f) => !f.required || (formData[f.id] && formData[f.id].trim().length > 0));
      if (!allValid) return;

      // Persist appointment to backend
      const emailField = loginFields.find(f => f.type === 'email');
      const nameField = loginFields.find(f => f.name.toLowerCase().includes('name'));
      const phoneField = loginFields.find(f => f.type === 'tel');

      const payload = {
        customerName: (nameField && formData[nameField.id]) || formData['full_name'] || 'Customer',
        email: (emailField && formData[emailField.id]) || '',
        phone: (phoneField && formData[phoneField.id]) || formData['phone'] || '',
        serviceName: service?.name || 'Service',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        time: selectedTime || '',
        status: 'upcoming' as const,
        notes: (() => {
          // Concatenate non-standard fields as notes
          const exclude = new Set([emailField?.id, nameField?.id, phoneField?.id, 'full_name', 'email', 'phone'].filter(Boolean) as string[]);
          const parts = Object.entries(formData)
            .filter(([k, v]) => !exclude.has(k) && (v ?? '').toString().trim().length > 0)
            .map(([k, v]) => `${k}: ${v}`);
          return parts.join('\n');
        })(),
      };

      fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => { /* ignore for now */ });

      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleAddToGoogleCalendar = () => {
    if (!selectedDate || !selectedTime || !service) return;
    
    const { start, end} = createEventDate(
      selectedDate.toISOString().split('T')[0],
      selectedTime,
      service?.durationMinutes || 30 // Use actual duration
    );

    const event: CalendarEvent = {
      title: service.name,
      description: `Meeting with ${service.hostName}`,
      location: getLocationText(),
      startTime: start,
      endTime: end,
      url: window.location.href
    };

    window.open(generateGoogleCalendarUrl(event), '_blank');
  };

  const handleAddToOutlook = () => {
    if (!selectedDate || !selectedTime || !service) return;
    
    const { start, end } = createEventDate(
      selectedDate.toISOString().split('T')[0],
      selectedTime,
      service?.durationMinutes || 30
    );

    const event: CalendarEvent = {
      title: service.name,
      description: `Meeting with ${service.hostName}`,
      location: getLocationText(),
      startTime: start,
      endTime: end,
      url: window.location.href
    };

    window.open(generateOutlookCalendarUrl(event), '_blank');
  };

  const handleDownloadICal = () => {
    if (!selectedDate || !selectedTime || !service) return;
    
    const { start, end } = createEventDate(
      selectedDate.toISOString().split('T')[0],
      selectedTime,
      service?.durationMinutes || 30
    );

    const event: CalendarEvent = {
      title: service.name,
      description: `Meeting with ${service.hostName}`,
      location: getLocationText(),
      startTime: start,
      endTime: end,
      url: window.location.href
    };

    downloadICalFile(event, `${service.name.replace(/\s+/g, '_')}.ics`);
  };

  const getLocationIcon = () => {
    if (!service) return null;
    switch (service.locationType) {
      case 'video': return <Video size={16} className="text-purple-600" />;
      case 'phone': return <Phone size={16} className="text-purple-600" />;
      case 'in-person': return <MapPin size={16} className="text-purple-600" />;
      default: return <Globe size={16} className="text-purple-600" />;
    }
  };

  const getLocationText = () => {
    if (!service) return '';
    switch (service.locationType) {
      case 'video': return 'Video Conference';
      case 'phone': return 'Phone Call';
      case 'in-person': return 'In Person';
      default: return 'Custom Location';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Show loading state while service is being loaded
  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 size={32} className="text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Zervos Bookings</h1>
          </div>
          <p className="text-gray-600">Book your appointment in a few simple steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <span className="font-medium hidden sm:inline">Select Time</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <CheckCircle2 size={16} /> : '2'}
              </div>
              <span className="font-medium hidden sm:inline">Your Details</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {step > 3 ? <CheckCircle2 size={16} /> : '3'}
              </div>
              <span className="font-medium hidden sm:inline">Confirmed</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Service Info (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                {/* Service Icon */}
                <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center text-white font-bold text-2xl mx-auto`}>
                  {service.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>

                {/* Service Details */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">{service.name}</h2>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Clock size={16} className="text-purple-600" />
                  <span>{service.duration}</span>
                </div>

                {/* Host */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <User size={16} className="text-purple-600" />
                  <span>{service.hostName}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {getLocationIcon()}
                  <span>{getLocationText()}</span>
                </div>

                {/* Selected Date/Time */}
                {selectedDate && selectedTime && (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Selected Slot:</h3>
                    <div className="bg-purple-50 p-3 rounded-lg space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-purple-600" />
                        <span className="font-medium">{formatDate(selectedDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-purple-600" />
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Booking Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* STEP 1: Select Date & Time */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>

                    {/* Calendar */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Button variant="outline" size="sm" onClick={previousMonth}>
                          ← Previous
                        </Button>
                        <h3 className="text-lg font-semibold">
                          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <Button variant="outline" size="sm" onClick={nextMonth}>
                          Next →
                        </Button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {day}
                          </div>
                        ))}
                        {calendarDays.map((date, index) => {
                          const isAvailable = isDateAvailable(date);
                          const isSelected = selectedDate && isSameDay(date, selectedDate);
                          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

                          return (
                            <button
                              key={index}
                              onClick={() => handleDateSelect(date)}
                              disabled={!isAvailable}
                              className={`
                                aspect-square p-2 rounded-lg text-sm font-medium transition-all
                                ${!isCurrentMonth ? 'text-gray-300' : ''}
                                ${isAvailable && isCurrentMonth
                                  ? 'hover:bg-purple-100 text-gray-900 cursor-pointer'
                                  : 'text-gray-300 cursor-not-allowed'
                                }
                                ${isSelected ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
                              `}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Available Times</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              variant={selectedTime === slot.time ? 'default' : 'outline'}
                              disabled={!slot.available}
                              onClick={() => handleTimeSelect(slot.time)}
                              className={`
                                ${selectedTime === slot.time ? 'bg-purple-600 hover:bg-purple-700' : ''}
                                ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleContinue}
                        disabled={!selectedDate || !selectedTime}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="lg"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Enter Details */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft size={18} />
                      </Button>
                      <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
                    </div>

                    <div className="space-y-4">
                      {loginFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id}>
                            {field.name} {field.required && <span className="text-red-500">*</span>}
                          </Label>
                          {field.type === 'textarea' ? (
                            <Textarea
                              id={field.id}
                              placeholder={field.placeholder || ''}
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              rows={4}
                            />
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type}
                              placeholder={field.placeholder || ''}
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        onClick={handleContinue}
                        disabled={!loginFields.every((f) => !f.required || (formData[f.id] && formData[f.id].trim().length > 0))}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="lg"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Confirmation */}
                {step === 3 && (
                  <div className="space-y-6 text-center py-8">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={40} className="text-green-600" />
                      </div>
                    </div>

                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                      <p className="text-gray-600">
                        Your appointment has been successfully scheduled
                      </p>
                    </div>

                    {/* Booking Summary */}
                    <Card className="max-w-md mx-auto">
                      <CardHeader>
                        <CardTitle className="text-lg">Appointment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                          <Calendar size={18} className="text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">{selectedDate && formatDate(selectedDate)}</p>
                            <p className="text-sm text-gray-600">{selectedTime}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <User size={18} className="text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-sm text-gray-600">with {service.hostName}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail size={18} className="text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">Confirmation Sent</p>
                            <p className="text-sm text-gray-600">{
                              (loginFields.find(f => f.type === 'email') && formData[loginFields.find(f => f.type === 'email')!.id]) || ''
                            }</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Add to Calendar */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Add to your calendar:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddToGoogleCalendar}
                          className="gap-2"
                        >
                          <ExternalLink size={14} />
                          Google Calendar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddToOutlook}
                          className="gap-2"
                        >
                          <ExternalLink size={14} />
                          Outlook
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDownloadICal}
                          className="gap-2"
                        >
                          <Download size={14} />
                          Apple Calendar (.ics)
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                      >
                        Book Another Appointment
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
