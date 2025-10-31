import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Clock, DollarSign, Tag, MoreVertical } from 'lucide-react';
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

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  category: string;
  isEnabled: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Technical Interview',
      duration: '60 mins',
      price: '$150',
      description: 'In-depth technical assessment for software engineering roles',
      category: 'Interview',
      isEnabled: true
    },
    {
      id: '2',
      name: 'HR Screening',
      duration: '30 mins',
      price: '$75',
      description: 'Initial screening call with HR team',
      category: 'Interview',
      isEnabled: true
    },
    {
      id: '3',
      name: 'Final Round',
      duration: '90 mins',
      price: '$200',
      description: 'Final interview with leadership team',
      category: 'Interview',
      isEnabled: true
    },
    {
      id: '4',
      name: 'Team Meeting',
      duration: '45 mins',
      price: '$100',
      description: 'Meet with potential team members',
      category: 'Consultation',
      isEnabled: false
    },
  ]);

  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
    description: '',
    category: '',
  });

  const categories = ['Interview', 'Consultation', 'Training', 'Meeting', 'Other'];

  const handleOpenNew = () => {
    setFormData({ name: '', duration: '', price: '', description: '', category: '' });
    setEditingService(null);
    setIsNewServiceOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description,
      category: service.category,
    });
    setEditingService(service);
    setIsNewServiceOpen(true);
  };

  const handleSave = () => {
    if (editingService) {
      // Update existing service
      setServices(services.map(s => 
        s.id === editingService.id 
          ? { ...s, ...formData }
          : s
      ));
    } else {
      // Create new service
      const newService: Service = {
        id: Date.now().toString(),
        ...formData,
        isEnabled: true
      };
      setServices([...services, newService]);
    }
    setIsNewServiceOpen(false);
  };

  const handleDelete = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleToggleEnabled = (id: string) => {
    setServices(services.map(s =>
      s.id === id ? { ...s, isEnabled: !s.isEnabled } : s
    ));
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-600 mt-1">Manage your bookable services and offerings</p>
          </div>
          <Button onClick={handleOpenNew} className="gap-2">
            <Plus size={18} />
            New Service
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
                !service.isEnabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    {!service.isEnabled && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                        Disabled
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    <Tag size={12} />
                    {service.category}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(service)}>
                      <Edit size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock size={16} className="text-gray-400" />
                  <span>{service.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <DollarSign size={16} className="text-gray-400" />
                  <span>{service.price}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {service.isEnabled ? 'Active' : 'Disabled'}
                </span>
                <Switch
                  checked={service.isEnabled}
                  onCheckedChange={() => handleToggleEnabled(service.id)}
                />
              </div>
            </div>
          ))}
        </div>

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="60 mins"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    placeholder="$150"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
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
      </div>
    </DashboardLayout>
  );
}
