import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Package, ChevronLeft, Share, Trash2, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import AddResourceModal from '@/components/resources/AddResourceModal';
import type { InsertResource, Resource } from '@shared/schema';

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSaveResource = async (resource: InsertResource) => {
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource),
      });

      if (!response.ok) throw new Error('Failed to create resource');

      const newResource = await response.json();
      setResources([...resources, newResource]);
      setIsAddModalOpen(false);
      setSelectedResourceId(newResource.id); // Show detail view of newly created resource
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  };

  // If a resource is selected, show detail view
  if (selectedResourceId) {
    const resource = resources.find(r => r.id === selectedResourceId);
    if (!resource) {
      setSelectedResourceId(null);
      return null;
    }

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedResourceId(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft size={20} />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">{resource.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share size={16} className="mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="basic-info" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
                <TabsTrigger value="assigned-calls">Assigned Sales Calls</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
            </div>

            <TabsContent value="basic-info" className="mt-6 space-y-8">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-lg bg-pink-200 flex items-center justify-center text-pink-700 font-semibold text-2xl">
                    {resource.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <Label className="text-gray-600 text-sm">Resource Name</Label>
                    <p className="text-gray-900 font-medium mt-1">{resource.name}</p>
                  </div>

                  <div>
                    <Label className="text-gray-600 text-sm">Status</Label>
                    <div className="mt-1">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Active
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-600 text-sm">User in Charge</Label>
                    <p className="text-gray-900 mt-1">-</p>
                  </div>

                  <div>
                    <Label className="text-gray-600 text-sm">Workspace</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-pink-200 flex items-center justify-center text-pink-700 font-semibold text-xs">
                        BH
                      </div>
                      <span className="text-gray-900">{resource.type || 'bharath'}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label className="text-gray-600 text-sm">Description</Label>
                    <p className="text-gray-900 mt-1">{resource.description || '-'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assigned-calls" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input className="pl-10" placeholder="Search Sales Call" />
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus size={16} className="mr-2" />
                  Assign
                </Button>
              </div>
              <div className="text-center py-12">
                <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-4 flex items-center justify-center">
                  <Package size={48} className="text-purple-400" />
                </div>
                <p className="text-gray-600">No Sales Call Assigned</p>
              </div>
            </TabsContent>

            <TabsContent value="availability" className="mt-6 space-y-8">
              {/* Working Hours */}
              <div className="border-l-4 border-purple-600 pl-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Working Hours</h3>
                    <p className="text-sm text-gray-600">Set weekly available days and hours.</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                    <Edit size={16} className="mr-2" />
                    Customize working hours
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    i
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{resource.name}</span> follows usual working hours.
                  </p>
                </div>
              </div>

              {/* Special Working Hours */}
              <div className="border-l-4 border-purple-600 pl-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Special Working Hours</h3>
                    <p className="text-sm text-gray-600">Add extra available days or hours.</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Unavailability */}
              <div className="border-l-4 border-purple-600 pl-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Unavailability</h3>
                    <p className="text-sm text-gray-600">Add extra unavailable days or hours.</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Calendar Integration</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="mb-2 text-2xl">📅</div>
                      <p className="font-medium mb-2">Zoho Calendar</p>
                      <Button variant="outline" size="sm" className="w-full">Connect</Button>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="mb-2 text-2xl">📧</div>
                      <p className="font-medium mb-2">Google Calendar</p>
                      <Button variant="outline" size="sm" className="w-full">Connect</Button>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="mb-2 text-2xl">📬</div>
                      <p className="font-medium mb-2">Outlook Calendar</p>
                      <Button variant="outline" size="sm" className="w-full">Connect</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Resources</h1>
            <Badge variant="outline">{resources.length}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input className="pl-10" placeholder="Search Resource" />
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} className="mr-2" /> New Resource
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-8">
        {resources.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="mx-auto w-40 h-40 bg-purple-50 rounded-full mb-6 flex items-center justify-center">
              <Package size={48} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources added.</h3>
            <p className="text-gray-600 mb-6">
              Add resources like conference rooms and equipment so customers can book them.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} className="mr-2" /> New Resource
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            <p className="p-8 text-gray-600">Resource list will appear here</p>
          </div>
        )}
      </div>

      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveResource}
      />
    </div>
  );
}
