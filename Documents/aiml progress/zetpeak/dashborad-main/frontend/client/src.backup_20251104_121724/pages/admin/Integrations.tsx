import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Zap, 
  Calendar, 
  Video, 
  Briefcase, 
  CreditCard, 
  MessageSquare, 
  BarChart3, 
  Share2, 
  HeadphonesIcon,
  FileText,
  Globe,
  Linkedin,
  Twitter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Integration = {
  id: string;
  name: string;
  description: string;
  icon?: any;
  logo?: string;
  connected: boolean;
  actionLabel?: string;
  category: string;
};

type IntegrationsProps = {
  category?: string;
};

export default function Integrations({ category }: IntegrationsProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const [integrations, setIntegrations] = useState<Integration[]>([
    // Most Popular
    { 
      id: 'zedunix', 
      name: 'Zedunix', 
      description: 'Connect your appointments with Zedunix platform for enhanced business management.',
      icon: Globe,
      connected: false,
      category: 'most-popular'
    },
    { 
      id: 'zoho-crm-popular', 
      name: 'Zoho CRM', 
      description: 'Push customer and meetings details to Zoho CRM when an appointment is booked.',
      icon: Zap,
      connected: false,
      category: 'most-popular'
    },

    // Calendars
    { 
      id: 'google-calendar', 
      name: 'Google Calendar', 
      description: 'Manage multiple appointments by syncing your calendar',
      logo: '🗓️',
      connected: false,
      category: 'calendars'
    },
    { 
      id: 'outlook-calendar', 
      name: 'Outlook Calendar', 
      description: 'Manage multiple appointments by syncing your calendar',
      logo: '📅',
      connected: false,
      category: 'calendars'
    },
    { 
      id: 'zoho-calendar', 
      name: 'Zoho Calendar', 
      description: 'Manage multiple appointments by syncing your calendar',
      logo: '📆',
      connected: false,
      category: 'calendars'
    },

    // Video Conferencing
    { 
      id: 'google-meet', 
      name: 'Google Meet', 
      description: 'Automatically creates a Google Meet meeting for every appointment scheduled',
      logo: '🎥',
      connected: false,
      category: 'video-conferencing'
    },
    { 
      id: 'zoom', 
      name: 'Zoom', 
      description: 'Automatically create a Zoom Meeting for every appointment scheduled',
      logo: '📹',
      connected: false,
      category: 'video-conferencing'
    },
    { 
      id: 'microsoft-teams', 
      name: 'Microsoft Teams', 
      description: 'Automatically creates a Microsoft Teams meeting for every appointment scheduled',
      logo: '👥',
      connected: false,
      category: 'video-conferencing'
    },
    { 
      id: 'zoho-meeting', 
      name: 'Zoho Meeting', 
      description: 'Automatically create a Zoho Meeting for every appointment scheduled',
      icon: Video,
      connected: false,
      category: 'video-conferencing'
    },

    // CRM & Sales
    { 
      id: 'zoho-crm', 
      name: 'Zoho CRM', 
      description: 'Push customer and meetings details to Zoho CRM when an appointment is booked.',
      icon: Briefcase,
      connected: false,
      category: 'crm-sales'
    },
    { 
      id: 'bigin', 
      name: 'Bigin', 
      description: 'Create contacts and events in Bigin when an appointment is booked.',
      icon: Briefcase,
      connected: false,
      category: 'crm-sales'
    },
    { 
      id: 'salesforce', 
      name: 'Salesforce', 
      description: 'Push customer and meetings details to Sales Force when an appointment is booked.',
      logo: '☁️',
      connected: false,
      actionLabel: 'Via Zapier',
      category: 'crm-sales'
    },
    { 
      id: 'hubspot', 
      name: 'Hubspot', 
      description: 'Push customer and meetings details to Hubspot when an appointment is booked.',
      logo: '🔶',
      connected: false,
      actionLabel: 'Via Zapier',
      category: 'crm-sales'
    },
    { 
      id: 'pipedrive', 
      name: 'Pipedrive', 
      description: 'Push customer and meetings details to Pipedrive when an appointment is booked.',
      logo: '📊',
      connected: false,
      actionLabel: 'Via Zapier',
      category: 'crm-sales'
    },

    // Payments
    { 
      id: 'razorpay', 
      name: 'Razorpay', 
      description: 'Collect online payments while booking.',
      logo: '💳',
      connected: false,
      category: 'payments'
    },
    { 
      id: 'stripe', 
      name: 'Stripe', 
      description: 'Collect online payments while booking.',
      logo: '💰',
      connected: false,
      category: 'payments'
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      description: 'Collect online payments while booking.',
      logo: '🅿️',
      connected: false,
      category: 'payments'
    },

    // SMS
    { 
      id: 'twilio', 
      name: 'Twilio', 
      description: 'Send SMS alerts to customers and users.',
      logo: '📱',
      connected: false,
      category: 'sms'
    },
    { 
      id: 'clickatell', 
      name: 'Clickatell', 
      description: 'Send SMS alerts to customers and users.',
      logo: '💬',
      connected: false,
      category: 'sms'
    },
    { 
      id: 'holio', 
      name: 'Holio', 
      description: 'Send SMS alerts to customers and users.',
      logo: '📲',
      connected: false,
      category: 'sms'
    },
    { 
      id: 'clockworksms', 
      name: 'ClockWorkSMS', 
      description: 'Send SMS alerts to customers and users.',
      logo: '⏰',
      connected: false,
      category: 'sms'
    },
    { 
      id: 'sms-magic', 
      name: 'SMS-Magic', 
      description: 'Send SMS alerts to customers and users.',
      logo: '✨',
      connected: false,
      category: 'sms'
    },
    { 
      id: 'nexmo', 
      name: 'Nexmo', 
      description: 'Send SMS alerts to customers and users.',
      logo: '📧',
      connected: false,
      category: 'sms'
    },

    // Analytics
    { 
      id: 'google-analytics', 
      name: 'Google Analytics', 
      description: 'Track and understand how customers interact with your booking page using Google Analytics.',
      icon: BarChart3,
      connected: false,
      category: 'analytics'
    },

    // Connectors
    { 
      id: 'whatsapp', 
      name: 'WhatsApp', 
      description: 'Send WhatsApp notifications and reminders to both customers and users directly.',
      icon: MessageSquare,
      connected: false,
      category: 'connectors'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      description: 'Integrate an app with Bookings through LinkedIn for professional networking.',
      icon: Linkedin,
      connected: false,
      category: 'connectors'
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      description: 'Integrate an app with Bookings through Twitter for social engagement.',
      icon: Twitter,
      connected: false,
      category: 'connectors'
    },
    { 
      id: 'zoho-flow', 
      name: 'Zoho Flow', 
      description: 'Automate business processes by integrating any app with Bookings.',
      icon: Share2,
      connected: false,
      category: 'connectors'
    },
    { 
      id: 'zapier', 
      name: 'Zapier', 
      description: 'Integrate an app with Bookings through Zapier.',
      icon: Zap,
      connected: false,
      category: 'connectors'
    },

    // Support
    { 
      id: 'help-desk', 
      name: 'Help Desk', 
      description: 'Provide customer support and manage tickets directly from your booking system.',
      icon: HeadphonesIcon,
      connected: false,
      actionLabel: 'Install',
      category: 'support'
    },
    { 
      id: 'zoho-desk', 
      name: 'Zoho Desk', 
      description: 'Speed up resolution time by adding the Bookings extension to Desk for customer scheduling.',
      icon: HeadphonesIcon,
      connected: false,
      actionLabel: 'Install',
      category: 'support'
    },
    { 
      id: 'sales-iq', 
      name: 'Sales IQ', 
      description: 'Allow customers to book appointments directly from the chat window.',
      icon: MessageSquare,
      connected: false,
      actionLabel: 'Learn How',
      category: 'support'
    },
    { 
      id: 'zoho-assist', 
      name: 'Zoho Assist', 
      description: 'Automatically create a screen sharing or remote support session for every appointment scheduled',
      icon: Video,
      connected: false,
      category: 'support'
    },

    // Accounting & Invoices
    { 
      id: 'zoho-books', 
      name: 'Zoho Books', 
      description: 'Create and send invoices from Zoho Books for unpaid appointments that are scheduled via Zoho Bookings.',
      icon: FileText,
      connected: false,
      actionLabel: 'Install',
      category: 'accounting'
    },
    { 
      id: 'quickbooks', 
      name: 'QuickBooks', 
      description: 'Sync your appointments with QuickBooks for automated invoicing and accounting.',
      icon: FileText,
      connected: false,
      category: 'accounting'
    },
    { 
      id: 'xero', 
      name: 'Xero', 
      description: 'Connect with Xero for seamless invoice generation and financial tracking.',
      icon: FileText,
      connected: false,
      category: 'accounting'
    },
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, connected: !int.connected } : int
    ));
    
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      toast({
        title: integration.connected ? "Disconnected" : "Connected",
        description: `${integration.name} has been ${integration.connected ? 'disconnected' : 'connected'} successfully.`
      });
    }
  };

  const categories = [
    { id: 'most-popular', title: 'Most Popular', icon: Zap },
    { id: 'calendars', title: 'Calendars', icon: Calendar },
    { id: 'video-conferencing', title: 'Video Conferencing', icon: Video },
    { id: 'crm-sales', title: 'CRM & Sales', icon: Briefcase },
    { id: 'payments', title: 'Payments', subtitle: 'Powered by Zoho Checkout', icon: CreditCard },
    { id: 'sms', title: 'SMS', icon: MessageSquare },
    { id: 'analytics', title: 'Analytics', icon: BarChart3 },
    { id: 'connectors', title: 'Connectors', icon: Share2 },
    { id: 'support', title: 'Support', icon: HeadphonesIcon },
    { id: 'accounting', title: 'Accounting & Invoices', icon: FileText },
  ];

  const filteredIntegrations = integrations.filter(int => {
    // Filter by category if provided
    if (category && int.category !== category) {
      return false;
    }
    // Filter by search query
    if (searchQuery && 
        !int.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !int.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Get the current category details
  const currentCategory = categories.find(cat => cat.id === category);
  const displayTitle = currentCategory ? currentCategory.title : 'Integrations';

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{displayTitle}</h1>
            {currentCategory?.subtitle && (
              <p className="text-sm text-gray-500 mt-1">| {currentCategory.subtitle}</p>
            )}
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              className="pl-10"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {category ? (
            // Single category view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => {
                const IconComponent = integration.icon;
                return (
                  <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {integration.logo ? (
                            <div className="text-4xl">{integration.logo}</div>
                          ) : IconComponent ? (
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <IconComponent size={24} className="text-blue-600" />
                            </div>
                          ) : null}
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            {integration.actionLabel && (
                              <p className="text-xs text-blue-600 mt-1">{integration.actionLabel}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant={integration.connected ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleConnection(integration.id)}
                          className={integration.connected ? "text-blue-600 border-blue-600" : "bg-blue-600 hover:bg-blue-700"}
                        >
                          {integration.connected ? "Connected" : "Connect"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // All categories view
            <div className="space-y-12">
              {categories.map((cat) => {
                const categoryIntegrations = filteredIntegrations.filter(
                  int => int.category === cat.id
                );

                if (categoryIntegrations.length === 0) return null;

                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-2 mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">{cat.title}</h2>
                      {cat.subtitle && (
                        <span className="text-sm text-gray-500">| {cat.subtitle}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryIntegrations.map((integration) => {
                        const IconComponent = integration.icon;
                        return (
                          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  {integration.logo ? (
                                    <div className="text-4xl">{integration.logo}</div>
                                  ) : IconComponent ? (
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                      <IconComponent size={24} className="text-blue-600" />
                                    </div>
                                  ) : null}
                                  <div>
                                    <CardTitle className="text-base">{integration.name}</CardTitle>
                                    {integration.actionLabel && (
                                      <p className="text-xs text-blue-600 mt-1">{integration.actionLabel}</p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant={integration.connected ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => toggleConnection(integration.id)}
                                  className={integration.connected ? "text-blue-600 border-blue-600" : "bg-blue-600 hover:bg-blue-700"}
                                >
                                  {integration.connected ? "Connected" : "Connect"}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="text-sm">
                                {integration.description}
                              </CardDescription>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
              <p className="text-gray-600">Try searching with different keywords</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
