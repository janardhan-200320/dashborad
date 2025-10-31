import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MapPin } from 'lucide-react';

export default function Locations() {
  const locations: any[] = []; // Replace with actual data from your store/API

  return (
    <div className="h-full flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">In-person Locations</h1>
            <Badge variant="outline">{locations.length}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select Workspace</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus size={16} className="mr-2" /> New In-person Location
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8">
        {locations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
              <MapPin size={48} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No in-person locations added.</h3>
            <p className="text-gray-600 mb-6">
              Add in-person locations to specify a meeting location for your appointments.
            </p>
            <Button>
              <Plus size={16} className="mr-2" /> New In-person Location
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Add your location list/grid here */}
            <p className="p-8 text-gray-600">Location list will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
