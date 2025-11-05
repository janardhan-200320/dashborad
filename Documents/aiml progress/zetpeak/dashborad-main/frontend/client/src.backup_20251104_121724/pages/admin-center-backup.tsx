import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, Search, Building2, Clock, Globe, UserCheck, Users, Folder, Package, 
  MapPin, UsersRound, BarChart3, Zap, Calendar, Video, Briefcase, CreditCard, 
  Link2, Bell, Tag, Shield, Save, X, Plus, Trash2, Check, FileDown, FileUp, 
  ChevronRight, Lock, Key, Download, Edit, Loader2, ExternalLink, Mail, Phone,
  MapPinIcon, Copy, Info, Settings, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type AdminSection = 'basic-info' | 'business-hours' | 'booking-page' | 'login-prefs' | 'salespersons' |
  'workspaces' | 'resources' | 'locations' | 'customers' | 'reports' |
  'integrations' | 'customizations' | 'data-admin';

type SettingCard = {
  icon: any;
  title: string;
  options: string[];
  category?: string;
}

export default function AdminCenterPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSection, setCurrentSection] = useState<AdminSection>('basic-info');
  const [organizationExpanded, setOrganizationExpanded] = useState(true);
  const [modulesExpanded, setModulesExpanded] = useState(false);
  const [integrationsExpanded, setIntegrationsExpanded] = useState(false);
  const [customizationsExpanded, setCustomizationsExpanded] = useState(false);
  const [dataAdminExpanded, setDataAdminExpanded] = useState(false);
  const { toast } = useToast();
  
  // Modals
  const [editBasicInfoOpen, setEditBasicInfoOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [notificationPreviewOpen, setNotificationPreviewOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [moduleViewOpen, setModuleViewOpen] = useState(false);
  const [moduleViewType, setModuleViewType] = useState<'workspaces' | 'resources' | 'locations' | 'customers' | 'reports' | null>(null);
  const [connectingIntegration, setConnectingIntegration] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<SettingCard | null>(null);
  
  const [orgSettings, setOrgSettings] = useState({
    companyName: 'bharath',
    industry: 'Technology',
    email: '',
    phone: '',
    logo: '',
    brandColor: '#6366f1',
    timezone: 'Asia/Kolkata',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    bookingUrl: 'bharath',
    metaTitle: 'Book an appointment',
    metaDescription: 'Schedule a meeting with our team',
    allowGuestBooking: true,
    requireLogin: false,
    currency: 'INR',
    timeFormat: '12',
    startOfWeek: 'Monday',
    zohoBranding: true,
  });

  const [integrations, setIntegrations] = useState([
    { id: '1', name: 'Google Calendar', type: 'calendar', connected: false, icon: Calendar },
    { id: '2', name: 'Outlook Calendar', type: 'calendar', connected: false, icon: Calendar },
    { id: '3', name: 'Zoom', type: 'video', connected: false, icon: Video },
    { id: '4', name: 'Google Meet', type: 'video', connected: false, icon: Video },
    { id: '5', name: 'Stripe', type: 'payment', connected: false, icon: CreditCard },
    { id: '6', name: 'Razorpay', type: 'payment', connected: false, icon: CreditCard },
    { id: '7', name: 'Zapier', type: 'automation', connected: false, icon: Zap },
    { id: '8', name: 'Webhooks', type: 'automation', connected: false, icon: Link2 },
  ]);

  const [workspaces, setWorkspaces] = useState([
    { id: '1', name: 'Main Workspace', members: 5, active: true },
  ]);

  const [resources, setResources] = useState([
    { id: '1', name: 'Conference Room A', type: 'room', available: true },
    { id: '2', name: 'Projector', type: 'equipment', available: true },
  ]);

  const [locations, setLocations] = useState([
    { id: '1', name: 'Main Office', address: '123 Business St, City', active: true },
  ]);

  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });
  const [newResource, setNewResource] = useState({ name: '', type: 'room' });
  const [newLocation, setNewLocation] = useState({ name: '', address: '', directions: '' });

  // If URL contains a module keyword, open the modules page automatically.
  useEffect(() => {
    if (!location) return;
    const path = location.toLowerCase();
    if (path.includes('workspaces')) {
      setModuleViewType('workspaces');
      setModuleViewOpen(true);
    } else if (path.includes('resources')) {
      setModuleViewType('resources');
      setModuleViewOpen(true);
    } else if (path.includes('locations')) {
      setModuleViewType('locations');
      setModuleViewOpen(true);
    } else if (path.includes('customers')) {
      setModuleViewType('customers');
      setModuleViewOpen(true);
    } else if (path.includes('reports')) {
      setModuleViewType('reports');
      setModuleViewOpen(true);
    }
  }, [location]);

  useEffect(() => {
    const saved = localStorage.getItem('zervos_admin_settings');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.orgSettings) setOrgSettings(data.orgSettings);
      if (data.integrations) setIntegrations(data.integrations);
      if (data.workspaces) setWorkspaces(data.workspaces);
      if (data.resources) setResources(data.resources);
      if (data.locations) setLocations(data.locations);
    }
  }, []);

  const saveSettings = () => {
    const data = { orgSettings, integrations, workspaces, resources, locations };
    localStorage.setItem('zervos_admin_settings', JSON.stringify(data));
    toast({ title: "Settings saved", description: "All changes have been saved successfully" });
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, connected: !int.connected } : int
    ));
  };

  const addWorkspace = () => {
    if (!newWorkspace.name) return;
    setWorkspaces(prev => [...prev, { 
      id: Date.now().toString(), 
      name: newWorkspace.name, 
      members: 0, 
      active: true 
    }]);
    setNewWorkspace({ name: '', description: '' });
  };

  const addResource = () => {
    if (!newResource.name) return;
    setResources(prev => [...prev, { 
      id: Date.now().toString(), 
      ...newResource, 
      available: true 
    }]);
    setNewResource({ name: '', type: 'room' });
  };

  const addLocation = () => {
    if (!newLocation.name) return;
    setLocations(prev => [...prev, { 
      id: Date.now().toString(), 
      ...newLocation, 
      active: true 
    }]);
    setNewLocation({ name: '', address: '', directions: '' });
  };

  const exportSettings = () => {
    const data = { orgSettings, integrations, workspaces, resources, locations };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'zervos_settings.json';
    link.click();
    toast({ title: "Settings exported", description: "Configuration file downloaded" });
  };

  const importSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.orgSettings) setOrgSettings(data.orgSettings);
        if (data.integrations) setIntegrations(data.integrations);
        if (data.workspaces) setWorkspaces(data.workspaces);
        if (data.resources) setResources(data.resources);
        if (data.locations) setLocations(data.locations);
        saveSettings();
        toast({ title: "Settings imported", description: "Configuration restored successfully" });
      } catch {
        toast({ title: "Import failed", description: "Invalid configuration file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const sections = [
    {
      title: 'Organization',
      cards: [
        { icon: Building2, title: 'Basic Information', options: ['Company name', 'Industry type', 'Contact details', 'Logo & branding'], category: 'organization' },
        { icon: Clock, title: 'Business Hours', options: ['Working days', 'Operating hours', 'Timezone settings', 'Holiday calendar'], category: 'organization' },
        { icon: Globe, title: 'Business Booking Page', options: ['Public page URL', 'Page customization', 'SEO settings', 'Social media links'], category: 'organization' },
        { icon: UserCheck, title: 'Customer Login Preferences', options: ['Login requirements', 'Guest booking', 'Account creation', 'Password policies'], category: 'organization' },
        { icon: Users, title: 'Salespersons', options: ['Manage team', 'Roles & permissions', 'Availability', 'Performance metrics'], category: 'organization' }
      ]
    },
    {
      title: 'Modules',
      cards: [
        { icon: Folder, title: 'Workspaces', options: ['Create workspace', 'Manage teams', 'Workspace settings', 'Access control'], category: 'modules' },
        { icon: Package, title: 'Resources', options: ['Equipment', 'Meeting rooms', 'Shared resources', 'Resource scheduling'], category: 'modules' },
        { icon: MapPin, title: 'In-person Locations', options: ['Office addresses', 'Meeting venues', 'Directions', 'Location availability'], category: 'modules' },
        { icon: UsersRound, title: 'Customers', options: ['Customer database', 'Contact management', 'Booking history', 'Customer tags'], category: 'modules' },
        { icon: BarChart3, title: 'Reports', options: ['Booking analytics', 'Revenue reports', 'Performance metrics', 'Export data'], category: 'modules' }
      ]
    },
    {
      title: 'Integrations',
      cards: [
        { icon: Zap, title: 'Most Popular', options: ['Zapier', 'Webhooks', 'API access', 'Make (Integromat)'], category: 'integrations' },
        { icon: Calendar, title: 'Calendars', options: ['Google Calendar', 'Outlook Calendar', 'Apple Calendar', 'CalDAV sync'], category: 'integrations' },
        { icon: Video, title: 'Video Conferencing', options: ['Zoom', 'Microsoft Teams', 'Google Meet', 'Custom video links'], category: 'integrations' },
        { icon: Briefcase, title: 'CRM & Sales', options: ['Salesforce', 'HubSpot', 'Zoho CRM', 'Pipedrive'], category: 'integrations' },
        { icon: CreditCard, title: 'Payments', options: ['Stripe', 'PayPal', 'Razorpay', 'Square'], category: 'integrations' }
      ]
    },
    {
      title: 'Product Customizations',
      cards: [
        { icon: Link2, title: 'Custom Domain', options: ['Domain setup', 'SSL certificate', 'DNS configuration', 'Subdomain settings'], category: 'customization' },
        { icon: Bell, title: 'In-product Notifications', options: ['Email templates', 'SMS notifications', 'Push notifications', 'Notification rules'], category: 'customization' },
        { icon: Tag, title: 'Custom Labels', options: ['Service labels', 'Team member labels', 'Status labels', 'Custom fields'], category: 'customization' },
        { icon: Shield, title: 'Roles and Permissions', options: ['User roles', 'Access levels', 'Permission groups', 'Custom roles'], category: 'customization' }
      ]
    },
    {
      title: 'Data Administration',
      cards: [
        { icon: Lock, title: 'Privacy and Security', options: ['Data protection', 'GDPR compliance', 'Privacy policy', 'Cookie settings'], category: 'data' },
        { icon: Key, title: 'Domain Authentication', options: ['SSO setup', 'SAML configuration', 'OAuth settings', 'Two-factor auth'], category: 'data' },
        { icon: Download, title: 'Export', options: ['Export bookings', 'Export customers', 'Bulk export', 'Scheduled exports'], category: 'data' }
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

  const handleCardClick = (card: SettingCard) => {
    // If user clicks a modules card, open the full modules view (matching screenshots)
    if (card.category === 'modules') {
      const key = card.title.toLowerCase().includes('workspace') ? 'workspaces'
        : card.title.toLowerCase().includes('resource') ? 'resources'
        : card.title.toLowerCase().includes('location') ? 'locations'
        : card.title.toLowerCase().includes('customer') ? 'customers'
        : card.title.toLowerCase().includes('report') ? 'reports'
        : null;
      if (key) {
        setModuleViewType(key as any);
        setModuleViewOpen(true);
        return;
      }
    }

    setSelectedCard(card);
  };

  const handleCloseDialog = () => {
    setSelectedCard(null);
    saveSettings();
  };

  const renderDialogContent = () => {
    if (!selectedCard) return null;

    switch (selectedCard.title) {
      case 'Basic Information':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input 
                  value={orgSettings.companyName}
                  onChange={(e) => setOrgSettings({...orgSettings, companyName: e.target.value})}
                  placeholder="Your Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={orgSettings.industry} onValueChange={(v) => setOrgSettings({...orgSettings, industry: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={orgSettings.email}
                  onChange={(e) => setOrgSettings({...orgSettings, email: e.target.value})}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={orgSettings.phone}
                  onChange={(e) => setOrgSettings({...orgSettings, phone: e.target.value})}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color"
                  value={orgSettings.brandColor}
                  onChange={(e) => setOrgSettings({...orgSettings, brandColor: e.target.value})}
                  className="w-20 h-10"
                />
                <Input 
                  value={orgSettings.brandColor}
                  onChange={(e) => setOrgSettings({...orgSettings, brandColor: e.target.value})}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        );

      case 'Business Hours':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={orgSettings.timezone} onValueChange={(v) => setOrgSettings({...orgSettings, timezone: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="grid grid-cols-4 gap-2">
                {weekDays.map(day => (
                  <div key={day} className="flex items-center gap-2">
                    <Switch 
                      checked={orgSettings.workingDays.includes(day)}
                      onCheckedChange={(checked) => {
                        setOrgSettings({
                          ...orgSettings,
                          workingDays: checked 
                            ? [...orgSettings.workingDays, day]
                            : orgSettings.workingDays.filter(d => d !== day)
                        });
                      }}
                    />
                    <Label className="text-sm">{day.slice(0, 3)}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input 
                  type="time"
                  value={orgSettings.workingHoursStart}
                  onChange={(e) => setOrgSettings({...orgSettings, workingHoursStart: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input 
                  type="time"
                  value={orgSettings.workingHoursEnd}
                  onChange={(e) => setOrgSettings({...orgSettings, workingHoursEnd: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 'Business Booking Page':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Booking URL</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-gray-100 border border-input rounded-md text-sm">
                  zervos.com/
                </div>
                <Input 
                  value={orgSettings.bookingUrl}
                  onChange={(e) => setOrgSettings({...orgSettings, bookingUrl: e.target.value})}
                  placeholder="my-company"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>SEO Meta Title</Label>
              <Input 
                value={orgSettings.metaTitle}
                onChange={(e) => setOrgSettings({...orgSettings, metaTitle: e.target.value})}
                placeholder="Book an appointment"
              />
            </div>
            <div className="space-y-2">
              <Label>SEO Meta Description</Label>
              <Textarea 
                value={orgSettings.metaDescription}
                onChange={(e) => setOrgSettings({...orgSettings, metaDescription: e.target.value})}
                placeholder="Describe your booking page..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'Customer Login Preferences':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Allow Guest Booking</Label>
                <p className="text-sm text-gray-600">Let customers book without creating an account</p>
              </div>
              <Switch 
                checked={orgSettings.allowGuestBooking}
                onCheckedChange={(checked) => setOrgSettings({...orgSettings, allowGuestBooking: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Require Login</Label>
                <p className="text-sm text-gray-600">Force customers to log in before booking</p>
              </div>
              <Switch 
                checked={orgSettings.requireLogin}
                onCheckedChange={(checked) => setOrgSettings({...orgSettings, requireLogin: checked})}
              />
            </div>
          </div>
        );

      case 'Workspaces':
        return (
          <div className="space-y-4">
            {workspaces.map(ws => (
              <div key={ws.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{ws.name}</p>
                  <p className="text-sm text-gray-600">{ws.members} members</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setWorkspaces(prev => prev.filter(w => w.id !== ws.id))}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input placeholder="New workspace name" id="new-workspace" />
              <Button onClick={() => {
                const input = document.getElementById('new-workspace') as HTMLInputElement;
                if (input?.value) {
                  setWorkspaces(prev => [...prev, { id: Date.now().toString(), name: input.value, members: 0, active: true }]);
                  input.value = '';
                }
              }}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        );

      case 'Resources':
        return (
          <div className="space-y-4">
            {resources.map(res => (
              <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{res.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{res.type}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setResources(prev => prev.filter(r => r.id !== res.id))}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input placeholder="Resource name" id="new-resource" />
              <Select defaultValue="room">
                <SelectTrigger className="w-32" id="resource-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => {
                const input = document.getElementById('new-resource') as HTMLInputElement;
                if (input?.value) {
                  setResources(prev => [...prev, { id: Date.now().toString(), name: input.value, type: 'room', available: true }]);
                  input.value = '';
                }
              }}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        );

      case 'In-person Locations':
        return (
          <div className="space-y-4">
            {locations.map(loc => (
              <div key={loc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{loc.name}</p>
                  <p className="text-sm text-gray-600">{loc.address}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLocations(prev => prev.filter(l => l.id !== loc.id))}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <div className="space-y-2 pt-2">
              <Input placeholder="Location name" id="location-name" />
              <Input placeholder="Address" id="location-address" />
              <Button onClick={() => {
                const nameInput = document.getElementById('location-name') as HTMLInputElement;
                const addressInput = document.getElementById('location-address') as HTMLInputElement;
                if (nameInput?.value && addressInput?.value) {
                  setLocations(prev => [...prev, { 
                    id: Date.now().toString(), 
                    name: nameInput.value, 
                    address: addressInput.value, 
                    active: true 
                  }]);
                  nameInput.value = '';
                  addressInput.value = '';
                }
              }} className="w-full">
                <Plus size={16} className="mr-2" />
                Add Location
              </Button>
            </div>
          </div>
        );

      case 'Most Popular':
      case 'Calendars':
      case 'Video Conferencing':
      case 'CRM & Sales':
      case 'Payments':
        const typeMap: Record<string, string> = {
          'Most Popular': 'automation',
          'Calendars': 'calendar',
          'Video Conferencing': 'video',
          'CRM & Sales': 'crm',
          'Payments': 'payment'
        };
        const filterType = typeMap[selectedCard.title];
        const filteredIntegrations = integrations.filter(int => int.type === filterType);
        
        return (
          <div className="grid grid-cols-2 gap-3">
            {filteredIntegrations.map(integration => (
              <div key={integration.id} className="border rounded-lg p-4 flex items-center justify-between hover:border-purple-300 transition">
                <div>
                  <p className="font-medium">{integration.name}</p>
                  <p className="text-xs text-gray-600">{integration.connected ? 'Connected' : 'Not connected'}</p>
                </div>
                <Button 
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIntegrations(prev => prev.map(int => 
                    int.id === integration.id ? { ...int, connected: !int.connected } : int
                  ))}
                >
                  {integration.connected ? <Check size={14} /> : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        );

      case 'In-product Notifications':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Send Booking Confirmation</Label>
                <p className="text-sm text-gray-600">Email customers when booking is confirmed</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Send Reminders</Label>
                <p className="text-sm text-gray-600">Remind customers 24 hours before appointment</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Notify Team on New Booking</Label>
                <p className="text-sm text-gray-600">Alert team members about new appointments</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        );

      case 'Custom Labels':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event Type Label</Label>
              <Input placeholder="e.g., Appointment, Meeting, Consultation" />
            </div>
            <div className="space-y-2">
              <Label>Team Member Label</Label>
              <Input placeholder="e.g., Staff, Agent, Consultant" />
            </div>
            <div className="space-y-2">
              <Label>Customer Label</Label>
              <Input placeholder="e.g., Client, Patient, Student" />
            </div>
          </div>
        );

      case 'Roles and Permissions':
        return (
          <div className="space-y-3">
            {[
              { name: 'Super Admin', desc: 'Full access to all features', badge: 'All Permissions', color: 'purple' },
              { name: 'Admin', desc: 'Manage bookings and team', badge: 'Limited Access', color: 'blue' },
              { name: 'Staff', desc: 'View own bookings only', badge: 'Basic Access', color: 'green' },
              { name: 'Viewer', desc: 'Read-only access', badge: 'View Only', color: 'gray' }
            ].map((role) => (
              <div key={role.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-sm text-gray-600">{role.desc}</p>
                </div>
                <span className={`text-xs bg-${role.color}-100 text-${role.color}-700 px-2 py-1 rounded`}>
                  {role.badge}
                </span>
              </div>
            ))}
          </div>
        );

      case 'Export':
        return (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={() => {
                const data = { orgSettings, integrations, workspaces, resources, locations };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'zervos_settings.json';
                link.click();
                toast({ title: "Settings exported", description: "Configuration file downloaded" });
              }} className="gap-2 flex-1">
                <FileDown size={18} />
                Export Settings
              </Button>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (data.orgSettings) setOrgSettings(data.orgSettings);
                        if (data.integrations) setIntegrations(data.integrations);
                        if (data.workspaces) setWorkspaces(data.workspaces);
                        if (data.resources) setResources(data.resources);
                        if (data.locations) setLocations(data.locations);
                        saveSettings();
                        toast({ title: "Settings imported", description: "Configuration restored successfully" });
                      } catch {
                        toast({ title: "Import failed", description: "Invalid configuration file", variant: "destructive" });
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="hidden"
                  id="import-file"
                />
                <Button 
                  variant="outline" 
                  className="gap-2 w-full"
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <FileUp size={18} />
                  Import Settings
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Exporting will download all your settings as a JSON file. 
                You can import this file later to restore your configuration.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Configuration options coming soon...</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard')} className="gap-2">
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
          {moduleViewOpen ? (
            <div className="grid grid-cols-12 gap-6">
              {/* Left slim modules list (matches screenshots) */}
              <div className="col-span-3 md:col-span-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Admin Center</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setModuleViewType('workspaces'); }}
                      className={`w-full text-left px-3 py-2 rounded-md ${moduleViewType === 'workspaces' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3"><Folder size={16} /> Workspaces</div>
                    </button>
                    <button
                      onClick={() => { setModuleViewType('resources'); }}
                      className={`w-full text-left px-3 py-2 rounded-md ${moduleViewType === 'resources' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3"><Package size={16} /> Resources</div>
                    </button>
                    <button
                      onClick={() => { setModuleViewType('locations'); }}
                      className={`w-full text-left px-3 py-2 rounded-md ${moduleViewType === 'locations' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3"><MapPin size={16} /> In-person Locations</div>
                    </button>
                    <button
                      onClick={() => { setModuleViewType('customers'); }}
                      className={`w-full text-left px-3 py-2 rounded-md ${moduleViewType === 'customers' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3"><UsersRound size={16} /> Customers</div>
                    </button>
                    <button
                      onClick={() => { setModuleViewType('reports'); }}
                      className={`w-full text-left px-3 py-2 rounded-md ${moduleViewType === 'reports' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3"><BarChart3 size={16} /> Reports</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right main area */}
              <div className="col-span-9 md:col-span-9">
                <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 capitalize">{moduleViewType}</h2>
                    <Badge variant="outline">{moduleViewType === 'workspaces' ? workspaces.length : moduleViewType === 'resources' ? resources.length : moduleViewType === 'locations' ? locations.length : 0}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input className="pl-10" placeholder={`Search ${moduleViewType}`} />
                    </div>
                    <Button onClick={() => {
                      // open add modal for each module type
                      if (moduleViewType === 'workspaces') setWorkspaceModalOpen(true);
                      if (moduleViewType === 'resources') setResourceModalOpen(true);
                      if (moduleViewType === 'locations') setLocationModalOpen(true);
                    }}>
                      <Plus size={14} className="mr-2" /> New {moduleViewType?.slice(0, -1)}
                    </Button>
                    <Button variant="ghost" onClick={() => { setModuleViewOpen(false); setModuleViewType(null); }}>
                      Back
                    </Button>
                  </div>
                </div>

                <div className="mt-8 bg-white border border-gray-200 rounded-lg p-12 text-center">
                  {/* Empty state for each module (very similar to screenshots) */}
                  {moduleViewType === 'workspaces' && workspaces.length === 0 && (
                    <div>
                      <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
                        <Folder size={36} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No workspaces added.</h3>
                      <p className="text-gray-600 mt-2 mb-6">Add workspaces to organize your team and services.</p>
                      <Button onClick={() => setWorkspaceModalOpen(true)}>
                        + New Workspace
                      </Button>
                    </div>
                  )}

                  {moduleViewType === 'resources' && resources.length === 0 && (
                    <div>
                      <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
                        <Package size={36} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No resources added.</h3>
                      <p className="text-gray-600 mt-2 mb-6">Add rooms and equipment so customers can book them.</p>
                      <Button onClick={() => setResourceModalOpen(true)}>
                        + New Resource
                      </Button>
                    </div>
                  )}

                  {moduleViewType === 'locations' && locations.length === 0 && (
                    <div>
                      <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
                        <MapPin size={36} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No in-person locations added.</h3>
                      <p className="text-gray-600 mt-2 mb-6">Add meeting addresses for appointments.</p>
                      <Button onClick={() => setLocationModalOpen(true)}>
                        + New In-person Location
                      </Button>
                    </div>
                  )}

                  {moduleViewType === 'customers' && (
                    <div>
                      {/* assume customers array isn't implemented; show empty-state like screenshot */}
                      <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
                        <UsersRound size={36} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No customers added</h3>
                      <p className="text-gray-600 mt-2 mb-6">Add customers to book appointments with them. They are added automatically when they book via your page.</p>
                      <Button>
                        + New Customer
                      </Button>
                    </div>
                  )}

                  {moduleViewType === 'reports' && (
                    <div>
                      <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
                        <BarChart3 size={36} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No reports added</h3>
                      <p className="text-gray-600 mt-2 mb-6">Create reports to view booking statistics and revenue.</p>
                      <Button>
                        + New Report
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            filteredSections.length === 0 ? (
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
                          onClick={() => handleCardClick(card)}
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
            )
          )}
        </div>

        {/* Settings Dialog */}
        <Dialog open={selectedCard !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedCard && <selectedCard.icon size={20} className="text-purple-600" />}
                {selectedCard?.title}
              </DialogTitle>
              <DialogDescription>
                Configure your {selectedCard?.title.toLowerCase()} settings
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {renderDialogContent()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Close
              </Button>
              <Button onClick={() => {
                saveSettings();
                handleCloseDialog();
              }}>
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
