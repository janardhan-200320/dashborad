import ProgressStepper from '../ProgressStepper';

export default function ProgressStepperExample() {
  const steps = [
    {
      number: 1,
      title: 'Business details',
      description: "Tell us about your business, and we'll work our magic.",
    },
    {
      number: 2,
      title: 'Industry details',
      description: "Based on your industry, our AI will set up your dashboard to align with your business.",
    },
    {
      number: 3,
      title: 'Set up your availability',
      description: 'Share your availability and start getting booked.',
    },
    {
      number: 4,
      title: 'Update your custom labels',
      description: 'Rename certain modules in the product to match with your business terminologies.',
    },
  ];

  return (
    <div className="w-80 p-6 bg-background">
      <ProgressStepper currentStep={2} steps={steps} />
    </div>
  );
}
