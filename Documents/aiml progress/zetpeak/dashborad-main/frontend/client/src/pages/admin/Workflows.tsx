import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Zap, Edit, Trash2, Play, Pause, Copy, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  actionCount: number;
  executionCount: number;
  lastRun?: string;
  createdAt: string;
}

export default function Workflows() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Booking Confirmation',
      description: 'Send confirmation email when a booking is created',
      trigger: 'Booking Created',
      isActive: true,
      actionCount: 2,
      executionCount: 145,
      lastRun: '2 hours ago',
      createdAt: '2024-10-15'
    },
    {
      id: '2',
      name: 'Appointment Reminder',
      description: 'Send reminder 24 hours before appointment',
      trigger: 'Scheduled Time',
      isActive: true,
      actionCount: 3,
      executionCount: 89,
      lastRun: '1 day ago',
      createdAt: '2024-10-12'
    },
    {
      id: '3',
      name: 'Payment Received',
      description: 'Update CRM and send receipt when payment is received',
      trigger: 'Payment Received',
      isActive: false,
      actionCount: 4,
      executionCount: 23,
      lastRun: '3 days ago',
      createdAt: '2024-10-08'
    }
  ]);

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'booking_created',
    isActive: true
  });

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWorkflow = () => {
    if (!newWorkflow.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a workflow name",
        variant: "destructive"
      });
      return;
    }

    const workflow: Workflow = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      trigger: getTriggerLabel(newWorkflow.trigger),
      isActive: newWorkflow.isActive,
      actionCount: 0,
      executionCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setWorkflows([...workflows, workflow]);
    setAddModalOpen(false);
    setNewWorkflow({
      name: '',
      description: '',
      trigger: 'booking_created',
      isActive: true
    });

    toast({
      title: "Workflow Created",
      description: `${workflow.name} has been created successfully`
    });

    // Navigate to workflow builder to configure actions
    setTimeout(() => {
      setLocation(`/dashboard/workflows?edit=${workflow.id}`);
    }, 500);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setEditModalOpen(true);
  };

  const handleUpdateWorkflow = () => {
    if (!editingWorkflow) return;

    setWorkflows(workflows.map(w => 
      w.id === editingWorkflow.id ? editingWorkflow : w
    ));

    setEditModalOpen(false);
    setEditingWorkflow(null);

    toast({
      title: "Workflow Updated",
      description: `${editingWorkflow.name} has been updated successfully`
    });
  };

  const handleDeleteWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return;

    if (confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      setWorkflows(workflows.filter(w => w.id !== id));
      toast({
        title: "Workflow Deleted",
        description: `${workflow.name} has been deleted`
      });
    }
  };

  const handleToggleActive = (id: string) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));

    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      toast({
        title: workflow.isActive ? "Workflow Paused" : "Workflow Activated",
        description: `${workflow.name} is now ${workflow.isActive ? 'paused' : 'active'}`
      });
    }
  };

  const handleDuplicateWorkflow = (workflow: Workflow) => {
    const duplicate: Workflow = {
      ...workflow,
      id: Date.now().toString(),
      name: `${workflow.name} (Copy)`,
      executionCount: 0,
      lastRun: undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setWorkflows([...workflows, duplicate]);
    toast({
      title: "Workflow Duplicated",
      description: `Created a copy of ${workflow.name}`
    });
  };

  const getTriggerLabel = (trigger: string): string => {
    const triggers: Record<string, string> = {
      'booking_created': 'Booking Created',
      'booking_rescheduled': 'Booking Rescheduled',
      'booking_cancelled': 'Booking Cancelled',
      'payment_received': 'Payment Received',
      'customer_created': 'Customer Created',
      'time_based': 'Scheduled Time'
    };
    return triggers[trigger] || trigger;
  };

  const handleConfigureWorkflow = (id: string) => {
    setLocation(`/dashboard/workflows?edit=${id}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Workflow Automation</h2>
        <p className="text-sm text-gray-600">
          Create and manage automated workflows for your business processes
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus size={18} />
          Create Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="grid gap-4">
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Zap className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No workflows found</h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first workflow'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setAddModalOpen(true)} className="gap-2">
                <Plus size={18} />
                Create Workflow
              </Button>
            )}
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <Badge variant={workflow.isActive ? "default" : "secondary"}>
                      {workflow.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Zap size={14} />
                      Trigger: {workflow.trigger}
                    </span>
                    <span>•</span>
                    <span>{workflow.actionCount} actions</span>
                    <span>•</span>
                    <span>{workflow.executionCount} executions</span>
                    {workflow.lastRun && (
                      <>
                        <span>•</span>
                        <span>Last run: {workflow.lastRun}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(workflow.id)}
                    title={workflow.isActive ? 'Pause' : 'Activate'}
                  >
                    {workflow.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfigureWorkflow(workflow.id)}
                    title="Configure"
                  >
                    <Settings size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateWorkflow(workflow)}
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditWorkflow(workflow)}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Workflow Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Create a new automated workflow. You'll be able to configure actions after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="e.g., Booking Confirmation"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="What does this workflow do?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="trigger">Trigger</Label>
              <Select
                value={newWorkflow.trigger}
                onValueChange={(value) => setNewWorkflow({ ...newWorkflow, trigger: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking_created">Booking Created</SelectItem>
                  <SelectItem value="booking_rescheduled">Booking Rescheduled</SelectItem>
                  <SelectItem value="booking_cancelled">Booking Cancelled</SelectItem>
                  <SelectItem value="payment_received">Payment Received</SelectItem>
                  <SelectItem value="customer_created">Customer Created</SelectItem>
                  <SelectItem value="time_based">Scheduled Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Start Active</Label>
              <Switch
                id="isActive"
                checked={newWorkflow.isActive}
                onCheckedChange={(checked) => setNewWorkflow({ ...newWorkflow, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddWorkflow}>Create & Configure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>
              Update workflow settings
            </DialogDescription>
          </DialogHeader>

          {editingWorkflow && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Workflow Name *</Label>
                <Input
                  id="edit-name"
                  value={editingWorkflow.name}
                  onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                  placeholder="e.g., Booking Confirmation"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingWorkflow.description}
                  onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                  placeholder="What does this workflow do?"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-isActive">Active</Label>
                <Switch
                  id="edit-isActive"
                  checked={editingWorkflow.isActive}
                  onCheckedChange={(checked) => setEditingWorkflow({ ...editingWorkflow, isActive: checked })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateWorkflow}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
