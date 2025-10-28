import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOnboarding } from '@/contexts/OnboardingContext';

const timezones = [
  'Asia/Kolkata - IST (+05:30)',
  'America/New_York - EST (-05:00)',
  'America/Los_Angeles - PST (-08:00)',
  'Europe/London - GMT (+00:00)',
  'Europe/Paris - CET (+01:00)',
  'Asia/Tokyo - JST (+09:00)',
  'Australia/Sydney - AEDT (+11:00)',
];

const timeSlots = [
  '12:00 am', '01:00 am', '02:00 am', '03:00 am', '04:00 am', '05:00 am',
  '06:00 am', '07:00 am', '08:00 am', '09:00 am', '10:00 am', '11:00 am',
  '12:00 pm', '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm', '05:00 pm',
  '06:00 pm', '07:00 pm', '08:00 pm', '09:00 pm', '10:00 pm', '11:00 pm',
];

const daysOfWeek = [
  { short: 'Sun', full: 'Sunday' },
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
];

export default function Step3Availability() {
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  const [timezone, setTimezone] = useState(data.timezone);
  const [startTime, setStartTime] = useState(data.availableTimeStart);
  const [endTime, setEndTime] = useState(data.availableTimeEnd);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    data.availableDays.length > 0 ? data.availableDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  );

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const isFormValid = timezone && startTime && endTime && selectedDays.length > 0;

  const handleNext = () => {
    updateData({
      timezone,
      availableTimeStart: startTime,
      availableTimeEnd: endTime,
      availableDays: selectedDays,
    });
    nextStep();
  };

  const handleBack = () => {
    updateData({
      timezone,
      availableTimeStart: startTime,
      availableTimeEnd: endTime,
      availableDays: selectedDays,
    });
    prevStep();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Your available times <span className="text-destructive">*</span>
        </h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-sm font-medium">
            Time zone
          </Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone" data-testid="select-timezone" className="h-11">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Your available times</Label>
          <div className="flex gap-4">
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger data-testid="select-start-time" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger data-testid="select-end-time" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Your available days</Label>
          <div className="flex gap-2">
            {daysOfWeek.map((day) => {
              const isSelected = selectedDays.includes(day.short);
              return (
                <button
                  key={day.short}
                  onClick={() => toggleDay(day.short)}
                  className={`
                    flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                    ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover-elevate'
                    }
                  `}
                  data-testid={`day-${day.short.toLowerCase()}`}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          data-testid="button-back"
          className="min-w-32"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isFormValid}
          data-testid="button-next"
          className="min-w-32"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
