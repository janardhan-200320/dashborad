import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Clock, DollarSign, Tag, MoreVertical, Sparkles, Search, Link2, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  currency: string;
  description: string;
  category: string;
  isEnabled: boolean;
  createdAt: string;
  // Package-specific fields (optional)
  packageServices?: string[];
  originalPrice?: string;
  discount?: string;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', flag: '🇨🇳' },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
];

const getCurrencySymbol = (code: string) => {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency?.symbol || '₹';
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageServices, setPackageServices] = useState<string[]>([]);
  const [packageDiscount, setPackageDiscount] = useState('10');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
    currency: 'INR',
    description: '',
    category: '',
  });

  const categories = ['Spa & Wellness', 'Beauty & Salon', 'Fitness & Training', 'Consultation', 'Treatment', 'Workshop', 'Other'];

  // Recommended service templates
  const recommendedServices: Omit<Service, 'id' | 'createdAt'>[] = [
    // Spa & Wellness
    { name: 'Swedish Massage', duration: '60 mins', price: '2500', currency: 'INR', description: 'Full body relaxation massage with essential oils', category: 'Spa & Wellness', isEnabled: true },
    { name: 'Deep Tissue Massage', duration: '90 mins', price: '3500', currency: 'INR', description: 'Therapeutic massage targeting deep muscle layers', category: 'Spa & Wellness', isEnabled: true },
    { name: 'Hot Stone Therapy', duration: '75 mins', price: '3000', currency: 'INR', description: 'Relaxing massage using heated stones', category: 'Spa & Wellness', isEnabled: true },
    { name: 'Aromatherapy Session', duration: '60 mins', price: '2800', currency: 'INR', description: 'Therapeutic massage with aromatic essential oils', category: 'Spa & Wellness', isEnabled: true },
    { name: 'Body Scrub & Polish', duration: '45 mins', price: '2000', currency: 'INR', description: 'Exfoliating treatment for smooth, glowing skin', category: 'Spa & Wellness', isEnabled: true },
    { name: 'Couples Spa Package', duration: '120 mins', price: '8000', currency: 'INR', description: 'Relaxing spa experience for two', category: 'Spa & Wellness', isEnabled: true },
    
    // Beauty & Salon
    { name: 'Haircut & Styling', duration: '45 mins', price: '800', currency: 'INR', description: 'Professional haircut with styling', category: 'Beauty & Salon', isEnabled: true },
    { name: 'Hair Coloring', duration: '120 mins', price: '4500', currency: 'INR', description: 'Full color treatment with conditioning', category: 'Beauty & Salon', isEnabled: true },
    { name: 'Keratin Treatment', duration: '180 mins', price: '8500', currency: 'INR', description: 'Smoothing and straightening treatment', category: 'Beauty & Salon', isEnabled: true },
    { name: 'Manicure & Pedicure', duration: '60 mins', price: '1200', currency: 'INR', description: 'Complete nail care and polish', category: 'Beauty & Salon', isEnabled: true },
    { name: 'Gel Nails', duration: '45 mins', price: '1000', currency: 'INR', description: 'Long-lasting gel nail application', category: 'Beauty & Salon', isEnabled: true },
    { name: 'Facial Treatment', duration: '60 mins', price: '2500', currency: 'INR', description: 'Deep cleansing and hydrating facial', category: 'Beauty & Salon', isEnabled: true },
    { name: 'Makeup Application', duration: '60 mins', price: '2000', currency: 'INR', description: 'Professional makeup for special occasions', category: 'Beauty & Salon', isEnabled: true },
    { name: 'Eyebrow Threading', duration: '15 mins', price: '100', currency: 'INR', description: 'Precise eyebrow shaping', category: 'Beauty & Salon', isEnabled: true },
    { name: 'Waxing Service', duration: '30 mins', price: '500', currency: 'INR', description: 'Hair removal service', category: 'Beauty & Salon', isEnabled: true },
    
    // Fitness & Training
    { name: 'Personal Training Session', duration: '60 mins', price: '1500', currency: 'INR', description: 'One-on-one fitness training', category: 'Fitness & Training', isEnabled: true },
    { name: 'Group Fitness Class', duration: '45 mins', price: '500', currency: 'INR', description: 'High-energy group workout', category: 'Fitness & Training', isEnabled: true },
    { name: 'Yoga Session', duration: '60 mins', price: '600', currency: 'INR', description: 'Mindful yoga practice for all levels', category: 'Fitness & Training', isEnabled: true },
    { name: 'Pilates Class', duration: '55 mins', price: '800', currency: 'INR', description: 'Core-strengthening pilates workout', category: 'Fitness & Training', isEnabled: true },
    { name: 'Spin Class', duration: '45 mins', price: '600', currency: 'INR', description: 'Indoor cycling workout', category: 'Fitness & Training', isEnabled: true },
    { name: 'HIIT Training', duration: '45 mins', price: '900', currency: 'INR', description: 'High-intensity interval training', category: 'Fitness & Training', isEnabled: true },
    { name: 'Nutrition Consultation', duration: '60 mins', price: '2000', currency: 'INR', description: 'Personalized nutrition planning', category: 'Consultation', isEnabled: true },
    { name: 'Fitness Assessment', duration: '30 mins', price: '1000', currency: 'INR', description: 'Complete fitness evaluation', category: 'Consultation', isEnabled: true },
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    const currentWorkspace = localStorage.getItem('currentWorkspace') || 'default';
    const stored = localStorage.getItem(`zervos_services_${currentWorkspace}`);
    if (stored) {
      setServices(JSON.parse(stored));
    }
  };

  const saveServices = (updatedServices: Service[]) => {
    const currentWorkspace = localStorage.getItem('currentWorkspace') || 'default';
    localStorage.setItem(`zervos_services_${currentWorkspace}`, JSON.stringify(updatedServices));
    setServices(updatedServices);
    // Dispatch event for other components to sync
    window.dispatchEvent(new CustomEvent('services-updated'));
  };

  const handleOpenNew = () => {
    setFormData({ name: '', duration: '', price: '', currency: 'INR', description: '', category: '' });
    setEditingService(null);
    setIsNewServiceOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      currency: service.currency,
      description: service.description,
      category: service.category,
    });
    setEditingService(service);
    setIsNewServiceOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.duration || !formData.price || !formData.category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingService) {
      // Update existing service
      const updatedServices = services.map(s => 
        s.id === editingService.id 
          ? { ...s, ...formData }
          : s
      );
      saveServices(updatedServices);
      toast({
        title: 'Service Updated',
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      // Create new service
      const newService: Service = {
        id: Date.now().toString(),
        ...formData,
        isEnabled: true,
        createdAt: new Date().toISOString(),
      };
      saveServices([...services, newService]);
      toast({
        title: 'Service Added',
        description: `${newService.name} has been added successfully.`,
      });
    }
    setIsNewServiceOpen(false);
  };

  const handleDelete = () => {
    if (!deletingService) return;
    
    const updatedServices = services.filter(s => s.id !== deletingService.id);
    saveServices(updatedServices);
    setIsDeleteDialogOpen(false);
    setDeletingService(null);
    toast({
      title: 'Service Deleted',
      description: `${deletingService.name} has been removed.`,
    });
  };

  const handleToggleEnabled = (id: string) => {
    const updatedServices = services.map(s =>
      s.id === id ? { ...s, isEnabled: !s.isEnabled } : s
    );
    saveServices(updatedServices);
  };

  const openDeleteDialog = (service: Service) => {
    setDeletingService(service);
    setIsDeleteDialogOpen(true);
  };

  const copyBookingURL = (serviceId: string, serviceName: string) => {
    const url = `${window.location.origin}/book/${serviceId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(serviceId);
      toast({
        title: 'Booking Link Copied!',
        description: `Share this link for ${serviceName}`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast({
        title: 'Copy Failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    });
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Services & Packages</h1>
                <p className="text-gray-600 mt-1">Manage your service offerings</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsPackageModalOpen(true)} variant="outline" className="gap-2">
              <Tag size={18} />
              Create Package
            </Button>
            <Button onClick={handleOpenNew} className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus size={18} />
              Add Service
            </Button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </motion.div>

        {/* Services Grid */}
        <AnimatePresence mode="popLayout">
          {filteredServices.length === 0 && services.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="inline-block p-6 bg-white rounded-3xl shadow-lg mb-4">
                <Sparkles className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No services yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first service or load recommended templates</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleOpenNew}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Service
                </Button>
                <Button
                  onClick={() => {
                    const servicesToAdd = recommendedServices.map((service, index) => ({
                      ...service,
                      id: `rec-${Date.now()}-${index}`,
                      createdAt: new Date().toISOString(),
                    }));
                    saveServices(servicesToAdd);
                    toast({
                      title: 'Recommended Services Loaded',
                      description: `${servicesToAdd.length} service templates have been added to your catalog.`,
                    });
                  }}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Load Recommended Services
                </Button>
              </div>
            </motion.div>
          ) : filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-6 bg-white rounded-3xl shadow-lg mb-4">
                <Search className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No matching services</h3>
              <p className="text-gray-500">Try adjusting your search query</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 p-6 ${
                !service.isEnabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                    {service.category === 'Package' && (
                      <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-semibold shadow-sm">
                        ✨ Package
                      </span>
                    )}
                    {!service.isEnabled && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                        Disabled
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                    <Tag size={12} />
                    {service.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={service.isEnabled}
                    onCheckedChange={() => handleToggleEnabled(service.id)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(service)}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(service)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {service.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
              )}

              <div className="space-y-2 mb-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 font-medium">{service.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-gray-900 font-semibold">
                    {getCurrencySymbol(service.currency)}{service.price}
                  </span>
                  <span className="text-gray-500">({service.currency})</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className={`text-sm font-medium ${service.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {service.isEnabled ? '● Active' : '● Disabled'}
                </span>
              </div>

              {/* Booking URL & QR Code */}
              {service.isEnabled && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    onClick={() => copyBookingURL(service.id, service.name)}
                  >
                    {copiedId === service.id ? (
                      <>
                        <Check size={14} className="text-green-600" />
                        <span className="text-green-600">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Link2 size={14} />
                        <span>Copy Booking Link</span>
                        <Copy size={12} className="ml-auto" />
                      </>
                    )}
                  </Button>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/book/' + service.id)}`}
                    download={`${service.name.replace(/\s+/g, '-')}-QR.png`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      type="button"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm-2 14h8v-8H3v8zm2-6h4v4H5v-4zm8-10v8h8V3h-8zm6 6h-4V5h4v4zm-6 4h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v4h-2v-4zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2z"/>
                      </svg>
                      <span>Download QR Code</span>
                    </Button>
                  </a>
                  <p className="text-xs text-gray-400 mt-2 text-center truncate px-2">
                    /book/{service.id}
                  </p>
                </div>
              )}
            </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Service Form Modal */}
        <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Create New Service'}</DialogTitle>
              <DialogDescription>
                {editingService ? 'Update service details' : 'Add a new bookable service'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  placeholder="Technical Interview"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="60 mins"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="150"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(val) => setFormData({ ...formData, currency: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.flag} {currency.code} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Service description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewServiceOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.name || !formData.duration || !formData.price || !formData.category}
              >
                {editingService ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-600">Delete Service</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            {deletingService && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <span className="font-bold">{deletingService.name}</span>?
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingService(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Package Dialog */}
        <Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Tag className="text-purple-600" size={24} />
                Create Service Package
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Package Name */}
              <div className="space-y-2">
                <Label htmlFor="packageName">Package Name *</Label>
                <Input
                  id="packageName"
                  placeholder="e.g., Spa Day Package, Complete Wellness Bundle"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Package Description */}
              <div className="space-y-2">
                <Label htmlFor="packageDescription">Description</Label>
                <Textarea
                  id="packageDescription"
                  placeholder="Describe what's included in this package..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Select Services */}
              <div className="space-y-3">
                <Label>Select Services to Include *</Label>
                <div className="border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto bg-gray-50">
                  {services
                    .filter(s => s.isEnabled && s.category !== 'Package')
                    .map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded transition-colors">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={packageServices.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPackageServices([...packageServices, service.id]);
                            } else {
                              setPackageServices(packageServices.filter(id => id !== service.id));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{service.name}</span>
                            <div className="text-sm text-gray-600">
                              <span className="mr-4">{service.duration} min</span>
                              <span className="font-semibold">₹{service.price}</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                </div>
                {packageServices.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Select at least 2 services to create a package</p>
                )}
              </div>

              {/* Discount Percentage */}
              <div className="space-y-2">
                <Label htmlFor="discount">Package Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="10"
                  value={packageDiscount}
                  onChange={(e) => setPackageDiscount(e.target.value)}
                />
                <p className="text-xs text-gray-500">Discount applied to the total of all services</p>
              </div>

              {/* Package Summary */}
              {packageServices.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-purple-900">Package Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Services included:</span>
                      <span className="font-medium">{packageServices.length} services</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total duration:</span>
                      <span className="font-medium">
                        {services
                          .filter(s => packageServices.includes(s.id))
                          .reduce((sum, s) => sum + parseInt(s.duration), 0)} minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Original price:</span>
                      <span className="line-through text-gray-500">
                        ₹{services
                          .filter(s => packageServices.includes(s.id))
                          .reduce((sum, s) => sum + parseFloat(s.price), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Discount ({packageDiscount}%):</span>
                      <span className="text-green-600 font-medium">
                        -₹{(services
                          .filter(s => packageServices.includes(s.id))
                          .reduce((sum, s) => sum + parseFloat(s.price), 0) * 
                          (parseFloat(packageDiscount) / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-300">
                      <span className="font-semibold text-purple-900">Package price:</span>
                      <span className="font-bold text-xl text-purple-600">
                        ₹{(services
                          .filter(s => packageServices.includes(s.id))
                          .reduce((sum, s) => sum + parseFloat(s.price), 0) * 
                          (1 - parseFloat(packageDiscount) / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPackageModalOpen(false);
                  setPackageServices([]);
                  setPackageDiscount('10');
                  setFormData({
                    name: '',
                    duration: '',
                    price: '',
                    currency: 'INR',
                    description: '',
                    category: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!formData.name.trim()) {
                    toast({
                      title: "Package name required",
                      description: "Please enter a name for your package.",
                      variant: "destructive"
                    });
                    return;
                  }
                  if (packageServices.length < 2) {
                    toast({
                      title: "Select more services",
                      description: "A package must include at least 2 services.",
                      variant: "destructive"
                    });
                    return;
                  }

                  // Calculate package details
                  const selectedServices = services.filter(s => packageServices.includes(s.id));
                  const totalDuration = selectedServices.reduce((sum, s) => sum + parseInt(s.duration), 0);
                  const originalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
                  const packagePrice = originalPrice * (1 - parseFloat(packageDiscount) / 100);

                  // Create package as a service
                  const newPackage: Service = {
                    id: Date.now().toString(),
                    name: formData.name,
                    duration: `${totalDuration} mins`,
                    price: packagePrice.toFixed(2),
                    currency: 'INR',
                    category: 'Package',
                    description: formData.description || 
                      `Includes: ${selectedServices.map(s => s.name).join(', ')}. Save ${packageDiscount}%!`,
                    isEnabled: true,
                    createdAt: new Date().toISOString(),
                    packageServices: packageServices, // Store included service IDs
                    originalPrice: originalPrice.toFixed(2),
                    discount: packageDiscount
                  };

                  saveServices([...services, newPackage]);
                  setIsPackageModalOpen(false);
                  setPackageServices([]);
                  setPackageDiscount('10');
                  setFormData({
                    name: '',
                    duration: '',
                    price: '',
                    currency: 'INR',
                    description: '',
                    category: '',
                  });

                  toast({
                    title: "Package created!",
                    description: `${newPackage.name} has been added to your services.`
                  });
                }}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!formData.name.trim() || packageServices.length < 2}
              >
                Create Package
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
