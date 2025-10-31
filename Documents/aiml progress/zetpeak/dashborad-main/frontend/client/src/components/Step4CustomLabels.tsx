import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Sparkles, Loader2, Info } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Industry-specific label mappings
const LABEL_SUGGESTIONS = {
  'HR / People & Org': {
    eventTypeDefault: 'Sessions',
    eventTypeSuggestions: ['Interviews', 'Training Sessions', 'Meetings'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Recruiters', 'HR Managers', 'Trainers'],
  },
  'Sales': {
    eventTypeDefault: 'Appointments',
    eventTypeSuggestions: ['Demos', 'Consultations', 'Pitches'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Sales Reps', 'Account Managers'],
  },
  'Marketing': {
    eventTypeDefault: 'Events',
    eventTypeSuggestions: ['Campaigns', 'Strategy Meetings', 'Workshops'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Marketers', 'Designers', 'Strategists'],
  },
  'Customer Support': {
    eventTypeDefault: 'Service Calls',
    eventTypeSuggestions: ['Support Sessions', 'Follow-ups', 'Ticket Reviews'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Support Agents', 'Technicians'],
  },
  'Information Technology (IT)': {
    eventTypeDefault: 'Services',
    eventTypeSuggestions: ['Audits', 'System Checks', 'Installations'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Engineers', 'Technicians', 'IT Consultants'],
  },
  'Healthcare': {
    eventTypeDefault: 'Consultations',
    eventTypeSuggestions: ['Check-ups', 'Appointments', 'Follow-ups'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Doctors', 'Nurses', 'Practitioners'],
  },
  'Education / Training': {
    eventTypeDefault: 'Classes',
    eventTypeSuggestions: ['Courses', 'Tutorials', 'Workshops'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Teachers', 'Instructors', 'Tutors'],
  },
  'Finance / Accounting': {
    eventTypeDefault: 'Consultations',
    eventTypeSuggestions: ['Reviews', 'Audits', 'Advisory Sessions'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Accountants', 'Financial Advisors'],
  },
  'Real Estate': {
    eventTypeDefault: 'Viewings',
    eventTypeSuggestions: ['Inspections', 'Appointments', 'Consultations'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Agents', 'Property Managers'],
  },
  'Travel / Hospitality': {
    eventTypeDefault: 'Bookings',
    eventTypeSuggestions: ['Reservations', 'Tours', 'Consultations'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Travel Agents', 'Coordinators'],
  },
  'Consulting / Professional Services': {
    eventTypeDefault: 'Sessions',
    eventTypeSuggestions: ['Strategy Calls', 'Workshops', 'Reviews'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Consultants', 'Analysts'],
  },
  'Salons & Spa / Personal Care': {
    eventTypeDefault: 'Appointments',
    eventTypeSuggestions: ['Treatments', 'Bookings', 'Sessions'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Stylists', 'Therapists', 'Beauticians'],
  },
  'Fitness / Wellness': {
    eventTypeDefault: 'Sessions',
    eventTypeSuggestions: ['Workouts', 'Assessments', 'Classes'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Trainers', 'Instructors', 'Coaches'],
  },
  'Others': {
    eventTypeDefault: 'Events',
    eventTypeSuggestions: ['Meetings', 'Sessions', 'Custom Type'],
    teamMemberDefault: 'Team Members',
    teamMemberSuggestions: ['Staff', 'Members'],
  },
};

export default function Step4CustomLabels() {
  const { data, updateData, prevStep } = useOnboarding();
  const [eventTypeLabel, setEventTypeLabel] = useState(data.eventTypeLabel || '');
  const [teamMemberLabel, setTeamMemberLabel] = useState(data.teamMemberLabel || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get the selected industry from previous step
  const selectedIndustry = data.industries?.[0] || 'Others';
  const suggestions = LABEL_SUGGESTIONS[selectedIndustry as keyof typeof LABEL_SUGGESTIONS] || LABEL_SUGGESTIONS['Others'];

  // Set default labels based on industry when component mounts or industry changes
  useEffect(() => {
    // Always set to industry defaults when industry is present
    setEventTypeLabel(suggestions.eventTypeDefault);
    setTeamMemberLabel(suggestions.teamMemberDefault);
  }, [selectedIndustry, suggestions.eventTypeDefault, suggestions.teamMemberDefault]);

  const handleCreate = async () => {
    updateData({ eventTypeLabel, teamMemberLabel });
    
    const finalData = {
      ...data,
      eventTypeLabel,
      teamMemberLabel,
    };

    setIsSubmitting(true);

    try {
  const res = await apiRequest('POST', '/api/onboarding', finalData);
  const created = await res.json().catch(() => ({} as any));

      // Persist minimal company profile for the dashboard
      const companyProfile = {
        name: finalData.businessName || 'Your Company',
        industry: finalData.industries?.[0] || 'General',
        eventTypeLabel: finalData.eventTypeLabel,
        teamMemberLabel: finalData.teamMemberLabel,
        availableDays: finalData.availableDays,
        availableTimeStart: finalData.availableTimeStart,
        availableTimeEnd: finalData.availableTimeEnd,
        currency: finalData.currency || 'INR',
  id: created?.id || undefined,
      };
      try {
        localStorage.setItem('zervos_company', JSON.stringify(companyProfile));
      } catch {}

      toast({
        title: 'Success!',
        description: 'Your account has been created successfully.',
      });

  // Redirect to dashboard
  setLocation('/dashboard');
    } catch (error) {
      console.error('Error creating onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <p className="text-sm text-muted-foreground">
          Customize how you refer to your services and team for <span className="font-medium">{selectedIndustry}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="eventType" className="text-sm font-medium">
            How would you like to label your Event Types? <span className="text-destructive">*</span>
          </Label>
          <Input
            id="eventType"
            placeholder={suggestions.eventTypeDefault}
            value={eventTypeLabel}
            onChange={(e) => setEventTypeLabel(e.target.value)}
            data-testid="input-event-type-label"
            className="h-11"
          />
          <div className="flex items-start gap-2 mt-2 p-3 bg-muted/50 rounded-md">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Suggestions for {selectedIndustry}:</p>
              <p>{suggestions.eventTypeSuggestions.join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamMember" className="text-sm font-medium">
            How would you like to label your Team Members? <span className="text-destructive">*</span>
          </Label>
          <Input
            id="teamMember"
            placeholder={suggestions.teamMemberDefault}
            value={teamMemberLabel}
            onChange={(e) => setTeamMemberLabel(e.target.value)}
            data-testid="input-team-member-label"
            className="h-11"
          />
          <div className="flex items-start gap-2 mt-2 p-3 bg-muted/50 rounded-md">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Suggestions for {selectedIndustry}:</p>
              <p>{suggestions.teamMemberSuggestions.join(', ')}</p>
            </div>
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
          onClick={handleCreate}
          disabled={!eventTypeLabel.trim() || !teamMemberLabel.trim() || isSubmitting}
          data-testid="button-create"
          className="min-w-32"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </div>
  );
}
