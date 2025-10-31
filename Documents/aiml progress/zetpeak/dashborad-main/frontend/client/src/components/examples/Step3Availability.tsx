import Step3Availability from '../Step3Availability';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function Step3AvailabilityExample() {
  return (
    <OnboardingProvider>
      <div className="w-full max-w-2xl p-8 bg-background">
        <Step3Availability />
      </div>
    </OnboardingProvider>
  );
}
