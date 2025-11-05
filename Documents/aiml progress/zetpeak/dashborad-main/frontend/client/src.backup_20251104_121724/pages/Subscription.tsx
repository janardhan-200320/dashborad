import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Check, 
  Zap, 
  Users, 
  Building2, 
  Inbox, 
  TrendingUp,
  Crown,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SubscriptionPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState('Premium Trial');
  const [usageData, setUsageData] = useState({
    salespersons: { current: 1, max: 10 },
    workspaces: { current: 1, max: 3 },
    resources: { current: 0, max: 10 }
  });

  useEffect(() => {
    const subscriptionData = localStorage.getItem('zervos_subscription');
    if (subscriptionData) {
      const data = JSON.parse(subscriptionData);
      setCurrentPlan(data.type);
      setUsageData({
        salespersons: data.salespersons,
        workspaces: data.workspaces,
        resources: data.resources
      });
    }
  }, []);

  const plans: SubscriptionPlan[] = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '1 Salesperson',
        '1 Workspace',
        '5 Resources',
        'Basic booking pages',
        'Email support',
        '1 GB storage'
      ],
      isCurrent: currentPlan === 'Free'
    },
    {
      name: 'Premium',
      price: '$29',
      period: 'per month',
      features: [
        '10 Salespersons',
        '3 Workspaces',
        '10 Resources',
        'Advanced workflows',
        'Priority support',
        '10 GB storage',
        'Custom branding',
        'Analytics & reports'
      ],
      isPopular: true,
      isCurrent: currentPlan === 'Premium Trial'
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      features: [
        'Unlimited Salespersons',
        'Unlimited Workspaces',
        'Unlimited Resources',
        'Advanced workflows',
        '24/7 dedicated support',
        'Unlimited storage',
        'White-label solution',
        'Custom integrations',
        'SLA guarantee',
        'Custom domain'
      ],
      isCurrent: currentPlan === 'Enterprise'
    }
  ];

  const calculateProgress = (current: number, max: number) => {
    return (current / max) * 100;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
          <p className="text-gray-600 mt-1">Manage your subscription plan and billing details</p>
        </div>

        {/* Current Plan Overview */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Current Plan: {currentPlan}
                </CardTitle>
                <CardDescription>Your subscription details and usage</CardDescription>
              </div>
              <Badge className="bg-blue-600 text-white">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Salespersons</span>
                  <span className="text-gray-900 font-semibold">
                    {usageData.salespersons.current}/{usageData.salespersons.max}
                  </span>
                </div>
                <Progress value={calculateProgress(usageData.salespersons.current, usageData.salespersons.max)} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Workspaces</span>
                  <span className="text-gray-900 font-semibold">
                    {usageData.workspaces.current}/{usageData.workspaces.max}
                  </span>
                </div>
                <Progress value={calculateProgress(usageData.workspaces.current, usageData.workspaces.max)} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Resources</span>
                  <span className="text-gray-900 font-semibold">
                    {usageData.resources.current}/{usageData.resources.max}
                  </span>
                </div>
                <Progress value={calculateProgress(usageData.resources.current, usageData.resources.max)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative ${
                  plan.isPopular ? 'border-2 border-blue-500 shadow-lg' : ''
                } ${plan.isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.isCurrent ? "outline" : "default"}
                    disabled={plan.isCurrent}
                  >
                    {plan.isCurrent ? 'Current Plan' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">•••• •••• •••• 4242</p>
                  <p className="text-xs text-gray-500">Expires 12/2025</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your recent invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">October 2025</p>
                    <p className="text-xs text-gray-500">Paid on Oct 1, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">$29.00</p>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">September 2025</p>
                    <p className="text-xs text-gray-500">Paid on Sep 1, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">$29.00</p>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
