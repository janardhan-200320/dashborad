import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Calendar,
  Users,
  BarChart3,
  Home,
  Settings,
  Building2,
  Clock3,
  PhoneCall,
  LayoutGrid,
  FileText,
  LogOut,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

type CompanyProfile = {
  name: string;
  industry: string;
  eventTypeLabel: string;
  teamMemberLabel: string;
  availableDays: string[];
  availableTimeStart: string;
  availableTimeEnd: string;
  currency?: string;
  id?: string;
};

const DEFAULT_COMPANY: CompanyProfile = {
  name: 'Your Company',
  industry: 'General',
  eventTypeLabel: 'Events',
  teamMemberLabel: 'Team',
  availableDays: ['Mon','Tue','Wed','Thu','Fri'],
  availableTimeStart: '09:00 am',
  availableTimeEnd: '06:00 pm',
};

// Define industry-specific widget sets
const WIDGETS_BY_INDUSTRY: Record<string, Array<{ title: string; subtitle?: string }>> = {
  'HR / People & Org': [
    { title: 'Upcoming Interviews' },
    { title: 'Onboarding Pipeline' },
    { title: 'Performance Reviews' },
    { title: 'Engagement Score' },
  ],
  'Sales': [
    { title: 'Leads Today' },
    { title: 'Demo Requests' },
    { title: 'Open Deals' },
    { title: 'Revenue Forecast' },
  ],
  'Marketing': [
    { title: 'Active Campaigns' },
    { title: 'Content Calendar' },
    { title: 'Brand Mentions' },
    { title: 'Social Performance' },
  ],
  'Customer Support': [
    { title: 'Open Tickets' },
    { title: 'CSAT' },
    { title: 'First Response Time' },
    { title: 'Training Sessions' },
  ],
  'Information Technology (IT) Services': [
    { title: 'Active Incidents' },
    { title: 'Deployments' },
    { title: 'System Health' },
    { title: 'Change Requests' },
  ],
  'Healthcare': [
    { title: 'Today\'s Appointments' },
    { title: 'Follow-ups' },
    { title: 'Telemedicine Queue' },
    { title: 'Referral Pipeline' },
  ],
  'Education / Training': [
    { title: 'Enrollments' },
    { title: 'Demo Classes' },
    { title: 'Schedules' },
    { title: 'Curriculum Planner' },
  ],
  'Finance / Accounting': [
    { title: 'Reviews Due' },
    { title: 'Taxes Planner' },
    { title: 'Audits' },
    { title: 'Compliance' },
  ],
  'Real Estate': [
    { title: 'Property Viewings' },
    { title: 'Valuations' },
    { title: 'Broker Onboarding' },
    { title: 'Maintenance' },
  ],
  'Travel / Hospitality': [
    { title: 'Trip Plans' },
    { title: 'Reservations' },
    { title: 'Corporate Reviews' },
    { title: 'Guest Feedback' },
  ],
  'Consulting Firms / Professional Services': [
    { title: 'Strategy Workshops' },
    { title: 'Engagements' },
    { title: 'Change Reviews' },
    { title: 'Implementations' },
  ],
  'Salons & Spa / Personal Care': [
    { title: 'Today\'s Bookings' },
    { title: 'Treatment Plans' },
    { title: 'Packages' },
    { title: 'Reviews' },
  ],
  'Fitness / Wellness': [
    { title: 'Sessions' },
    { title: 'Classes' },
    { title: 'Assessments' },
    { title: 'Nutrition Plans' },
  ],
  'General': [
    { title: 'Appointments' },
    { title: 'Tasks' },
    { title: 'Analytics' },
    { title: 'Recent Activity' },
  ],
};

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border p-4 bg-background">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function currencySymbol(curr?: string) {
  switch (curr) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    case 'INR':
    default:
      return '₹';
  }
}

export default function DashboardPage() {
  const [location, setLocation] = useLocation();
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [activeTab, setActiveTab] = useState<'Bookings'|'Sessions'|'Responses'|'Settings'>('Bookings');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('zervos_company');
      if (raw) {
        const parsed = JSON.parse(raw) as CompanyProfile;
        setCompany({ ...DEFAULT_COMPANY, ...parsed });
      }
    } catch {}
  }, []);

  const widgets = useMemo(() => {
    return WIDGETS_BY_INDUSTRY[company.industry] || WIDGETS_BY_INDUSTRY['General'];
  }, [company.industry]);

  return (
    <div className="min-h-screen bg-muted/10 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-background border-r border-border hidden md:flex flex-col">
        <div className="h-14 px-4 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="font-semibold">Zervos</div>
        </div>
        <nav className="p-3 space-y-1 text-sm">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${location === '/dashboard' ? 'bg-primary/10 text-primary font-medium' : ''}`}
            onClick={() => setLocation('/dashboard')}
          >
            <Home className="w-4 h-4" /> Dashboard
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${location.startsWith('/dashboard/appointments') ? 'bg-muted/30' : 'hover:bg-muted/30 cursor-pointer'}`}
            onClick={() => setLocation('/dashboard/appointments')}
          >
            <Calendar className="w-4 h-4" /> Appointments
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${location.startsWith('/dashboard/callbacks') ? 'bg-muted/30' : 'hover:bg-muted/30 cursor-pointer'}`}
            onClick={() => setLocation('/dashboard/callbacks')}
          >
            <PhoneCall className="w-4 h-4" /> Call-backs
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${location.startsWith('/dashboard/timeslots') ? 'bg-muted/30' : 'hover:bg-muted/30 cursor-pointer'}`}
            onClick={() => setLocation('/dashboard/timeslots')}
          >
            <LayoutGrid className="w-4 h-4" /> Timeslots
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${location.startsWith('/dashboard/calendar') ? 'bg-muted/30' : 'hover:bg-muted/30 cursor-pointer'}`}
            onClick={() => setLocation('/dashboard/calendar')}
          >
            <Clock3 className="w-4 h-4" /> Calendar
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${location.startsWith('/dashboard/settings') ? 'bg-muted/30' : 'hover:bg-muted/30 cursor-pointer'}`}
            onClick={() => setLocation('/dashboard/settings')}
          >
            <Settings className="w-4 h-4" /> Own-Settings
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${location.startsWith('/dashboard/form-info') ? 'bg-muted/30' : 'hover:bg-muted/30 cursor-pointer'}`}
            onClick={() => setLocation('/dashboard/form-info')}
          >
            <FileText className="w-4 h-4" /> Form Info
          </div>
        </nav>
        <div className="mt-auto p-3 border-t border-border space-y-2">
          <div className="text-xs text-muted-foreground">Admin User</div>
          <button className="w-full px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-background border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-semibold">{company.name}</div>
                <div className="text-xs text-muted-foreground">{company.industry}</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">{company.eventTypeLabel}</span>
              <span className="text-muted-foreground">{company.teamMemberLabel}</span>
              <span className="text-muted-foreground">{company.availableTimeStart} - {company.availableTimeEnd}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-border">
            {(['Bookings','Sessions','Responses','Settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-1 pb-2 -mb-px border-b-2 text-sm ${activeTab===tab ? 'border-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >{tab}</button>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input placeholder="Search by Product Title" className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Upcoming (0)','Important (1)','Recurring (0)','Completed (8)','Cancelled (0)'].map(f => (
                <span key={f} className="px-3 py-1 rounded-full border bg-background">{f}</span>
              ))}
            </div>
          </div>

          {/* Main two-column area */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr,360px] gap-6">
            {/* Left: bookings list placeholder */}
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-lg border border-border bg-background">
                  <div className="p-4 border-b border-border text-xs text-muted-foreground">Tuesday, 05 Aug 2025 • 07:00pm - 07:30pm</div>
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">Booking with Ajay N (30 mins)</div>
                      <div className="text-xs text-muted-foreground mt-1">Google Meet • {company.industry}</div>
                    </div>
                    <button className="text-sm px-3 py-1 rounded-md border hover:bg-muted/20">Edit</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: KPIs and share card */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <KPI label="Total Bookings" value={8} />
                <KPI label="Amount Earned" value={`${currencySymbol(company.currency)}3000`} />
                <KPI label="Total views" value={169} />
                <KPI label="Conversions" value={`4.1%`} />
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="font-medium mb-2">Share your booking page</div>
                <div className="text-sm text-muted-foreground">View the different ways you can share this.</div>
              </div>
            </div>
          </div>

          {/* Industry widgets */}
          <div className="space-y-3">
            <div className="font-medium">Insights</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {widgets.map((w, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-background p-4">
                  <div className="font-medium mb-2">{w.title}</div>
                  <div className="h-32 bg-muted/30 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Schedule Preview</div>
              <div className="text-xs text-muted-foreground">{company.availableTimeStart} - {company.availableTimeEnd}</div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className={`p-2 rounded ${company.availableDays.includes(d) ? 'bg-primary/10 text-primary font-medium' : 'bg-muted/20'}`}>{d}</div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-2 rounded-md border text-sm hover:bg-muted/20"
              onClick={() => setLocation('/')}
            >
              Back to Onboarding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
