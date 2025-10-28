import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import ChipSelector from './ChipSelector';

const industries = [
  'HR',
  'Sales',
  'Marketing',
  'Customer support',
  'Information Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Real Estate',
  'Travel',
  'Consulting Firms',
  'Professional Services',
  'Salons & Spa',
  'Fitness',
  'Others',
];

const businessNeeds = [
  'Recruitment Strategy Meeting',
  'Onboarding',
  'Performance Management',
  'Training Session',
  'Employee Engagement',
  'Compliance Review',
];

export default function Step2IndustryNeeds() {
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(data.industries);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(data.businessNeeds);

  const isFormValid = selectedIndustries.length > 0;

  const handleNext = () => {
    updateData({ industries: selectedIndustries, businessNeeds: selectedNeeds });
    nextStep();
  };

  const handleBack = () => {
    updateData({ industries: selectedIndustries, businessNeeds: selectedNeeds });
    prevStep();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <ChipSelector
          options={industries}
          selected={selectedIndustries}
          onChange={setSelectedIndustries}
          label="Which industry best describes your business?"
        />

        <ChipSelector
          options={businessNeeds}
          selected={selectedNeeds}
          onChange={setSelectedNeeds}
          label="...and what specific needs are you trying to address?"
        />
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
