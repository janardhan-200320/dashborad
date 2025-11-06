import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Download,
  Eye,
  Trash2,
  FileText,
  DollarSign,
  TrendingUp,
  Filter,
  Calendar,
  Mail,
} from 'lucide-react';
import {
  getAllInvoices,
  getInvoiceStats,
  deleteInvoice,
  downloadInvoiceHTML,
  type Invoice,
} from '@/lib/invoice-utils';
import InvoiceTemplate from '@/components/InvoiceTemplate';
import { useToast } from '@/hooks/use-toast';

export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(getAllInvoices());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const stats = useMemo(() => getInvoiceStats(), [invoices]);

  // Create test invoice for testing
  const handleCreateTestInvoice = async () => {
    const { createInvoice } = await import('@/lib/invoice-utils');
    const testInvoice = createInvoice({
      bookingId: 'BOOK-' + Date.now(),
      customer: {
        name: 'Vaishak',
        email: 'vaishak@example.com',
        phone: '+91 9876543210',
      },
      service: {
        name: 'Beard Design',
        duration: '30 min',
        price: 381.00,
      },
      amount: 4015.00,
      subtotal: 3824.00,
      taxAmount: 191.20,
      paymentMethod: 'Custom UPI',
      currency: '₹',
      status: 'Paid',
      company: {
        name: 'Test Company',
        email: 'test@company.com',
      },
      bookingDate: '01-11-2025',
      bookingTime: '10:00 AM',
      notes: 'Thank you for your business!',
    });
    
    setInvoices(getAllInvoices());
    toast({
      title: 'Test Invoice Created',
      description: `Invoice ${testInvoice.invoiceId} has been created`,
    });
  };

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.service.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    // Open the modal so user can download PDF
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
    
    toast({
      title: 'Invoice Opened',
      description: 'Click "Download PDF" button to save as PDF',
      duration: 3000,
    });
  };

  const handleSendEmail = async (invoice: Invoice) => {
    const { sendInvoiceEmail, logInvoiceEmail } = await import('@/lib/email-service');
    
    const success = await sendInvoiceEmail({
      to: invoice.customer.email,
      customerName: invoice.customer.name,
      invoiceId: invoice.invoiceId,
      amount: invoice.amount,
      currency: invoice.currency,
    });
    
    if (success) {
      logInvoiceEmail(invoice.invoiceId, invoice.customer.email);
      toast({
        title: 'Email Sent!',
        description: `Invoice sent to ${invoice.customer.email}`,
      });
    } else {
      toast({
        title: 'Email Failed',
        description: 'Please configure email settings first',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const success = deleteInvoice(invoiceId);
      if (success) {
        setInvoices(getAllInvoices());
        toast({
          title: 'Deleted',
          description: 'Invoice has been deleted',
        });
      }
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
    // Print will be triggered from the InvoiceTemplate component
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Manage and track all your billing invoices</p>
          </div>
          {invoices.length === 0 && (
            <Button onClick={handleCreateTestInvoice} className="bg-purple-600 hover:bg-purple-700">
              + Create Test Invoice
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="text-purple-600" size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-600">Total Invoices</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.paid}</span>
            </div>
            <p className="text-sm text-gray-600">Paid Invoices</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="text-yellow-600" size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(0)}</span>
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search by invoice ID, customer, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoiceId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {invoice.invoiceId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{invoice.customer.name}</div>
                          <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{invoice.service.name}</div>
                        <div className="text-xs text-gray-500">{invoice.service.duration}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(invoice.dateIssued).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">
                          {invoice.currency}{invoice.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download Invoice"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendEmail(invoice)}
                            title="Send Email to Customer"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Mail size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.invoiceId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Invoice"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Invoices will appear here when customers complete paid bookings'}
              </p>
            </div>
          )}
        </div>

        {/* View Invoice Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <InvoiceTemplate
                invoice={selectedInvoice}
                onClose={() => setIsViewModalOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
