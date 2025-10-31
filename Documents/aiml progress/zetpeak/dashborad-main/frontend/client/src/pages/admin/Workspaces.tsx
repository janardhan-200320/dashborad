import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Folder } from 'lucide-react';

export default function Workspaces() {
  const workspaces: any[] = []; // Replace with actual data from your store/API

  return (
    <div className="h-full flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Workspaces</h1>
            <Badge variant="outline">{workspaces.length}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input className="pl-10" placeholder="Search Workspace" />
            </div>
            <Button>
              <Plus size={16} className="mr-2" /> New Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8">
        {workspaces.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
              <Folder size={48} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces added.</h3>
            <p className="text-gray-600 mb-6">
              Add workspaces to organize your team and services.
            </p>
            <Button>
              <Plus size={16} className="mr-2" /> New Workspace
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Add your workspace list/grid here */}
            <p className="p-8 text-gray-600">Workspace list will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
