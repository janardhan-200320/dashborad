import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Building2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function BasicInformation() {
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orgData, setOrgData] = useState({
    businessName: 'bharath',
    email: '',
    contactNumber: '',
    timeZone: 'Asia/Kolkata - IST (+05:30)',
    currency: 'INR',
    startOfWeek: 'Monday',
    timeFormat: '12 Hours',
    zohoBranding: true,
    logo: '',
  });

  const [editData, setEditData] = useState({ ...orgData });

  useEffect(() => {
    const saved = localStorage.getItem('zervos_organization');
    if (saved) {
      const data = JSON.parse(saved);
      setOrgData(data);
      setEditData(data);
    }
  }, []);

  const handleSave = () => {
    setOrgData(editData);
    localStorage.setItem('zervos_organization', JSON.stringify(editData));
    setEditModalOpen(false);
    toast({ title: "Success", description: "Organization settings updated successfully" });
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Basic Information</h1>
        </div>
        <Button variant="ghost" size="sm" className="text-indigo-600 gap-2">
          <Info size={16} />
        </Button>
      </div>

      {/* Organization Logo and Name */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 size={32} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{orgData.businessName}</h2>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEditModalOpen(true)}
            className="gap-2"
          >
            <Edit size={16} />
            Edit
          </Button>
        </div>
      </div>

      {/* Organization Details Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Business Name</p>
            <p className="text-base font-medium text-gray-900">{orgData.businessName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-base font-medium text-gray-900">{orgData.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Contact Number</p>
            <p className="text-base font-medium text-gray-900">{orgData.contactNumber || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Time Zone</p>
            <p className="text-base font-medium text-gray-900">{orgData.timeZone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Currency</p>
            <p className="text-base font-medium text-gray-900">{orgData.currency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Start of the Week</p>
            <p className="text-base font-medium text-gray-900">{orgData.startOfWeek}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Time Format</p>
            <p className="text-base font-medium text-gray-900">{orgData.timeFormat}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Zoho Bookings Branding</p>
            <Badge variant={orgData.zohoBranding ? "default" : "secondary"} className="mt-1">
              {orgData.zohoBranding ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500 mb-2">Custom Fields For In-App Booking</p>
            <Button variant="outline" size="sm">
              Hide
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Basic Information</DialogTitle>
            <DialogDescription>
              Update your organization's basic information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Business Name *</Label>
              <Input
                value={editData.businessName}
                onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                placeholder="Enter business name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  placeholder="contact@business.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  value={editData.contactNumber}
                  onChange={(e) => setEditData({ ...editData, contactNumber: e.target.value })}
                  placeholder="+91 1234567890"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Select value={editData.timeZone} onValueChange={(v) => setEditData({ ...editData, timeZone: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata - IST (+05:30)">Asia/Kolkata - IST (+05:30)</SelectItem>
                    <SelectItem value="America/New_York - EST (-05:00)">America/New_York - EST (-05:00)</SelectItem>
                    <SelectItem value="Europe/London - GMT (+00:00)">Europe/London - GMT (+00:00)</SelectItem>
                    <SelectItem value="Asia/Tokyo - JST (+09:00)">Asia/Tokyo - JST (+09:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={editData.currency} onValueChange={(v) => setEditData({ ...editData, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start of the Week</Label>
                <Select value={editData.startOfWeek} onValueChange={(v) => setEditData({ ...editData, startOfWeek: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Format</Label>
                <Select value={editData.timeFormat} onValueChange={(v) => setEditData({ ...editData, timeFormat: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12 Hours">12 Hours</SelectItem>
                    <SelectItem value="24 Hours">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
