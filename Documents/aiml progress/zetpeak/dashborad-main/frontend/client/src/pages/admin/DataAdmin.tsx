import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, FileDown, FileUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DataAdminSection = 'privacy' | 'domain-auth' | 'export';

interface DataAdminProps {
  initialSection?: DataAdminSection;
}

interface ExportOptions {
  module: string;
  format: 'csv' | 'json';
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export default function DataAdmin({ initialSection }: DataAdminProps) {
  const [section, setSection] = useState<DataAdminSection>(initialSection ?? 'export');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    module: 'appointments',
    format: 'csv'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (initialSection) setSection(initialSection);
  }, [initialSection]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        format: exportOptions.format
      });

      // Add optional parameters
      if (exportOptions.dateFrom) params.append('date_from', exportOptions.dateFrom);
      if (exportOptions.dateTo) params.append('date_to', exportOptions.dateTo);
      if (exportOptions.status) params.append('status', exportOptions.status);

      const response = await fetch(`http://localhost:8000/api/export/${exportOptions.module}?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from response headers or generate one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${exportOptions.module}_export.${exportOptions.format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export completed',
        description: `${filename} has been downloaded successfully.`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('http://localhost:8000/api/export/all?format=json', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Bulk export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'full_export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Bulk export completed',
        description: 'full_export.json has been downloaded successfully.'
      });
    } catch (error) {
      console.error('Bulk export error:', error);
      toast({
        title: 'Bulk export failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl">
        {section === 'privacy' && (
          <div>
            <h1 className="text-2xl font-semibold">Privacy and Security</h1>
            <p className="text-gray-600 mt-2">Manage data protection, GDPR and cookie settings for your account.</p>

            <div className="mt-6 bg-white border border-gray-100 rounded-md p-6">
              <h3 className="text-lg font-medium">Data Protection</h3>
              <p className="text-sm text-gray-600 mt-2">Controls for anonymization, retention and data export policies.</p>

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Enable automatic data anonymization after 30 days</span>
                </label>

                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Enable GDPR consent tracking</span>
                </label>

                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Show cookie notice to visitors</span>
                </label>
              </div>

              <div className="mt-6">
                <Button>Save settings</Button>
              </div>
            </div>
          </div>
        )}

        {section === 'domain-auth' && (
          <div>
            <h1 className="text-2xl font-semibold">Domain Authentication</h1>
            <p className="text-gray-600 mt-2">Set up domain verification and authentication (SPF/DKIM) for sending and security.</p>

            <div className="mt-6 bg-white border border-gray-100 rounded-md p-6">
              <h3 className="text-lg font-medium">Verify your domain</h3>
              <p className="text-sm text-gray-600 mt-2">Add DNS TXT records to prove ownership and configure email authentication.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Domain</label>
                  <Input placeholder="example.com" className="mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification status</label>
                  <div className="mt-1 text-sm text-gray-600">Not verified</div>
                </div>

                <div className="flex items-center gap-3">
                  <Button>Begin verification</Button>
                  <Button variant="outline">View DNS instructions</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {section === 'export' && (
          <div>
            <h1 className="text-2xl font-semibold">Export Data</h1>
            <p className="text-gray-600 mt-2">Export bookings, customers or other records as CSV or JSON files.</p>

            <div className="mt-6 space-y-6">
              {/* Individual Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileDown size={20} />
                    Export Individual Module
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                      <Select 
                        value={exportOptions.module} 
                        onValueChange={(value) => setExportOptions(prev => ({ ...prev, module: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appointments">Appointments</SelectItem>
                          <SelectItem value="customers">Customers</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="team-members">Team Members</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                      <Select 
                        value={exportOptions.format} 
                        onValueChange={(value: 'csv' | 'json') => setExportOptions(prev => ({ ...prev, format: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {exportOptions.module === 'appointments' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                        <Select 
                          value={exportOptions.status || 'all'} 
                          onValueChange={(value) => setExportOptions(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                      <Input 
                        type="date"
                        value={exportOptions.dateFrom || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                      <Input 
                        type="date"
                        value={exportOptions.dateTo || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, dateTo: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button 
                      onClick={handleExport} 
                      disabled={isExporting}
                      className="flex items-center gap-2"
                    >
                      <Download size={16} />
                      {isExporting ? 'Exporting...' : 'Export Data'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp size={20} />
                    Bulk Export All Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Export all your data including appointments, customers, services, team members, workspaces, resources, locations, integrations, custom labels, and roles in a single JSON file.
                  </p>
                  
                  <Button 
                    onClick={handleBulkExport} 
                    disabled={isExporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    {isExporting ? 'Exporting...' : 'Export All Data'}
                  </Button>
                </CardContent>
              </Card>

              {/* Export History/Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>
                      <strong>CSV Format:</strong> Comma-separated values, compatible with Excel and most spreadsheet applications.
                    </div>
                    <div>
                      <strong>JSON Format:</strong> JavaScript Object Notation, suitable for developers and data analysis tools.
                    </div>
                    <div>
                      <strong>Date Filters:</strong> Only available for appointments. Leave empty to export all records.
                    </div>
                    <div>
                      <strong>File Naming:</strong> Files are automatically named with the module name and current date.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
