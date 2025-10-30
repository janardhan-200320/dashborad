import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, UsersRound, Settings } from 'lucide-react';

export default function Customers() {
  const customers: any[] = []; // Replace with actual data from your store/API

  return (
    <div className="h-full flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
            <Badge variant="outline">{customers.length}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input className="pl-10" placeholder="Search" />
            </div>
            <Button variant="ghost" size="icon">
              <Settings size={18} />
            </Button>
            <Button>
              <Plus size={16} className="mr-2" /> New Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8">
        {customers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
              <UsersRound size={48} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers added</h3>
            <p className="text-gray-600 mb-6">
              Add customers to book appointments with them. When customers book<br />
              using your booking page, they'll be added here automatically.
            </p>
            <Button>
              <Plus size={16} className="mr-2" /> New Customer
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Add your customer list/grid here */}
            <p className="p-8 text-gray-600">Customer list will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
