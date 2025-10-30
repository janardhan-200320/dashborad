import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search, 
  Building2, 
  Clock, 
  Globe, 
  UserCheck, 
  Users, 
  Folder, 
  Package, 
  MapPin, 
  UsersRound, 
  BarChart3, 
  Zap, 
  Calendar, 
  Video, 
  Briefcase, 
  CreditCard, 
  Link2, 
  Bell, 
  Tag, 
  Shield, 
  Lock, 
  Key, 
  Download,
  ChevronRight
} from 'lucide-react';
import { useLocation } from 'wouter';

interface SettingCard {
  icon: any;
  title: string;
  options: string[];
}

interface SettingSection {
  title: string;
  cards: SettingCard[];
}

export default function AdminCenterPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const sections: SettingSection[] = [
    {
      title: 'Organization',
      cards: [
        {
          icon: Building2,
          title: 'Basic Information',
          options: ['Company name', 'Industry type', 'Contact details', 'Logo & branding']
        },
        {
          icon: Clock,
          title: 'Business Hours',
          options: ['Working days', 'Operating hours', 'Timezone settings', 'Holiday calendar']
        },
        {
          icon: Globe,
          title: 'Business Booking Page',
          options: ['Public page URL', 'Page customization', 'SEO settings', 'Social media links']
        },
        {
          icon: UserCheck,
          title: 'Customer Login Preferences',
          options: ['Login requirements', 'Guest booking', 'Account creation', 'Password policies']
        },
        {
          icon: Users,
          title: 'Salespersons',
          options: ['Manage team', 'Roles & permissions', 'Availability', 'Performance metrics']
        }
      ]
    },
    {
      title: 'Modules',
      cards: [
        {
          icon: Folder,
          title: 'Workspaces',
          options: ['Create workspace', 'Manage teams', 'Workspace settings', 'Access control']
        },
        {
          icon: Package,
          title: 'Resources',
          options: ['Equipment', 'Meeting rooms', 'Shared resources', 'Resource scheduling']
        },
        {
          icon: MapPin,
          title: 'In-person Locations',
          options: ['Office addresses', 'Meeting venues', 'Directions', 'Location availability']
        },
        {
          icon: UsersRound,
          title: 'Customers',
          options: ['Customer database', 'Contact management', 'Booking history', 'Customer tags']
        },
        {
          icon: BarChart3,
          title: 'Reports',
          options: ['Booking analytics', 'Revenue reports', 'Performance metrics', 'Export data']
        }
      ]
    },
    {
      title: 'Integrations',
      cards: [
        {
          icon: Zap,
          title: 'Most Popular',
          options: ['Zapier', 'Webhooks', 'API access', 'Make (Integromat)']
        },
        {
          icon: Calendar,
          title: 'Calendars',
          options: ['Google Calendar', 'Outlook Calendar', 'Apple Calendar', 'CalDAV sync']
        },
        {
          icon: Video,
          title: 'Video Conferencing',
          options: ['Zoom', 'Microsoft Teams', 'Google Meet', 'Custom video links']
        },
        {
          icon: Briefcase,
          title: 'CRM & Sales',
          options: ['Salesforce', 'HubSpot', 'Zoho CRM', 'Pipedrive']
        },
        {
          icon: CreditCard,
          title: 'Payments',
          options: ['Stripe', 'PayPal', 'Razorpay', 'Square']
        }
      ]
    },
    {
      title: 'Product Customizations',
      cards: [
        {
          icon: Link2,
          title: 'Custom Domain',
          options: ['Domain setup', 'SSL certificate', 'DNS configuration', 'Subdomain settings']
        },
        {
          icon: Bell,
          title: 'In-product Notifications',
          options: ['Email templates', 'SMS notifications', 'Push notifications', 'Notification rules']
        },
        {
          icon: Tag,
          title: 'Custom Labels',
          options: ['Service labels', 'Team member labels', 'Status labels', 'Custom fields']
        },
        {
          icon: Shield,
          title: 'Roles and Permissions',
          options: ['User roles', 'Access levels', 'Permission groups', 'Custom roles']
        }
      ]
    },
    {
      title: 'Data Administration',
      cards: [
        {
          icon: Lock,
          title: 'Privacy and Security',
          options: ['Data protection', 'GDPR compliance', 'Privacy policy', 'Cookie settings']
        },
        {
          icon: Key,
          title: 'Domain Authentication',
          options: ['SSO setup', 'SAML configuration', 'OAuth settings', 'Two-factor auth']
        },
        {
          icon: Download,
          title: 'Export',
          options: ['Export bookings', 'Export customers', 'Bulk export', 'Scheduled exports']
        }
      ]
    }
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    cards: section.cards.filter(card => 
      searchQuery === '' || 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.options.some(option => option.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(section => section.cards.length > 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Center</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your booking system settings and configurations</p>
              </div>
            </div>
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
              <p className="text-gray-600">Try searching with different keywords</p>
            </div>
          ) : (
            filteredSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.cards.map((card, cardIndex) => {
                    const Icon = card.icon;
                    return (
                      <div 
                        key={cardIndex}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                              <Icon size={24} className="text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{card.title}</h3>
                          </div>
                          <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </div>
                        <ul className="space-y-2">
                          {card.options.map((option, optionIndex) => (
                            <li 
                              key={optionIndex}
                              className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-purple-400 transition-colors"></div>
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
