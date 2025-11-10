import { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { toast } = useToast();
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
  });
  const [currentTag, setCurrentTag] = useState('');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = filterSource === 'all' || lead.source.toLowerCase().includes(filterSource.toLowerCase());
    
    return matchesSearch && matchesSource;
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
    });
    setCurrentTag('');
    
    toast({
      title: "Customer Added",
      description: `${newLead.name} has been added to your customer list.`,
    });
  };

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter(lead => lead.id !== id));
    toast({
      title: "Customer Deleted",
      description: "The customer has been removed from your list.",
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

  const totalCustomers = filteredLeads.length;
  const totalAppointments = filteredLeads.reduce((sum, lead) => sum + lead.totalAppointments, 0);
  const activeCustomers = filteredLeads.filter(lead => lead.totalAppointments > 0).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200 bg-gradient-to-br from-brand-50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalCustomers}</div>
              <p className="text-xs text-slate-500 mt-1">All registered customers</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Customers</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{activeCustomers}</div>
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

          <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Engagement Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Customer engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Header and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
            <p className="text-sm text-slate-600">Track customer details and appointment history</p>
          </div>

          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-brand-600 hover:bg-brand-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by name, email, company, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
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
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
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
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Book Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem>
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
      </div>

      {/* Add Customer Dialog */}
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
                Add New Customer
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
                <Label htmlFor="assigned">Assigned</Label>
                <Select defaultValue="finas-zollid">
                  <SelectTrigger className="border-slate-300 focus:border-brand-500 focus:ring-brand-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finas-zollid">Finas Zollid</SelectItem>
                    <SelectItem value="john-doe">John Doe</SelectItem>
                    <SelectItem value="jane-smith">Jane Smith</SelectItem>
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
                  Add Customer
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

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">Source</Label>
                      <p className="text-sm">{selectedLead.source}</p>
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
    </DashboardLayout>
  );
}
