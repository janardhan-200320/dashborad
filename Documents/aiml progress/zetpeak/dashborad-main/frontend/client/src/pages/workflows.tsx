import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, Zap, Mail, MessageSquare, Bell, Calendar, DollarSign,
  Clock, Users, Settings, Play, Pause, Trash2, Copy, Edit, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, GitBranch, Filter, ArrowRight, History,
  Code, Send, Smartphone, Database, Tag, Slack, Link, RefreshCw, TestTube,
  FileText, Download, Upload, ChevronUp, ChevronDown, GripVertical, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced interfaces for advanced workflow system
interface Workflow {
  id: string;
  name: string;
  description: string;
  version: number;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  isActive: boolean;
  executionCount: number;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
}

interface WorkflowTrigger {
  type: 'booking_created' | 'booking_rescheduled' | 'booking_cancelled' | 'booking_reminder' | 
        'payment_received' | 'customer_created' | 'time_based' | 'custom_event';
  label: string;
  config?: {
    time?: string; // for time-based triggers
    timezone?: string;
    daysBeforeAppointment?: number; // for reminders
    customEventName?: string;
  };
}

interface WorkflowAction {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'webhook' | 'calendar_event' | 'payment' | 
        'wait' | 'condition' | 'slack' | 'teams' | 'crm_sync' | 'add_tag';
  label: string;
  config: {
    // Email config
    to?: string;
    subject?: string;
    body?: string;
    template?: string;
    
    // SMS/WhatsApp config
    phoneNumber?: string;
    message?: string;
    
    // Webhook config
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    payload?: string;
      
    // Calendar config
    eventTitle?: string;
    eventDate?: string;
    duration?: number;
    
    // Wait config
    delayAmount?: number;
    delayUnit?: 'minutes' | 'hours' | 'days';
    
    // Condition config
    field?: string;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value?: string;
    thenActions?: string[]; // action IDs
    elseActions?: string[];
    
    // CRM config
    crmSystem?: 'salesforce' | 'hubspot' | 'zoho';
    action?: 'create_contact' | 'update_contact' | 'create_deal';
    
    // Tag config
    tagName?: string;
  };
  order: number;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
  logic?: 'AND' | 'OR';
}

interface WorkflowLog {
  id: string;
  workflowId: string;
  executionTime: string;
  status: 'success' | 'failed' | 'partial';
  duration: number;
  triggeredBy: string;
  actions: {
    actionId: string;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
  }[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  workflow: Partial<Workflow>;
}

export default function WorkflowsPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [testRunOpen, setTestRunOpen] = useState(false);
  const [addActionOpen, setAddActionOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<WorkflowAction | null>(null);
  const [selectedVariable, setSelectedVariable] = useState('');
  
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'booking_created',
    actions: [] as WorkflowAction[]
  });

  // Available variables for templates
  const variables = {
    customer: ['{{customer.name}}', '{{customer.email}}', '{{customer.phone}}', '{{customer.id}}'],
    booking: ['{{booking.id}}', '{{booking.date}}', '{{booking.time}}', '{{booking.status}}', '{{booking.duration}}'],
    service: ['{{service.name}}', '{{service.price}}', '{{service.duration}}', '{{service.category}}'],
    organization: ['{{organization.name}}', '{{organization.timezone}}', '{{organization.email}}', '{{organization.phone}}'],
    staff: ['{{staff.name}}', '{{staff.email}}', '{{staff.phone}}'],
    payment: ['{{payment.amount}}', '{{payment.status}}', '{{payment.method}}']
  };

  // Workflow templates
  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 't1',
      name: 'Booking Confirmation Flow',
      description: 'Send confirmation email and SMS when booking is created',
      category: 'Booking',
      workflow: {
        trigger: { type: 'booking_created', label: 'Booking Created' },
        actions: [
          {
            id: 'a1',
            type: 'email',
            label: 'Send Confirmation Email',
            config: {
              to: '{{customer.email}}',
              subject: 'Booking Confirmed - {{service.name}}',
              body: 'Hi {{customer.name}},\n\nYour booking for {{service.name}} on {{booking.date}} at {{booking.time}} has been confirmed.\n\nThank you!'
            },
            order: 1
          },
          {
            id: 'a2',
            type: 'sms',
            label: 'Send SMS Confirmation',
            config: {
              phoneNumber: '{{customer.phone}}',
              message: 'Hi {{customer.name}}, your booking is confirmed for {{booking.date}} at {{booking.time}}.'
            },
            order: 2
          }
        ]
      }
    },
    {
      id: 't2',
      name: '24h Reminder Flow',
      description: 'Send reminder 24 hours before appointment',
      category: 'Reminders',
      workflow: {
        trigger: { type: 'booking_reminder', label: 'Booking Reminder', config: { daysBeforeAppointment: 1 } },
        actions: [
          {
            id: 'a1',
            type: 'email',
            label: 'Send Reminder Email',
            config: {
              to: '{{customer.email}}',
              subject: 'Reminder: Appointment Tomorrow',
              body: 'Hi {{customer.name}},\n\nThis is a reminder that you have an appointment tomorrow at {{booking.time}}.\n\nSee you soon!'
            },
            order: 1
          }
        ]
      }
    },
    {
      id: 't3',
      name: 'Post-Payment Flow',
      description: 'Thank customer and sync to CRM after payment',
      category: 'Payment',
      workflow: {
        trigger: { type: 'payment_received', label: 'Payment Received' },
        actions: [
          {
            id: 'a1',
            type: 'email',
            label: 'Send Receipt',
            config: {
              to: '{{customer.email}}',
              subject: 'Payment Received - {{payment.amount}}',
              body: 'Thank you for your payment of {{payment.amount}}.'
            },
            order: 1
          },
          {
            id: 'a2',
            type: 'crm_sync',
            label: 'Sync to CRM',
            config: {
              crmSystem: 'salesforce',
              action: 'update_contact'
            },
            order: 2
          }
        ]
      }
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('zervos_workflows');
    const savedLogs = localStorage.getItem('zervos_workflow_logs');
    
    if (saved) {
      setWorkflows(JSON.parse(saved));
    } else {
      // Default workflows
      const defaultWorkflows: Workflow[] = [
        {
          id: '1',
          name: 'Booking Confirmation',
          description: 'Send confirmation email and SMS to client when booking is created',
          version: 1,
          trigger: { type: 'booking_created', label: 'Booking Created' },
          actions: [
            {
              id: 'a1',
              type: 'email',
              label: 'Send Confirmation Email',
              config: {
                to: '{{customer.email}}',
                subject: 'Booking Confirmed!',
                body: 'Hi {{customer.name}}, your booking is confirmed for {{booking.date}}.'
              },
              order: 1
            },
            {
              id: 'a2',
              type: 'sms',
              label: 'Send SMS',
              config: {
                phoneNumber: '{{customer.phone}}',
                message: 'Your booking is confirmed!'
              },
              order: 2
            }
          ],
          isActive: true,
          executionCount: 245,
          lastRun: '2 hours ago',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['confirmation', 'booking']
        },
        {
          id: '2',
          name: 'Appointment Reminder',
          description: 'Send reminder 24 hours before appointment',
          version: 1,
          trigger: { type: 'booking_reminder', label: 'Booking Reminder (24h)', config: { daysBeforeAppointment: 1 } },
          actions: [
            {
              id: 'a3',
              type: 'email',
              label: 'Send Reminder',
              config: {
                to: '{{customer.email}}',
                subject: 'Reminder: Appointment Tomorrow',
                body: 'Hi {{customer.name}}, reminder for your appointment on {{booking.date}}.'
              },
              order: 1
            }
          ],
          isActive: true,
          executionCount: 189,
          lastRun: '5 hours ago',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['reminder']
        }
      ];
      setWorkflows(defaultWorkflows);
      localStorage.setItem('zervos_workflows', JSON.stringify(defaultWorkflows));
    }

    if (savedLogs) {
      setWorkflowLogs(JSON.parse(savedLogs));
    }
  }, []);

  const saveWorkflows = (updated: Workflow[]) => {
    setWorkflows(updated);
    localStorage.setItem('zervos_workflows', JSON.stringify(updated));
  };

  const handleCreateWorkflow = () => {
    const workflow: Workflow = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      trigger: {
        type: newWorkflow.trigger as any,
        label: triggerLabels[newWorkflow.trigger as keyof typeof triggerLabels]
      },
      actions: [],
      isActive: false,
      executionCount: 0
    };
    
    const updated = [...workflows, workflow];
    saveWorkflows(updated);
    setCreateModalOpen(false);
    setNewWorkflow({ name: '', description: '', trigger: 'booking_created', actions: [] });
    toast({ title: "Workflow created", description: "You can now add actions to your workflow" });
  };

  const handleToggleActive = (id: string) => {
    const updated = workflows.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    );
    saveWorkflows(updated);
    toast({ 
      title: updated.find(w => w.id === id)?.isActive ? "Workflow activated" : "Workflow deactivated",
      description: "Changes saved successfully"
    });
  };

  const handleDeleteWorkflow = (id: string) => {
    const updated = workflows.filter(w => w.id !== id);
    saveWorkflows(updated);
    toast({ title: "Workflow deleted", description: "Workflow removed successfully" });
  };

  const handleDuplicateWorkflow = (workflow: Workflow) => {
    const duplicate: Workflow = {
      ...workflow,
      id: Date.now().toString(),
      name: `${workflow.name} (Copy)`,
      version: 1,
      isActive: false,
      executionCount: 0,
      lastRun: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...workflows, duplicate];
    saveWorkflows(updated);
    toast({ title: "Workflow duplicated", description: "New workflow created" });
  };

  const handleAddAction = (actionType: WorkflowAction['type']) => {
    if (!editingWorkflow) return;

    const newAction: WorkflowAction = {
      id: `action_${Date.now()}`,
      type: actionType,
      label: actionLabels[actionType],
      config: {},
      order: editingWorkflow.actions.length + 1
    };

    setEditingAction(newAction);
    setAddActionOpen(true);
  };

  const handleSaveAction = () => {
    if (!editingWorkflow || !editingAction) return;

    const updatedActions = editingAction.order === 0
      ? [...editingWorkflow.actions, { ...editingAction, order: editingWorkflow.actions.length + 1 }]
      : editingWorkflow.actions.map(a => a.id === editingAction.id ? editingAction : a);

    const updatedWorkflow = {
      ...editingWorkflow,
      actions: updatedActions,
      version: editingWorkflow.version + 1,
      updatedAt: new Date().toISOString()
    };

    const updated = workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w);
    saveWorkflows(updated);
    setEditingWorkflow(updatedWorkflow);
    setEditingAction(null);
    setAddActionOpen(false);
    toast({ title: "Action saved", description: "Workflow updated successfully" });
  };

  const handleDeleteAction = (actionId: string) => {
    if (!editingWorkflow) return;

    const updatedActions = editingWorkflow.actions
      .filter(a => a.id !== actionId)
      .map((a, idx) => ({ ...a, order: idx + 1 }));

    const updatedWorkflow = {
      ...editingWorkflow,
      actions: updatedActions,
      version: editingWorkflow.version + 1,
      updatedAt: new Date().toISOString()
    };

    const updated = workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w);
    saveWorkflows(updated);
    setEditingWorkflow(updatedWorkflow);
    toast({ title: "Action deleted" });
  };

  const handleMoveAction = (actionId: string, direction: 'up' | 'down') => {
    if (!editingWorkflow) return;

    const currentIndex = editingWorkflow.actions.findIndex(a => a.id === actionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= editingWorkflow.actions.length) return;

    const updatedActions = [...editingWorkflow.actions];
    [updatedActions[currentIndex], updatedActions[newIndex]] = [updatedActions[newIndex], updatedActions[currentIndex]];
    updatedActions.forEach((a, idx) => a.order = idx + 1);

    const updatedWorkflow = {
      ...editingWorkflow,
      actions: updatedActions,
      version: editingWorkflow.version + 1,
      updatedAt: new Date().toISOString()
    };

    const updated = workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w);
    saveWorkflows(updated);
    setEditingWorkflow(updatedWorkflow);
  };

  const handleTestRun = () => {
    if (!editingWorkflow) return;

    // Simulate workflow execution
    const log: WorkflowLog = {
      id: `log_${Date.now()}`,
      workflowId: editingWorkflow.id,
      executionTime: new Date().toISOString(),
      status: 'success',
      duration: Math.floor(Math.random() * 5000) + 1000,
      triggeredBy: 'Manual Test',
      actions: editingWorkflow.actions.map(action => ({
        actionId: action.id,
        status: Math.random() > 0.1 ? 'success' : 'failed',
        error: Math.random() > 0.9 ? 'Connection timeout' : undefined
      }))
    };

    const updatedLogs = [log, ...workflowLogs].slice(0, 100);
    setWorkflowLogs(updatedLogs);
    localStorage.setItem('zervos_workflow_logs', JSON.stringify(updatedLogs));
    
    setTestRunOpen(true);
    toast({ title: "Test run completed", description: `Executed in ${log.duration}ms` });
  };

  const handleExportWorkflow = (workflow: Workflow) => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow_${workflow.name.replace(/\s+/g, '_')}.json`;
    link.click();
    toast({ title: "Workflow exported" });
  };

  const handleImportWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const newWorkflow: Workflow = {
          ...imported,
          id: Date.now().toString(),
          name: `${imported.name} (Imported)`,
          isActive: false,
          executionCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const updated = [...workflows, newWorkflow];
        saveWorkflows(updated);
        toast({ title: "Workflow imported successfully" });
      } catch (error) {
        toast({ title: "Import failed", description: "Invalid workflow file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleCreateFromTemplate = (template: WorkflowTemplate) => {
    const workflow: Workflow = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      version: 1,
      trigger: template.workflow.trigger!,
      actions: template.workflow.actions || [],
      isActive: false,
      executionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [template.category.toLowerCase()]
    };
    
    const updated = [...workflows, workflow];
    saveWorkflows(updated);
    setTemplatesOpen(false);
    toast({ title: "Workflow created from template" });
  };

  const insertVariable = (variable: string, field: 'subject' | 'body' | 'message') => {
    if (!editingAction) return;
    
    const currentValue = editingAction.config[field] || '';
    setEditingAction({
      ...editingAction,
      config: {
        ...editingAction.config,
        [field]: currentValue + variable
      }
    });
  };

  const triggerLabels: Record<string, string> = {
    booking_created: 'Booking Created',
    booking_rescheduled: 'Booking Rescheduled',
    booking_cancelled: 'Booking Cancelled',
    booking_reminder: 'Booking Reminder',
    payment_received: 'Payment Received',
    customer_created: 'Customer Created',
    time_based: 'Time Based',
    custom_event: 'Custom Event'
  };

  const triggerIcons: Record<string, any> = {
    booking_created: CheckCircle2,
    booking_rescheduled: Clock,
    booking_cancelled: XCircle,
    booking_reminder: Bell,
    payment_received: DollarSign,
    customer_created: Users,
    time_based: Clock,
    custom_event: Zap
  };

  const actionIcons: Record<string, any> = {
    email: Mail,
    sms: MessageSquare,
    whatsapp: Smartphone,
    notification: Bell,
    webhook: Link,
    calendar_event: Calendar,
    payment: DollarSign,
    wait: Clock,
    condition: GitBranch,
    slack: Slack,
    teams: Users,
    crm_sync: Database,
    add_tag: Tag
  };

  const actionLabels: Record<string, string> = {
    email: 'Send Email',
    sms: 'Send SMS',
    whatsapp: 'Send WhatsApp',
    notification: 'Send Notification',
    webhook: 'Call Webhook',
    calendar_event: 'Add Calendar Event',
    payment: 'Process Payment',
    wait: 'Wait/Delay',
    condition: 'Add Condition',
    slack: 'Send Slack Message',
    teams: 'Send Teams Message',
    crm_sync: 'Sync to CRM',
    add_tag: 'Add Tag'
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && w.isActive) ||
                         (filterStatus === 'inactive' && !w.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
              <p className="text-sm text-gray-600 mt-1">Automate your booking processes and communications</p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
              <Plus size={18} />
              Create Workflow
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{workflows.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {workflows.filter(w => w.isActive).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">98.5%</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflows</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflows List */}
          <div className="space-y-4">
            {filteredWorkflows.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search' : 'Create your first workflow to get started'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
                      <Plus size={18} />
                      Create Workflow
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredWorkflows.map((workflow) => {
                const TriggerIcon = triggerIcons[workflow.trigger.type];
                return (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-lg ${workflow.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <TriggerIcon size={24} className={workflow.isActive ? 'text-green-600' : 'text-gray-400'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                              <Badge variant={workflow.isActive ? "default" : "secondary"}>
                                {workflow.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                            
                            {/* Trigger and Actions Flow */}
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="gap-1">
                                <TriggerIcon size={14} />
                                {workflow.trigger.label}
                              </Badge>
                              <ArrowRight size={16} className="text-gray-400" />
                              <div className="flex items-center gap-2">
                                {workflow.actions.slice(0, 3).map((action) => {
                                  const ActionIcon = actionIcons[action.type];
                                  return (
                                    <Badge key={action.id} variant="outline" className="gap-1">
                                      <ActionIcon size={14} />
                                      {action.type}
                                    </Badge>
                                  );
                                })}
                                {workflow.actions.length > 3 && (
                                  <Badge variant="outline">+{workflow.actions.length - 3} more</Badge>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Play size={14} />
                                <span>{workflow.executionCount} executions</span>
                              </div>
                              {workflow.lastRun && (
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>Last run {workflow.lastRun}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingWorkflow(workflow);
                              setBuilderOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(workflow.id)}
                          >
                            {workflow.isActive ? <Pause size={16} /> : <Play size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateWorkflow(workflow)}
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Create Workflow Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Set up automated actions for your booking events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Workflow Name *</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="e.g., Booking Confirmation Flow"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  placeholder="Describe what this workflow does"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger Event *</Label>
                <Select value={newWorkflow.trigger} onValueChange={(v) => setNewWorkflow({ ...newWorkflow, trigger: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking_created">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Booking Created
                      </div>
                    </SelectItem>
                    <SelectItem value="booking_rescheduled">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        Booking Rescheduled
                      </div>
                    </SelectItem>
                    <SelectItem value="booking_cancelled">
                      <div className="flex items-center gap-2">
                        <XCircle size={16} />
                        Booking Cancelled
                      </div>
                    </SelectItem>
                    <SelectItem value="booking_reminder">
                      <div className="flex items-center gap-2">
                        <Bell size={16} />
                        Booking Reminder (24h before)
                      </div>
                    </SelectItem>
                    <SelectItem value="payment_received">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        Payment Received
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow} disabled={!newWorkflow.name || !newWorkflow.trigger}>
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Advanced Workflow Builder Modal */}
        <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
          <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Edit Workflow: {editingWorkflow?.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setTestRunOpen(true)}>
                    <Play size={14} className="mr-1" />
                    Test Run
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setLogsOpen(true)}>
                    <FileText size={14} className="mr-1" />
                    Logs
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editingWorkflow && handleExportWorkflow(editingWorkflow)}>
                    <Download size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription>
                Version {editingWorkflow?.version || '1.0'} • Last updated: {editingWorkflow?.updatedAt ? new Date(editingWorkflow.updatedAt).toLocaleDateString() : 'Never'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Tabs defaultValue="actions">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="actions">Actions ({editingWorkflow?.actions?.length || 0})</TabsTrigger>
                  <TabsTrigger value="conditions">Conditions ({editingWorkflow?.conditions?.length || 0})</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                {/* Actions Tab */}
                <TabsContent value="actions" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Configure actions to execute when the trigger fires</p>
                    <Button size="sm" onClick={() => setAddActionOpen(true)} className="gap-2">
                      <Plus size={16} />
                      Add Action
                    </Button>
                  </div>

                  {/* Action List */}
                  {editingWorkflow?.actions && editingWorkflow.actions.length > 0 ? (
                    <div className="space-y-3">
                      {editingWorkflow.actions
                        .sort((a, b) => a.order - b.order)
                        .map((action, index) => {
                          const Icon = actionIcons[action.type];
                          return (
                            <div key={action.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                                    </div>
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <Icon size={16} className="text-purple-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-sm">{actionLabels[action.type]}</h4>
                                      {action.config?.retryOnFailure && (
                                        <Badge variant="outline" className="text-xs">Retry Enabled</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {action.type === 'email' && `To: ${action.config?.to || 'Not configured'}`}
                                      {action.type === 'sms' && `Phone: ${action.config?.phoneNumber || 'Not configured'}`}
                                      {action.type === 'whatsapp' && `WhatsApp: ${action.config?.phoneNumber || 'Not configured'}`}
                                      {action.type === 'webhook' && `URL: ${action.config?.url || 'Not configured'}`}
                                      {action.type === 'wait' && `Delay: ${action.config?.delayAmount || '0'} ${action.config?.delayUnit || 'minutes'}`}
                                      {action.type === 'calendar_event' && `Event: ${action.config?.eventTitle || 'Not configured'}`}
                                      {action.type === 'crm_sync' && `System: ${action.config?.crmSystem || 'Not configured'}`}
                                      {action.type === 'add_tag' && `Tag: ${action.config?.tagName || 'Not configured'}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => handleMoveAction(action.id, 'up')} disabled={index === 0}>
                                    <ChevronUp size={14} />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleMoveAction(action.id, 'down')} disabled={index === editingWorkflow.actions.length - 1}>
                                    <ChevronDown size={14} />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setEditingAction(action);
                                    setAddActionOpen(true);
                                  }}>
                                    <Edit size={14} />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDeleteAction(action.id)}>
                                    <Trash2 size={14} className="text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Zap size={48} className="mx-auto text-gray-300 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-1">No actions yet</h3>
                      <p className="text-sm text-gray-500 mb-4">Add your first action to get started</p>
                      <Button size="sm" onClick={() => setAddActionOpen(true)} className="gap-2">
                        <Plus size={16} />
                        Add Action
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Conditions Tab */}
                <TabsContent value="conditions" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Set conditions for when this workflow should execute</p>
                    <Button size="sm" className="gap-2">
                      <Plus size={16} />
                      Add Condition
                    </Button>
                  </div>

                  {editingWorkflow?.conditions && editingWorkflow.conditions.length > 0 ? (
                    <div className="space-y-3">
                      {editingWorkflow.conditions.map((condition) => (
                        <div key={condition.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GitBranch size={20} className="text-orange-500" />
                              <div>
                                <p className="text-sm font-medium">
                                  {condition.field} {condition.operator} {condition.value}
                                </p>
                                <p className="text-xs text-gray-500">Logic: {condition.logic}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost">
                                <Edit size={14} />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 size={14} className="text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <GitBranch size={48} className="mx-auto text-gray-300 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-1">No conditions set</h3>
                      <p className="text-sm text-gray-500 mb-4">Add conditions to control workflow execution</p>
                      <Button size="sm" className="gap-2">
                        <Plus size={16} />
                        Add Condition
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Workflow Name</Label>
                      <Input
                        value={editingWorkflow?.name || ''}
                        onChange={(e) => {
                          if (editingWorkflow) {
                            const updated = { ...editingWorkflow, name: e.target.value };
                            setEditingWorkflow(updated);
                          }
                        }}
                        placeholder="Enter workflow name"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingWorkflow?.description || ''}
                        onChange={(e) => {
                          if (editingWorkflow) {
                            const updated = { ...editingWorkflow, description: e.target.value };
                            setEditingWorkflow(updated);
                          }
                        }}
                        placeholder="Describe what this workflow does"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-4">
                      <div>
                        <Label>Active Status</Label>
                        <p className="text-sm text-gray-500">Enable or disable this workflow</p>
                      </div>
                      <Switch
                        checked={editingWorkflow?.isActive}
                        onCheckedChange={(checked) => {
                          if (editingWorkflow) {
                            const updated = { ...editingWorkflow, isActive: checked };
                            setEditingWorkflow(updated);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editingWorkflow?.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                        <Button size="sm" variant="outline">
                          <Plus size={14} className="mr-1" />
                          Add Tag
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-4 mt-4">
                  <p className="text-sm text-gray-600">Apply pre-built workflow templates</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workflowTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                            <Badge variant="outline" className="text-xs">{template.category}</Badge>
                          </div>
                          <Button size="sm" onClick={() => handleCreateFromTemplate(template)}>
                            Apply
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{template.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{template.workflow.actions.length} actions</span>
                          <span>•</span>
                          <span>{template.workflow.conditions?.length || 0} conditions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBuilderOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                if (editingWorkflow) {
                  const updated = workflows.map(w => w.id === editingWorkflow.id ? editingWorkflow : w);
                  setWorkflows(updated);
                  localStorage.setItem('zervos_workflows', JSON.stringify(updated));
                  setBuilderOpen(false);
                }
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Action Modal */}
        <Dialog open={addActionOpen} onOpenChange={setAddActionOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAction ? 'Edit Action' : 'Add Action'}</DialogTitle>
              <DialogDescription>Configure the action details and settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!editingAction && (
                <div>
                  <Label>Action Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['email', 'sms', 'whatsapp', 'webhook', 'calendar_event', 'wait', 'crm_sync', 'add_tag'] as WorkflowAction['type'][]).map((type) => {
                      const Icon = actionIcons[type];
                      return (
                        <Button
                          key={type}
                          variant="outline"
                          className="justify-start gap-2 h-auto py-3"
                          onClick={() => handleAddAction(type)}
                        >
                          <Icon size={16} />
                          <span className="text-sm">{actionLabels[type]}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {editingAction && (
                <>
                  {/* Email Action Config */}
                  {editingAction.type === 'email' && (
                    <div className="space-y-4">
                      <div>
                        <Label>To Email</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editingAction.config?.to || ''}
                            onChange={(e) => setEditingAction({
                              ...editingAction,
                              config: { ...editingAction.config, to: e.target.value }
                            })}
                            placeholder="recipient@example.com or {{customer.email}}"
                          />
                          <Button size="sm" variant="outline" onClick={() => insertVariable('{{customer.email}}', 'to')}>
                            <Tag size={14} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Subject</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editingAction.config?.subject || ''}
                            onChange={(e) => setEditingAction({
                              ...editingAction,
                              config: { ...editingAction.config, subject: e.target.value }
                            })}
                            placeholder="Email subject"
                          />
                          <Button size="sm" variant="outline" onClick={() => insertVariable('{{customer.name}}', 'subject')}>
                            <Tag size={14} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Body</Label>
                        <Textarea
                          value={editingAction.config?.body || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, body: e.target.value }
                          })}
                          placeholder="Email body content. Use {{customer.name}}, {{booking.date}}, etc."
                          rows={6}
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(variables).map(([category, vars]) => (
                            <div key={category} className="flex gap-1">
                              {Object.keys(vars).slice(0, 2).map((varKey) => (
                                <Button
                                  key={varKey}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => insertVariable(vars[varKey as keyof typeof vars], 'body')}
                                >
                                  {vars[varKey as keyof typeof vars]}
                                </Button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SMS Action Config */}
                  {editingAction.type === 'sms' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Phone Number</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editingAction.config?.phoneNumber || ''}
                            onChange={(e) => setEditingAction({
                              ...editingAction,
                              config: { ...editingAction.config, phoneNumber: e.target.value }
                            })}
                            placeholder="+1234567890 or {{customer.phone}}"
                          />
                          <Button size="sm" variant="outline" onClick={() => insertVariable('{{customer.phone}}', 'phoneNumber')}>
                            <Tag size={14} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          value={editingAction.config?.message || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, message: e.target.value }
                          })}
                          placeholder="SMS message. Use {{customer.name}}, {{booking.date}}, etc."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Action Config */}
                  {editingAction.type === 'whatsapp' && (
                    <div className="space-y-4">
                      <div>
                        <Label>WhatsApp Number</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editingAction.config?.phoneNumber || ''}
                            onChange={(e) => setEditingAction({
                              ...editingAction,
                              config: { ...editingAction.config, phoneNumber: e.target.value }
                            })}
                            placeholder="+1234567890 or {{customer.phone}}"
                          />
                          <Button size="sm" variant="outline" onClick={() => insertVariable('{{customer.phone}}', 'phoneNumber')}>
                            <Tag size={14} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          value={editingAction.config?.message || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, message: e.target.value }
                          })}
                          placeholder="WhatsApp message"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Webhook Action Config */}
                  {editingAction.type === 'webhook' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Webhook URL</Label>
                        <Input
                          value={editingAction.config?.url || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, url: e.target.value }
                          })}
                          placeholder="https://api.example.com/webhook"
                        />
                      </div>
                      <div>
                        <Label>Method</Label>
                        <Select
                          value={editingAction.config?.method || 'POST'}
                          onValueChange={(value) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, method: value }
                          })}
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="PATCH">PATCH</option>
                          <option value="DELETE">DELETE</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Headers (JSON)</Label>
                        <Textarea
                          value={editingAction.config?.headers || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, headers: e.target.value }
                          })}
                          placeholder='{"Authorization": "Bearer token"}'
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Payload (JSON)</Label>
                        <Textarea
                          value={editingAction.config?.payload || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, payload: e.target.value }
                          })}
                          placeholder='{"customerId": "{{customer.id}}"}'
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Wait/Delay Action Config */}
                  {editingAction.type === 'wait' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Delay Amount</Label>
                        <Input
                          type="number"
                          value={editingAction.config?.delayAmount || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, delayAmount: e.target.value }
                          })}
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <Label>Delay Unit</Label>
                        <Select
                          value={editingAction.config?.delayUnit || 'minutes'}
                          onValueChange={(value) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, delayUnit: value }
                          })}
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Calendar Event Action Config */}
                  {editingAction.type === 'calendar_event' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Event Title</Label>
                        <Input
                          value={editingAction.config?.eventTitle || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, eventTitle: e.target.value }
                          })}
                          placeholder="Appointment with {{customer.name}}"
                        />
                      </div>
                      <div>
                        <Label>Event Date</Label>
                        <Input
                          value={editingAction.config?.eventDate || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, eventDate: e.target.value }
                          })}
                          placeholder="{{booking.date}}"
                        />
                      </div>
                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={editingAction.config?.duration || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, duration: e.target.value }
                          })}
                          placeholder="60"
                        />
                      </div>
                    </div>
                  )}

                  {/* CRM Sync Action Config */}
                  {editingAction.type === 'crm_sync' && (
                    <div className="space-y-4">
                      <div>
                        <Label>CRM System</Label>
                        <Select
                          value={editingAction.config?.crmSystem || ''}
                          onValueChange={(value) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, crmSystem: value }
                          })}
                        >
                          <option value="salesforce">Salesforce</option>
                          <option value="hubspot">HubSpot</option>
                          <option value="zoho">Zoho CRM</option>
                          <option value="pipedrive">Pipedrive</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Action</Label>
                        <Select
                          value={editingAction.config?.action || ''}
                          onValueChange={(value) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, action: value }
                          })}
                        >
                          <option value="create_contact">Create Contact</option>
                          <option value="update_contact">Update Contact</option>
                          <option value="create_deal">Create Deal</option>
                          <option value="add_note">Add Note</option>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Add Tag Action Config */}
                  {editingAction.type === 'add_tag' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Tag Name</Label>
                        <Input
                          value={editingAction.config?.tagName || ''}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, tagName: e.target.value }
                          })}
                          placeholder="VIP Customer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Common Settings */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Advanced Settings</h4>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Retry on Failure</Label>
                        <p className="text-xs text-gray-500">Automatically retry if action fails</p>
                      </div>
                      <Switch
                        checked={editingAction.config?.retryOnFailure || false}
                        onCheckedChange={(checked) => setEditingAction({
                          ...editingAction,
                          config: { ...editingAction.config, retryOnFailure: checked }
                        })}
                      />
                    </div>
                    {editingAction.config?.retryOnFailure && (
                      <div className="mt-3">
                        <Label>Max Retry Attempts</Label>
                        <Input
                          type="number"
                          value={editingAction.config?.retryAttempts || 3}
                          onChange={(e) => setEditingAction({
                            ...editingAction,
                            config: { ...editingAction.config, retryAttempts: parseInt(e.target.value) }
                          })}
                          placeholder="3"
                          min="1"
                          max="5"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {editingAction && (
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setAddActionOpen(false);
                  setEditingAction(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAction}>
                  Save Action
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Workflow Logs Modal */}
        <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Workflow Execution Logs</DialogTitle>
              <DialogDescription>View detailed execution history and results</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {workflowLogs.filter(log => log.workflowId === editingWorkflow?.id).length > 0 ? (
                <div className="space-y-3">
                  {workflowLogs
                    .filter(log => log.workflowId === editingWorkflow?.id)
                    .sort((a, b) => new Date(b.executionTime).getTime() - new Date(a.executionTime).getTime())
                    .map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            <div>
                              <p className="text-sm font-medium">
                                {log.status === 'success' ? 'Completed Successfully' : log.status === 'failed' ? 'Failed' : 'In Progress'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(log.executionTime).toLocaleString()} • Duration: {log.duration}ms • Triggered by: {log.triggeredBy}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {log.actions.map((action, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs pl-5">
                              {action.status === 'success' ? (
                                <CheckCircle2 size={14} className="text-green-500" />
                              ) : action.status === 'failed' ? (
                                <XCircle size={14} className="text-red-500" />
                              ) : (
                                <Clock size={14} className="text-yellow-500" />
                              )}
                              <span className="text-gray-600">{action.actionName}</span>
                              {action.error && <span className="text-red-500">• {action.error}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">No execution logs yet</h3>
                  <p className="text-sm text-gray-500">Logs will appear here after workflow executions</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Run Modal */}
        <Dialog open={testRunOpen} onOpenChange={setTestRunOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Test Workflow</DialogTitle>
              <DialogDescription>Simulate workflow execution with sample data</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900 mb-1">Test Mode</h4>
                    <p className="text-xs text-blue-700">
                      This will simulate the workflow execution without sending actual emails, SMS, or making real API calls.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Test Scenario</Label>
                  <Select defaultValue="new_booking">
                    <option value="new_booking">New Booking Created</option>
                    <option value="rescheduled">Booking Rescheduled</option>
                    <option value="cancelled">Booking Cancelled</option>
                    <option value="reminder">24h Reminder</option>
                  </Select>
                </div>
                <div>
                  <Label>Sample Customer Email</Label>
                  <Input defaultValue="test.customer@example.com" />
                </div>
                <div>
                  <Label>Sample Booking Date</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTestRunOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                handleTestRun();
                setTestRunOpen(false);
                setLogsOpen(true);
              }}>
                <Play size={14} className="mr-2" />
                Run Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
