import { useState, useEffect } from 'react';
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

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Load service data from localStorage
  useEffect(() => {
    console.log('Loading service with ID:', serviceId);
    
    try {
      const savedCalls = localStorage.getItem('zervos_sales_calls');
      console.log('Saved calls from localStorage:', savedCalls);
      
      let foundService = false;
      
      if (savedCalls && serviceId) {
        const calls = JSON.parse(savedCalls);
        console.log('Parsed calls:', calls);
        const salesCall = calls.find((call: any) => call.id === serviceId);
        console.log('Found sales call:', salesCall);
        
        if (salesCall) {
          foundService = true;
          
          // Get assigned salesperson name
          let hostName = 'Bharath Reddy';
          if (salesCall.assignedSalespersons && salesCall.assignedSalespersons.length > 0) {
            // Mock salespersons - in real app, fetch from database
            const salespersons = [
              { id: '1', name: 'Bharath Reddy' },
              { id: '2', name: 'Sarah Johnson' },
              { id: '3', name: 'Mike Williams' },
            ];
            const assignedPerson = salespersons.find(sp => sp.id === salesCall.assignedSalespersons[0]);
            if (assignedPerson) hostName = assignedPerson.name;
          }

          // Map meeting mode to location type
          let locationType: 'in-person' | 'phone' | 'video' | 'custom' = 'video';
          if (salesCall.meetingMode === 'phone') locationType = 'phone';
          else if (salesCall.meetingMode === 'in-person') locationType = 'in-person';
          else if (salesCall.meetingMode === 'custom') locationType = 'custom';
          else if (salesCall.meetingMode === 'video') locationType = 'video';

          // Format duration
          const hours = parseInt(salesCall.duration?.hours || '0');
          const minutes = parseInt(salesCall.duration?.minutes || '30');
          let durationText = '';
          if (hours > 0) durationText += `${hours} hour${hours > 1 ? 's' : ''}`;
          if (minutes > 0) durationText += `${hours > 0 ? ' ' : ''}${minutes} mins`;

          console.log('Setting service with data:', {
            name: salesCall.name,
            description: salesCall.description,
            duration: durationText,
            hostName,
            locationType
          });

          setService({
            id: salesCall.id,
            name: salesCall.name,
            description: salesCall.description || 'Book your appointment for this service',
            duration: durationText || '30 mins',
            locationType: locationType,
            hostName: hostName,
            color: 'from-purple-500 to-pink-500'
          });
        }
      }
      
      // Fallback to default if not found
      if (!foundService) {
        console.log('No sales call found, using default');
        setService({
          id: serviceId || '1',
          name: 'Lead Qualification Session',
          description: 'Initial consultation to understand your needs and see how we can help',
          duration: '30 mins',
          locationType: 'video',
          hostName: 'Bharath Reddy',
          color: 'from-purple-500 to-pink-500'
        });
      }
    } catch (error) {
      console.error('Error loading service:', error);
      // Fallback to default
      setService({
        id: serviceId || '1',
        name: 'Lead Qualification Session',
        description: 'Initial consultation to understand your needs and see how we can help',
        duration: '30 mins',
        locationType: 'video',
        hostName: 'Bharath Reddy',
        color: 'from-purple-500 to-pink-500'
      });
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
    } else if (step === 2 && formData.name && formData.email) {
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
      30 // Default 30 minutes duration
    );

    const event: CalendarEvent = {
      title: service.name,
      description: `Meeting with ${service.hostName}\n\n${formData.notes || ''}`,
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
      30
    );

    const event: CalendarEvent = {
      title: service.name,
      description: `Meeting with ${service.hostName}\n\n${formData.notes || ''}`,
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
      30
    );

    const event: CalendarEvent = {
      title: service.name,
      description: `Meeting with ${service.hostName}\n\n${formData.notes || ''}`,
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
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Tell us anything that will help prepare for our meeting..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        onClick={handleContinue}
                        disabled={!formData.name || !formData.email}
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
                            <p className="text-sm text-gray-600">{formData.email}</p>
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
