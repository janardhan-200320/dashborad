import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Calendar, Plus, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DaySchedule {
  day: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  breaks: { start: string; end: string }[];
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

export default function AvailabilitySettingsPage() {
  const [bufferTime, setBufferTime] = useState('15');
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: 'Monday', isAvailable: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    { day: 'Tuesday', isAvailable: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    { day: 'Wednesday', isAvailable: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    { day: 'Thursday', isAvailable: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    { day: 'Friday', isAvailable: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    { day: 'Saturday', isAvailable: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    { day: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '17:00', breaks: [] },
  ]);

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([
    { id: '1', date: '2025-12-25', reason: 'Christmas' },
    { id: '2', date: '2025-12-31', reason: 'New Year\'s Eve' },
  ]);

  const [newBlockedDate, setNewBlockedDate] = useState({ date: '', reason: '' });

  const handleToggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isAvailable = !newSchedule[index].isAvailable;
    setSchedule(newSchedule);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleAddBreak = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].breaks.push({ start: '12:00', end: '13:00' });
    setSchedule(newSchedule);
  };

  const handleRemoveBreak = (dayIndex: number, breakIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].breaks.splice(breakIndex, 1);
    setSchedule(newSchedule);
  };

  const handleBreakTimeChange = (dayIndex: number, breakIndex: number, field: 'start' | 'end', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].breaks[breakIndex][field] = value;
    setSchedule(newSchedule);
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate.date) {
      setBlockedDates([...blockedDates, { 
        id: Date.now().toString(), 
        ...newBlockedDate 
      }]);
      setNewBlockedDate({ date: '', reason: '' });
    }
  };

  const handleRemoveBlockedDate = (id: string) => {
    setBlockedDates(blockedDates.filter(d => d.id !== id));
  };

  const handleSave = () => {
    // Save logic here
    alert('Availability settings saved!');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={28} />
            Availability Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your working hours and availability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Set your available hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.map((day, index) => (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={day.isAvailable}
                        onCheckedChange={() => handleToggleDay(index)}
                      />
                      <span className={`font-medium ${day.isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                        {day.day}
                      </span>
                    </div>
                    {day.isAvailable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBreak(index)}
                      >
                        <Plus size={14} className="mr-1" />
                        Add Break
                      </Button>
                    )}
                  </div>

                  {day.isAvailable && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Start Time</Label>
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">End Time</Label>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Breaks */}
                      {day.breaks.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <Label className="text-xs text-gray-600">Break Times</Label>
                          {day.breaks.map((breakTime, breakIndex) => (
                            <div key={breakIndex} className="grid grid-cols-2 gap-2">
                              <Input
                                type="time"
                                value={breakTime.start}
                                onChange={(e) => handleBreakTimeChange(index, breakIndex, 'start', e.target.value)}
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="time"
                                  value={breakTime.end}
                                  onChange={(e) => handleBreakTimeChange(index, breakIndex, 'end', e.target.value)}
                                  className="text-sm"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveBreak(index, breakIndex)}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Buffer Time */}
            <Card>
              <CardHeader>
                <CardTitle>Buffer Time</CardTitle>
                <CardDescription>Time between appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="bufferTime">Minutes</Label>
                  <Input
                    id="bufferTime"
                    type="number"
                    value={bufferTime}
                    onChange={(e) => setBufferTime(e.target.value)}
                    placeholder="15"
                  />
                  <p className="text-xs text-gray-500">
                    Minimum time gap between consecutive appointments
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Blocked Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Blocked Dates
                </CardTitle>
                <CardDescription>Block specific dates (holidays/time off)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new blocked date */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <Input
                    type="date"
                    value={newBlockedDate.date}
                    onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Reason (optional)"
                    value={newBlockedDate.reason}
                    onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddBlockedDate}
                    disabled={!newBlockedDate.date}
                    className="w-full"
                  >
                    <Plus size={14} className="mr-1" />
                    Add Date
                  </Button>
                </div>

                {/* Blocked dates list */}
                <div className="space-y-2">
                  {blockedDates.map((blocked) => (
                    <div key={blocked.id} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(blocked.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        {blocked.reason && (
                          <div className="text-xs text-gray-600">{blocked.reason}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBlockedDate(blocked.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="px-8">
            Save Availability Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
