import Step1BusinessDetails from '../Step1BusinessDetails';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function Step1BusinessDetailsExample() {
  return (
    <OnboardingProvider>
      <div className="w-full max-w-2xl p-8 bg-background">
        <Step1BusinessDetails />
      </div>
    </OnboardingProvider>
  );
}
