import SidebarPreview from '../SidebarPreview';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function SidebarPreviewExample() {
  return (
    <OnboardingProvider>
      <div className="w-80 p-6 bg-background">
        <SidebarPreview />
      </div>
    </OnboardingProvider>
  );
}
