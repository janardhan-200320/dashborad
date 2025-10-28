import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Sparkles } from 'lucide-react';

export default function Step4CustomLabels() {
  const { data, updateData, prevStep } = useOnboarding();
  const [eventTypeLabel, setEventTypeLabel] = useState(data.eventTypeLabel);
  const [teamMemberLabel, setTeamMemberLabel] = useState(data.teamMemberLabel);

  const handleCreate = () => {
    updateData({ eventTypeLabel, teamMemberLabel });
    console.log('Onboarding completed!', {
      ...data,
      eventTypeLabel,
      teamMemberLabel,
    });
    alert('Account created successfully!');
  };

  const handleBack = () => {
    updateData({ eventTypeLabel, teamMemberLabel });
    prevStep();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
          Custom Labels <Sparkles className="w-5 h-5 text-primary" />
        </h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="eventType" className="text-sm font-medium">
            How would you like to label your Event Types? <span className="text-destructive">*</span>
          </Label>
          <Input
            id="eventType"
            placeholder="Properties Management"
            value={eventTypeLabel}
            onChange={(e) => setEventTypeLabel(e.target.value)}
            data-testid="input-event-type-label"
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            E.g.: Consultations, Classes, Sessions
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamMember" className="text-sm font-medium">
            How would you like to label your Team Members? <span className="text-destructive">*</span>
          </Label>
          <Input
            id="teamMember"
            placeholder="Agents"
            value={teamMemberLabel}
            onChange={(e) => setTeamMemberLabel(e.target.value)}
            data-testid="input-team-member-label"
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            E.g.: Consultants, Technicians, Physicians
          </p>
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
          onClick={handleCreate}
          disabled={!eventTypeLabel.trim() || !teamMemberLabel.trim()}
          data-testid="button-create"
          className="min-w-32"
        >
          Create
        </Button>
      </div>
    </div>
  );
}
