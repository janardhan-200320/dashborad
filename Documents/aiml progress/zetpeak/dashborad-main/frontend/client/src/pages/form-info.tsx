import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Share2, Palette, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SalesCall {
  id: string;
  name: string;
  duration: string;
  type: string;
  color: string;
}

interface Salesperson {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function BookingPagesPage() {
  const { toast } = useToast();
  const [company, setCompany] = useState<any>(null);
  const [searchSalesCalls, setSearchSalesCalls] = useState('');
  const [searchSalespersons, setSearchSalespersons] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('zervos_company');
      if (raw) setCompany(JSON.parse(raw));
    } catch {}
  }, []);

  const eventTypeLabel = company?.eventTypeLabel || 'Sales Calls';
  const teamMemberLabel = company?.teamMemberLabel || 'Salespersons';

  const [salesCalls] = useState<SalesCall[]>([
    {
      id: '1',
      name: 'Lead Qualification Session',
      duration: '30 mins',
      type: 'One-on-One',
      color: 'bg-green-100 text-green-700'
    },
  ]);

  const [salespersons] = useState<Salesperson[]>([
    {
      id: '1',
      name: 'Bharath Reddy',
      email: 'bharathreddyn6@gmail.com',
      avatar: 'BH'
    },
  ]);

  const workspaceName = company?.name || 'bharath';

  const handleShare = () => {
    toast({
      title: 'Share Options',
      description: 'Booking page link ready to share',
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Booking Pages</h1>
            <HelpCircle size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Workspace Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                  {workspaceName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{workspaceName}</h2>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 size={16} />
                  Open Page
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                  <Share2 size={16} />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Palette size={16} />
                  Themes and Layouts
                </Button>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              This is the workspace booking page. It lists all the {eventTypeLabel.toLowerCase()} under this workspace.
            </p>
          </div>

          {/* Sales Calls Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{eventTypeLabel}</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchSalesCalls}
                    onChange={(e) => setSearchSalesCalls(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              {salesCalls.map((call) => (
                <div key={call.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`h-12 w-12 rounded-full ${call.color} flex items-center justify-center font-bold text-sm`}>
                    {call.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{call.name}</h4>
                    <p className="text-sm text-gray-600">
                      {call.duration} | {call.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salespersons Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{teamMemberLabel}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Each {teamMemberLabel.toLowerCase().slice(0, -1)} has their own booking page, which can be customized with a unique theme.
                  </p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchSalespersons}
                    onChange={(e) => setSearchSalespersons(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              {salespersons.map((person) => (
                <div key={person.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {person.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{person.name}</h4>
                    <p className="text-sm text-gray-600">{person.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
