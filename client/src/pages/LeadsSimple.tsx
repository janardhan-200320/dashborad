import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreVertical, Mail, Phone, Calendar, Building2, 
  User, Edit, Trash2, Eye, Briefcase, FileText, Clock, CheckCircle2, 
  XCircle, Users, TrendingUp
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface CustomerAppointment {
  id: string;
  service: string;
  date: string;
  time: string;
  status: 'completed' | 'scheduled' | 'cancelled';
  notes?: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  source: string;
  notes: string;
  createdAt: string;
  lastContact?: string;
  appointments: CustomerAppointment[];
  totalAppointments: number;
  completedAppointments: number;
  assigned?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  status: 'active' | 'inactive';
  totalSpent: number;
  lastPurchase?: string;
  createdAt: string;
  notes?: string;
  services?: string[];
  items?: string[];
  businessValue: number;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    role: 'CEO',
    source: 'LinkedIn',
    notes: 'Interested in our enterprise package. Follow up next week.',
    createdAt: '2025-11-01',
    lastContact: '2025-11-05',
    totalAppointments: 3,
    completedAppointments: 2,
    appointments: [
      {
        id: 'a1',
        service: 'Initial Consultation',
        date: '2025-11-05',
        time: '10:00 AM',
        status: 'completed',
        notes: 'Great discussion about requirements'
      },
      {
        id: 'a2',
        service: 'Product Demo',
        date: '2025-11-08',
        time: '2:00 PM',
        status: 'scheduled'
      },
      {
        id: 'a3',
        service: 'Strategy Session',
        date: '2025-10-28',
        time: '11:00 AM',
        status: 'completed'
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 987-6543',
    company: 'Innovation Labs',
    role: 'Marketing Director',
    source: 'Referral from Jane Doe',
    notes: 'Looking for marketing automation tools. Budget approved.',
    createdAt: '2025-10-28',
    lastContact: '2025-11-06',
    totalAppointments: 5,
    completedAppointments: 4,
    appointments: [
      {
        id: 'a4',
        service: 'Discovery Call',
        date: '2025-11-06',
        time: '9:00 AM',
        status: 'completed'
      },
      {
        id: 'a5',
        service: 'Follow-up Meeting',
        date: '2025-11-10',
        time: '3:00 PM',
        status: 'scheduled'
      }
    ]
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@business.com',
    phone: '+1 (555) 456-7890',
    company: 'Global Solutions',
    role: 'Operations Manager',
    source: 'Website Contact Form',
    notes: 'Needs integration with existing systems. Technical team involved.',
    createdAt: '2025-10-25',
    lastContact: '2025-11-04',
    totalAppointments: 2,
    completedAppointments: 1,
    appointments: [
      {
        id: 'a6',
        service: 'Technical Assessment',
        date: '2025-11-04',
        time: '1:00 PM',
        status: 'completed'
      },
      {
        id: 'a7',
        service: 'Implementation Planning',
        date: '2025-10-20',
        time: '4:00 PM',
        status: 'cancelled',
        notes: 'Rescheduled due to conflict'
      }
    ]
  },
];

const appointmentStatusColors = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'customers'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isViewCustomerDialogOpen, setIsViewCustomerDialogOpen] = useState(false);
  const [isEditLeadDialogOpen, setIsEditLeadDialogOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    source: '',
    notes: '',
    status: '',
    tags: [] as string[],
    position: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    leadValue: '',
    website: '',
    defaultLanguage: 'System Default',
    assigned: '',
  });
  const [currentTag, setCurrentTag] = useState('');
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    status: 'active' as 'active' | 'inactive',
    notes: '',
    services: [] as string[],
    items: [] as string[],
    businessValue: 0,
  });
  const [currentService, setCurrentService] = useState('');
  const [currentItem, setCurrentItem] = useState('');

  // Load company data and team members
  useEffect(() => {
    try {
      const companyData = localStorage.getItem('zervos_company');
      if (companyData) {
        setCompany(JSON.parse(companyData));
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    }

    // Load team members
    try {
      const keys = ['zervos_team_members'];
      // Try to get all workspace-specific team member keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('zervos_team_members::')) {
          keys.push(key);
        }
      }
      
      let members: any[] = [];
      for (const key of keys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            members = [...members, ...parsed];
          }
        }
      }
      
      // Remove duplicates by id
      const uniqueMembers = members.filter((member, index, self) =>
        index === self.findIndex((m) => m.id === member.id)
      );
      
      // If no team members found, add some default ones
      if (uniqueMembers.length === 0) {
        const defaultMembers = [
          {
            id: 'tm1',
            name: 'Sarah Johnson',
            email: 'sarah@company.com',
            role: 'Sales Manager',
            phone: '+1 (555) 234-5678',
            isActive: true
          },
          {
            id: 'tm2',
            name: 'Michael Chen',
            email: 'michael@company.com',
            role: 'Account Executive',
            phone: '+1 (555) 345-6789',
            isActive: true
          },
          {
            id: 'tm3',
            name: 'Emily Rodriguez',
            email: 'emily@company.com',
            role: 'Customer Success',
            phone: '+1 (555) 456-7890',
            isActive: true
          },
          {
            id: 'tm4',
            name: 'David Thompson',
            email: 'david@company.com',
            role: 'Business Development',
            phone: '+1 (555) 567-8901',
            isActive: true
          }
        ];
        setTeamMembers(defaultMembers);
        // Optionally save to localStorage
        localStorage.setItem('zervos_team_members', JSON.stringify(defaultMembers));
      } else {
        setTeamMembers(uniqueMembers);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = filterSource === 'all' || lead.source.toLowerCase().includes(filterSource.toLowerCase());
    
    return matchesSearch && matchesSource;
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.city && customer.city.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least name and email fields.",
        variant: "destructive",
      });
      return;
    }

    const lead: Lead = {
      id: Date.now().toString(),
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      company: newLead.company,
      role: newLead.role,
      source: newLead.source,
      notes: newLead.notes,
      createdAt: new Date().toISOString().split('T')[0],
      appointments: [],
      totalAppointments: 0,
      completedAppointments: 0,
      assigned: newLead.assigned,
    };

    setLeads([lead, ...leads]);
    setIsAddDialogOpen(false);
    setNewLead({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      source: '',
      notes: '',
      status: '',
      tags: [],
      position: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: '',
      leadValue: '',
      website: '',
      defaultLanguage: 'System Default',
      assigned: '',
    });
    setCurrentTag('');
    
    toast({
      title: "Lead Added",
      description: `${newLead.name} has been added to your leads list.`,
    });
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in name and email fields.",
        variant: "destructive",
      });
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      city: newCustomer.city,
      status: newCustomer.status,
      totalSpent: newCustomer.businessValue,
      createdAt: new Date().toISOString().split('T')[0],
      notes: newCustomer.notes,
      services: newCustomer.services,
      items: newCustomer.items,
      businessValue: newCustomer.businessValue,
    };

    setCustomers([customer, ...customers]);
    setIsAddCustomerDialogOpen(false);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      status: 'active',
      notes: '',
      services: [],
      items: [],
      businessValue: 0,
    });
    setCurrentService('');
    setCurrentItem('');
    
    toast({
      title: "Customer Added",
      description: `${newCustomer.name} has been added to your customer list.`,
    });
  };

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter(lead => lead.id !== id));
    toast({
      title: "Lead Deleted",
      description: "The lead has been removed from your list.",
    });
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(customer => customer.id !== id));
    toast({
      title: "Customer Deleted",
      description: "The customer has been removed from your list.",
    });
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead({
      ...lead,
      tags: [],
      position: lead.role,
      address: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: '',
      leadValue: '',
      website: '',
      defaultLanguage: 'System Default',
      status: 'new',
    });
    setIsEditLeadDialogOpen(true);
  };

  const handleUpdateLead = () => {
    if (!editingLead.name || !editingLead.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least name and email fields.",
        variant: "destructive",
      });
      return;
    }

    const updatedLead: Lead = {
      id: editingLead.id,
      name: editingLead.name,
      email: editingLead.email,
      phone: editingLead.phone,
      company: editingLead.company,
      role: editingLead.role,
      source: editingLead.source,
      notes: editingLead.notes,
      createdAt: editingLead.createdAt,
      appointments: editingLead.appointments || [],
      totalAppointments: editingLead.totalAppointments || 0,
      completedAppointments: editingLead.completedAppointments || 0,
      assigned: editingLead.assigned,
      lastContact: editingLead.lastContact,
    };

    setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
    setIsEditLeadDialogOpen(false);
    setEditingLead(null);
    
    toast({
      title: "Lead Updated",
      description: `${updatedLead.name}'s information has been updated.`,
    });
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer({
      ...customer,
    });
    setIsEditCustomerDialogOpen(true);
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer.name || !editingCustomer.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in name and email fields.",
        variant: "destructive",
      });
      return;
    }

    const updatedCustomer: Customer = {
      ...editingCustomer,
      totalSpent: editingCustomer.businessValue,
    };

    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setIsEditCustomerDialogOpen(false);
    setEditingCustomer(null);
    
    toast({
      title: "Customer Updated",
      description: `${updatedCustomer.name}'s information has been updated.`,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalLeads = filteredLeads.length;
  const totalCustomers = filteredCustomers.length;
  const totalAppointments = filteredLeads.reduce((sum, lead) => sum + lead.totalAppointments, 0);
  const activeLeads = filteredLeads.filter(lead => lead.totalAppointments > 0).length;
  const totalBusinessValue = filteredCustomers.reduce((sum, customer) => sum + customer.businessValue, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalLeads}</div>
              <p className="text-xs text-slate-500 mt-1">Potential customers</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-brand-50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalCustomers}</div>
              <p className="text-xs text-slate-500 mt-1">Active customers</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Leads</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{activeLeads}</div>
              <p className="text-xs text-slate-500 mt-1">With appointments</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalAppointments}</div>
              <p className="text-xs text-slate-500 mt-1">All customer meetings</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-orange-50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalLeads > 0 ? Math.round((totalCustomers / totalLeads) * 100) : 0}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Leads to customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Header and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads & Customer Management</h1>
            <p className="text-sm text-slate-600">Track leads, customers, and appointment history</p>
          </div>

          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => setIsAddCustomerDialogOpen(true)}
                className="bg-brand-600 hover:bg-brand-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Tabs for Leads and Customers */}
        <Tabs defaultValue="leads" className="w-full" onValueChange={(value) => setActiveTab(value as 'leads' | 'customers')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Leads ({totalLeads})
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers ({totalCustomers})
            </TabsTrigger>
          </TabsList>

          {/* Search and Filter */}
          <Card className="border-slate-200 bg-white shadow-sm mt-4">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder={activeTab === 'leads' ? "Search leads by name, email, company..." : "Search customers by name, email, city..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {activeTab === 'leads' && (
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <TabsContent value="leads">
            <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            {filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No customers found</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {searchQuery || filterSource !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by adding your first customer'}
                </p>
              </div>
            ) : (
              <div className="w-full">
                <table className="w-full min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[18%]">
                        Customer
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[15%]">
                        Company & Role
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[18%]">
                        Contact
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[12%]">
                        Source
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[17%]">
                        Notes
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[12%]">
                        Appointments
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-[8%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLeads.map((lead, index) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Customer Name */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-brand-200 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold">
                                {getInitials(lead.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-slate-900">{lead.name}</p>
                                {lead.totalAppointments > 0 && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              {lead.lastContact && (
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  Last: {new Date(lead.lastContact).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Company & Role */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900 text-sm flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{lead.company}</span>
                            </p>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{lead.role}</span>
                            </p>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <a 
                              href={`mailto:${lead.email}`} 
                              className="text-sm text-slate-900 hover:text-brand-600 transition-colors flex items-center gap-1 group"
                            >
                              <Mail className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </a>
                            <a 
                              href={`tel:${lead.phone}`}
                              className="text-sm text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-1 group"
                            >
                              <Phone className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                              <span>{lead.phone}</span>
                            </a>
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {lead.source}
                          </Badge>
                        </td>

                        {/* Notes */}
                        <td className="px-4 py-4">
                          {lead.notes ? (
                            <div>
                              <p className="text-sm text-slate-600 line-clamp-2" title={lead.notes}>
                                {lead.notes}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No notes</span>
                          )}
                        </td>

                        {/* Appointments Stats */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-900">{lead.totalAppointments}</span>
                              </div>
                              <span className="text-xs text-slate-500 mt-1">Total</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-green-900">{lead.completedAppointments}</span>
                              </div>
                              <span className="text-xs text-slate-500 mt-1">Done</span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsViewDialogOpen(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Full Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditLead(lead)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    toast({
                                      title: "Coming Soon",
                                      description: "Appointment booking feature will be available soon.",
                                    });
                                  }}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Book Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.location.href = `mailto:${lead.email}`;
                                  }}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (window.confirm(`Are you sure you want to delete ${lead.name}? This action cannot be undone.`)) {
                                      handleDeleteLead(lead.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Lead
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Customers Table */}
      <TabsContent value="customers">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            {filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No customers found</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {searchQuery 
                    ? 'Try adjusting your search' 
                    : 'Get started by adding your first customer'}
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[20%]">
                        Customer
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[20%]">
                        Contact
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[15%]">
                        Location
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[12%]">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[15%]">
                        Business Value
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[10%]">
                        Joined
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-[8%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredCustomers.map((customer, index) => (
                      <motion.tr 
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-brand-200">
                              <AvatarFallback className="bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold">
                                {getInitials(customer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-slate-900">{customer.name}</div>
                              <div className="text-sm text-slate-500">ID: {customer.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-slate-700">
                            {customer.city || 'N/A'}
                          </div>
                          {customer.address && (
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">
                              {customer.address}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge 
                            variant="outline" 
                            className={customer.status === 'active' 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-slate-100 text-slate-600 border-slate-200"}
                          >
                            {customer.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-green-600">
                            ${customer.businessValue.toFixed(2)}
                          </div>
                          {customer.services && customer.services.length > 0 && (
                            <div className="text-xs text-slate-500">
                              {customer.services.length} service{customer.services.length > 1 ? 's' : ''}
                            </div>
                          )}
                          {customer.items && customer.items.length > 0 && (
                            <div className="text-xs text-slate-500">
                              {customer.items.length} item{customer.items.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-slate-700">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedCustomer(customer);
                                  setIsViewCustomerDialogOpen(true);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditCustomer(customer)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.location.href = `mailto:${customer.email}`;
                                  }}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
                                      handleDeleteCustomer(customer.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle className="text-2xl flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <User className="h-6 w-6 text-brand-600" />
                </motion.div>
                Add New Lead
              </DialogTitle>
              <DialogDescription>
                Create a comprehensive customer profile with all relevant details
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          
          <motion.div 
            className="grid gap-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Status and Source Row */}
            <motion.div 
              className="grid grid-cols-3 gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="grid gap-2">
                <Label htmlFor="status" className="flex items-center gap-1">
                  <span className="text-red-500">*</span> Status
                </Label>
                <Select value={newLead.status} onValueChange={(value) => setNewLead({ ...newLead, status: value })}>
                  <SelectTrigger className="border-slate-300 focus:border-brand-500 focus:ring-brand-200">
                    <SelectValue placeholder="Non selected" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Lead</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="negotiation">In Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="source" className="flex items-center gap-1">
                  <span className="text-red-500">*</span> Source
                </Label>
                <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value })}>
                  <SelectTrigger className="border-slate-300 focus:border-brand-500 focus:ring-brand-200">
                    <SelectValue placeholder="Non selected" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website Contact Form">Website Contact Form</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assigned">
                  Assigned {company?.teamMemberLabel || 'Team Member'}
                </Label>
                <Select 
                  value={newLead.assigned}
                  onValueChange={(value) => setNewLead({...newLead, assigned: value})}
                >
                  <SelectTrigger className="border-slate-300 focus:border-brand-500 focus:ring-brand-200">
                    <SelectValue placeholder={teamMembers.length > 0 ? `Select ${company?.teamMemberLabel || 'Team Member'}` : 'No staff available'} />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.length > 0 ? (
                      teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} {member.role ? `(${member.role})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No staff available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div 
              className="grid gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="tags" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Tags
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add tag and press Enter"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentTag.trim()) {
                        e.preventDefault();
                        setNewLead({ ...newLead, tags: [...newLead.tags, currentTag.trim()] });
                        setCurrentTag('');
                      }
                    }}
                    className="flex-1 border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentTag.trim()) {
                        setNewLead({ ...newLead, tags: [...newLead.tags, currentTag.trim()] });
                        setCurrentTag('');
                      }
                    }}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newLead.tags.length > 0 && (
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {newLead.tags.map((tag, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="flex items-center gap-1 bg-brand-100 text-brand-800 border-brand-200"
                        >
                          {tag}
                          <button
                            onClick={() => setNewLead({ ...newLead, tags: newLead.tags.filter((_, i) => i !== index) })}
                            className="ml-1 hover:text-brand-900"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Name and Email */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  <span className="text-red-500">*</span> Name
                </Label>
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                  />
                </motion.div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Address and Position */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Street address"
                  value={newLead.address}
                  onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
                  rows={3}
                  className="border-slate-300 focus:border-brand-500 focus:ring-brand-200 resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="Job title"
                    value={newLead.position}
                    onChange={(e) => setNewLead({ ...newLead, position: e.target.value })}
                    className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                  />
                </div>
              </div>
            </motion.div>

            {/* State, Country, Zip */}
            <motion.div 
              className="grid grid-cols-3 gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State/Province"
                  value={newLead.state}
                  onChange={(e) => setNewLead({ ...newLead, state: e.target.value })}
                  className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Select value={newLead.country} onValueChange={(value) => setNewLead({ ...newLead, country: value })}>
                  <SelectTrigger className="border-slate-300 focus:border-brand-500 focus:ring-brand-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  placeholder="Postal code"
                  value={newLead.zipCode}
                  onChange={(e) => setNewLead({ ...newLead, zipCode: e.target.value })}
                  className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                />
              </div>
            </motion.div>

            {/* Phone, Website, Company */}
            <motion.div 
              className="grid grid-cols-3 gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={newLead.website}
                  onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                  className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                />
              </div>
            </motion.div>

            {/* Lead Value and Language */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <div className="grid gap-2">
                <Label htmlFor="leadValue">Lead value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <Input
                    id="leadValue"
                    type="number"
                    placeholder="0"
                    value={newLead.leadValue}
                    onChange={(e) => setNewLead({ ...newLead, leadValue: e.target.value })}
                    className="pl-8 border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select value={newLead.defaultLanguage} onValueChange={(value) => setNewLead({ ...newLead, defaultLanguage: value })}>
                  <SelectTrigger className="border-slate-300 focus:border-brand-500 focus:ring-brand-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="System Default">System Default</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div 
              className="grid gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any relevant notes about this customer..."
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                rows={3}
                className="border-slate-300 focus:border-brand-500 focus:ring-brand-200 resize-none"
              />
            </motion.div>
          </motion.div>

          <DialogFooter>
            <motion.div 
              className="flex gap-2 w-full sm:w-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewLead({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    role: '',
                    source: '',
                    notes: '',
                    status: '',
                    tags: [],
                    position: '',
                    address: '',
                    city: '',
                    state: '',
                    country: 'India',
                    zipCode: '',
                    leadValue: '',
                    website: '',
                    defaultLanguage: 'System Default',
                    assigned: '',
                  });
                  setCurrentTag('');
                }}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleAddLead}
                  disabled={!newLead.name}
                  className="bg-brand-600 hover:bg-brand-700 flex-1 sm:flex-none"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  </motion.div>
                  Add Lead
                </Button>
              </motion.div>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-brand-200">
                    <AvatarFallback className="bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold text-xl">
                      {getInitials(selectedLead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedLead.name}</DialogTitle>
                    <DialogDescription>
                      {selectedLead.role} at {selectedLead.company}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Customer Info</TabsTrigger>
                  <TabsTrigger value="appointments">
                    Appointments ({selectedLead.appointments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Email</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a href={`mailto:${selectedLead.email}`} className="text-sm hover:text-brand-600">
                            {selectedLead.email}
                          </a>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Phone</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <a href={`tel:${selectedLead.phone}`} className="text-sm hover:text-brand-600">
                            {selectedLead.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Company</Label>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <p className="text-sm">{selectedLead.company}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Role</Label>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <p className="text-sm">{selectedLead.role}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Source</Label>
                        <p className="text-sm">{selectedLead.source}</p>
                      </div>
                      {selectedLead.assigned && (
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Assigned To</Label>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <p className="text-sm">
                              {teamMembers.find(m => m.id === selectedLead.assigned)?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedLead.notes && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Notes</Label>
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="text-sm text-slate-700">{selectedLead.notes}</p>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Customer Since</Label>
                        <p className="text-sm">{new Date(selectedLead.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                      {selectedLead.lastContact && (
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Last Contact</Label>
                          <p className="text-sm">{new Date(selectedLead.lastContact).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appointments" className="space-y-4 mt-4">
                  {selectedLead.appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-slate-300 mx-auto" />
                      <p className="mt-4 text-sm text-slate-600">No appointments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedLead.appointments.map((appointment) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-slate-900">{appointment.service}</h4>
                                <Badge className={`${appointmentStatusColors[appointment.status]} border text-xs`}>
                                  {appointment.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                  {appointment.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                                  {appointment.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(appointment.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {appointment.time}
                                </div>
                              </div>
                              {appointment.notes && (
                                <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded p-2">
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button className="bg-brand-600 hover:bg-brand-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book New Appointment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle className="text-2xl flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Users className="h-6 w-6 text-brand-600" />
                </motion.div>
                Add New Customer
              </DialogTitle>
              <DialogDescription>
                Add a verified customer with essential contact information
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          
          <motion.div 
            className="grid gap-4 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Name and Email Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name" className="flex items-center gap-1">
                  <span className="text-red-500">*</span> Full Name
                </Label>
                <Input
                  id="customer-name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="border-slate-300 focus:border-brand-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-email" className="flex items-center gap-1">
                  <span className="text-red-500">*</span> Email Address
                </Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="border-slate-300 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="customer-phone">Phone Number</Label>
              <Input
                id="customer-phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="border-slate-300 focus:border-brand-500"
              />
            </div>

            {/* Address and City Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-address">Address</Label>
                <Input
                  id="customer-address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="border-slate-300 focus:border-brand-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-city">City</Label>
                <Input
                  id="customer-city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  className="border-slate-300 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Services Taken */}
            <div className="grid gap-2">
              <Label htmlFor="customer-services" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-500" />
                Services Taken
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="customer-services"
                    placeholder="Add service and press Enter"
                    value={currentService}
                    onChange={(e) => setCurrentService(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentService.trim()) {
                        e.preventDefault();
                        setNewCustomer({ ...newCustomer, services: [...newCustomer.services, currentService.trim()] });
                        setCurrentService('');
                      }
                    }}
                    className="flex-1 border-slate-300 focus:border-brand-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentService.trim()) {
                        setNewCustomer({ ...newCustomer, services: [...newCustomer.services, currentService.trim()] });
                        setCurrentService('');
                      }
                    }}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newCustomer.services.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newCustomer.services.map((service, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => setNewCustomer({ 
                            ...newCustomer, 
                            services: newCustomer.services.filter((_, i) => i !== index) 
                          })}
                          className="ml-1 hover:text-blue-900"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Items Purchased */}
            <div className="grid gap-2">
              <Label htmlFor="customer-items" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Items Purchased
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="customer-items"
                    placeholder="Add item and press Enter"
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentItem.trim()) {
                        e.preventDefault();
                        setNewCustomer({ ...newCustomer, items: [...newCustomer.items, currentItem.trim()] });
                        setCurrentItem('');
                      }
                    }}
                    className="flex-1 border-slate-300 focus:border-brand-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentItem.trim()) {
                        setNewCustomer({ ...newCustomer, items: [...newCustomer.items, currentItem.trim()] });
                        setCurrentItem('');
                      }
                    }}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newCustomer.items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newCustomer.items.map((item, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => setNewCustomer({ 
                            ...newCustomer, 
                            items: newCustomer.items.filter((_, i) => i !== index) 
                          })}
                          className="ml-1 hover:text-green-900"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Business Value */}
            <div className="grid gap-2">
              <Label htmlFor="customer-business-value" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                Business Value ($)
              </Label>
              <Input
                id="customer-business-value"
                type="number"
                min="0"
                step="0.01"
                value={newCustomer.businessValue}
                onChange={(e) => setNewCustomer({ ...newCustomer, businessValue: parseFloat(e.target.value) || 0 })}
                className="border-slate-300 focus:border-brand-500"
              />
              <p className="text-xs text-slate-500">Total revenue generated from this customer</p>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="customer-status">Status</Label>
              <Select value={newCustomer.status} onValueChange={(value) => setNewCustomer({ ...newCustomer, status: value as 'active' | 'inactive' })}>
                <SelectTrigger className="border-slate-300 focus:border-brand-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="customer-notes">Notes</Label>
              <Textarea
                id="customer-notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                className="min-h-[80px] border-slate-300 focus:border-brand-500"
              />
            </div>
          </motion.div>

          <DialogFooter>
            <motion.div className="flex gap-2 w-full sm:w-auto" whileHover={{ scale: 1.01 }}>
              <Button variant="outline" onClick={() => setIsAddCustomerDialogOpen(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                <Button 
                  onClick={handleAddCustomer}
                  disabled={!newCustomer.name || !newCustomer.email}
                  className="bg-brand-600 hover:bg-brand-700 w-full"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </motion.div>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Details Dialog */}
      <Dialog open={isViewCustomerDialogOpen} onOpenChange={setIsViewCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-brand-200">
                    <AvatarFallback className="bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold text-xl">
                      {getInitials(selectedCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedCustomer.name}</DialogTitle>
                    <DialogDescription>Customer since {new Date(selectedCustomer.createdAt).toLocaleDateString()}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500 text-xs uppercase">Status</Label>
                    <Badge 
                      variant="outline" 
                      className={selectedCustomer.status === 'active' 
                        ? "bg-green-50 text-green-700 border-green-200 mt-1" 
                        : "bg-slate-100 text-slate-600 border-slate-200 mt-1"}
                    >
                      {selectedCustomer.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs uppercase">Total Spent</Label>
                    <p className="font-semibold text-lg">${selectedCustomer.totalSpent.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-500 text-xs uppercase flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <p className="mt-1">{selectedCustomer.email}</p>
                </div>

                {selectedCustomer.phone && (
                  <div>
                    <Label className="text-slate-500 text-xs uppercase flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      Phone
                    </Label>
                    <p className="mt-1">{selectedCustomer.phone}</p>
                  </div>
                )}

                {(selectedCustomer.address || selectedCustomer.city) && (
                  <div>
                    <Label className="text-slate-500 text-xs uppercase flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      Location
                    </Label>
                    <p className="mt-1">
                      {selectedCustomer.address && <>{selectedCustomer.address}<br /></>}
                      {selectedCustomer.city}
                    </p>
                  </div>
                )}

                {selectedCustomer.lastPurchase && (
                  <div>
                    <Label className="text-slate-500 text-xs uppercase flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Last Purchase
                    </Label>
                    <p className="mt-1">{new Date(selectedCustomer.lastPurchase).toLocaleDateString()}</p>
                  </div>
                )}

                {selectedCustomer.services && selectedCustomer.services.length > 0 && (
                  <div>
                    <Label className="text-slate-500 text-xs uppercase flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      Services Taken
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCustomer.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCustomer.items && selectedCustomer.items.length > 0 && (
                  <div>
                    <Label className="text-slate-500 text-xs uppercase flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Items Purchased
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCustomer.items.map((item, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCustomer.businessValue > 0 && (
                  <div>
                    <Label className="text-slate-500 text-xs uppercase flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      Business Value
                    </Label>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      ${selectedCustomer.businessValue.toFixed(2)}
                    </p>
                  </div>
                )}

                {selectedCustomer.notes && (
                  <div>
                    <Label className="text-slate-500 text-xs uppercase flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Notes
                    </Label>
                    <p className="mt-1 text-sm text-slate-600 bg-slate-50 rounded p-3">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsViewCustomerDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  className="bg-brand-600 hover:bg-brand-700"
                  onClick={() => {
                    setIsViewCustomerDialogOpen(false);
                    handleEditCustomer(selectedCustomer);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Customer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditLeadDialogOpen} onOpenChange={setIsEditLeadDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {editingLead && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Edit className="h-6 w-6 text-purple-600" />
                  Edit Lead
                </DialogTitle>
                <DialogDescription>
                  Update lead information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* Name and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lead-name" className="flex items-center gap-1">
                      <span className="text-red-500">*</span> Full Name
                    </Label>
                    <Input
                      id="edit-lead-name"
                      value={editingLead.name}
                      onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lead-email" className="flex items-center gap-1">
                      <span className="text-red-500">*</span> Email
                    </Label>
                    <Input
                      id="edit-lead-email"
                      type="email"
                      value={editingLead.email}
                      onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-lead-phone">Phone</Label>
                  <Input
                    id="edit-lead-phone"
                    value={editingLead.phone}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Company and Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lead-company">Company</Label>
                    <Input
                      id="edit-lead-company"
                      value={editingLead.company}
                      onChange={(e) => setEditingLead({ ...editingLead, company: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lead-role">Role/Position</Label>
                    <Input
                      id="edit-lead-role"
                      value={editingLead.role}
                      onChange={(e) => setEditingLead({ ...editingLead, role: e.target.value })}
                      placeholder="Job title"
                    />
                  </div>
                </div>

                {/* Source and Assigned */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lead-source">Source</Label>
                    <Select value={editingLead.source} onValueChange={(value) => setEditingLead({ ...editingLead, source: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website Contact Form">Website Contact Form</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                        <SelectItem value="Trade Show">Trade Show</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lead-assigned">Assigned To</Label>
                    <Select 
                      value={editingLead.assigned}
                      onValueChange={(value) => setEditingLead({ ...editingLead, assigned: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={teamMembers.length > 0 ? "Select team member" : "No staff available"} />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} {member.role ? `(${member.role})` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No staff available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-lead-notes">Notes</Label>
                  <Textarea
                    id="edit-lead-notes"
                    value={editingLead.notes}
                    onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                    placeholder="Additional notes..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditLeadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateLead}
                  disabled={!editingLead.name || !editingLead.email}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Update Lead
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditCustomerDialogOpen} onOpenChange={setIsEditCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {editingCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Edit className="h-6 w-6 text-brand-600" />
                  Edit Customer
                </DialogTitle>
                <DialogDescription>
                  Update customer information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* Name and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-customer-name" className="flex items-center gap-1">
                      <span className="text-red-500">*</span> Full Name
                    </Label>
                    <Input
                      id="edit-customer-name"
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-customer-email" className="flex items-center gap-1">
                      <span className="text-red-500">*</span> Email
                    </Label>
                    <Input
                      id="edit-customer-email"
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-customer-phone">Phone</Label>
                  <Input
                    id="edit-customer-phone"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Address and City */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-customer-address">Address</Label>
                    <Input
                      id="edit-customer-address"
                      value={editingCustomer.address || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-customer-city">City</Label>
                    <Input
                      id="edit-customer-city"
                      value={editingCustomer.city || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                      placeholder="New York"
                    />
                  </div>
                </div>

                {/* Business Value */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-customer-business-value">Business Value ($)</Label>
                  <Input
                    id="edit-customer-business-value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingCustomer.businessValue}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, businessValue: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-customer-status">Status</Label>
                  <Select value={editingCustomer.status} onValueChange={(value) => setEditingCustomer({ ...editingCustomer, status: value as 'active' | 'inactive' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-customer-notes">Notes</Label>
                  <Textarea
                    id="edit-customer-notes"
                    value={editingCustomer.notes || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                    placeholder="Additional notes..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditCustomerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateCustomer}
                  disabled={!editingCustomer.name || !editingCustomer.email}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Update Customer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
