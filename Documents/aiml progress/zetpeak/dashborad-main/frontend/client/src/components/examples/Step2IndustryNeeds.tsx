import Step2IndustryNeeds from '../Step2IndustryNeeds';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function Step2IndustryNeedsExample() {
  return (
    <OnboardingProvider>
      <div className="w-full max-w-2xl p-8 bg-background">
        <Step2IndustryNeeds />
      </div>
    </OnboardingProvider>
  );
}
