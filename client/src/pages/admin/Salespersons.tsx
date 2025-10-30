import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Salespersons() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [salespersons, setSalespersons] = useState([
    {
      id: '1',
      name: 'Bharath Reddy',
      email: 'bharathreddyn6@gmail.com',
      role: 'Super Admin',
      workspace: 'bharath',
      status: 'Active'
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('zervos_team_members');
    if (saved) {
      const data = JSON.parse(saved);
      if (data && data.length > 0) {
        const formatted = data.map((member: any) => ({
          id: member.id || Date.now().toString(),
          name: member.name,
          email: member.email,
          role: member.role || 'Staff',
          workspace: 'bharath',
          status: 'Active'
        }));
        setSalespersons(formatted);
      }
    }
  }, []);

  const filteredSalespersons = salespersons.filter(sp =>
    sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Salespersons</h1>
          <Badge variant="secondary" className="text-sm">
            {salespersons.length}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button className="gap-2">
            <Plus size={16} />
            New Salesperson
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                USER
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROLE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ASSIGNED WORKSPACES
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSalespersons.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-pink-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{person.name}</div>
                      <div className="text-sm text-gray-500">{person.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{person.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="secondary" className="bg-pink-50 text-pink-700">
                    BH {person.workspace}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">{person.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredSalespersons.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No salespersons found</p>
          </div>
        )}
      </div>
    </div>
  );
}
