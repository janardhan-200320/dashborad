import Step4CustomLabels from '../Step4CustomLabels';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function Step4CustomLabelsExample() {
  return (
    <OnboardingProvider>
      <div className="w-full max-w-2xl p-8 bg-background">
        <Step4CustomLabels />
      </div>
    </OnboardingProvider>
  );
}
