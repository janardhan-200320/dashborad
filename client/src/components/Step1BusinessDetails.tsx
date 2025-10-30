import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
];

export default function Step1BusinessDetails() {
  const { data, updateData, nextStep } = useOnboarding();
  const [businessName, setBusinessName] = useState(data.businessName);
  const [websiteUrl, setWebsiteUrl] = useState(data.websiteUrl);
  const [currency, setCurrency] = useState(data.currency);

  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return url.match(/^https?:\/\/.+\..+/) !== null;
    }
  };

  const isFormValid = businessName.trim() !== '' && isValidUrl(websiteUrl) && currency !== '';

  const handleNext = () => {
    updateData({ businessName, websiteUrl, currency });
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg text-muted-foreground mb-2">
          Welcome to Zervos Bookings, Bharath Reddy!
        </h2>
        <h1 className="text-3xl font-semibold text-foreground">Let's get you meeting ready!</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium">
            Business name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            placeholder="Enter Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            data-testid="input-business-name"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium">
            Your business website
          </Label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 bg-muted border border-input rounded-lg text-sm text-muted-foreground h-11">
              https://
            </div>
            <Input
              id="website"
              placeholder="sample.com"
              value={websiteUrl.replace(/^https?:\/\//, '')}
              onChange={(e) => {
                const value = e.target.value;
                setWebsiteUrl(value.startsWith('http') ? value : `https://${value}`);
              }}
              data-testid="input-website-url"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-medium">
            Currency {data.currency && `(${data.currency})`}
          </Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency" data-testid="select-currency" className="h-11">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  {curr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
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
