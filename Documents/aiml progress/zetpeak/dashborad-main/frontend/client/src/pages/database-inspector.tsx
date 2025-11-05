import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Database, RefreshCw } from 'lucide-react';

export default function DatabaseInspector() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch organizations
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (orgError) {
        console.error('Organizations error:', orgError);
      } else {
        setOrganizations(orgs || []);
      }

      // Fetch businesses
      const { data: biz, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (bizError) {
        console.error('Businesses error:', bizError);
      } else {
        setBusinesses(biz || []);
      }

      // Fetch users
      const { data: usrs, error: usrError } = await supabase
        .from('users')
        .select('id, email, username, full_name, created_at')
        .order('created_at', { ascending: false });
      
      if (usrError) {
        console.error('Users error:', usrError);
      } else {
        setUsers(usrs || []);
      }

      toast({
        title: "Data Loaded",
        description: `Found ${orgs?.length || 0} organizations, ${biz?.length || 0} businesses, ${usrs?.length || 0} users`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an organization name",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: newOrgName,
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Organization "${newOrgName}" created with ID: ${data.id}`,
      });

      setNewOrgName('');
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create organization",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="text-indigo-600" />
              Database Inspector
            </h1>
            <p className="text-gray-600 mt-1">View and manage your Supabase data</p>
          </div>
          <Button onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            Refresh
          </Button>
        </div>

        {/* Create Organization */}
        <Card className="mb-6 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900">Create New Organization</CardTitle>
            <CardDescription>Create an organization to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g., My Business"
                  onKeyPress={(e) => e.key === 'Enter' && createOrganization()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={createOrganization} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Organization'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Organizations ({organizations.length})</span>
              {organizations.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  Use these IDs in your application
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No organizations found. Create one above to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {organizations.map((org) => (
                  <div key={org.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{org.name}</h3>
                        {org.description && (
                          <p className="text-sm text-gray-600">{org.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(org.id, 'Organization ID')}
                        className="gap-2"
                      >
                        <Copy size={14} />
                        Copy ID
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-gray-500">ID:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                          {org.id}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-500">Timezone:</span>
                        <span className="ml-2">{org.timezone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Currency:</span>
                        <span className="ml-2">{org.currency}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 ${org.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {org.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {org.email && (
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2">{org.email}</span>
                        </div>
                      )}
                      {org.phone && (
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <span className="ml-2">{org.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Businesses */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Businesses ({businesses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {businesses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No businesses found
              </div>
            ) : (
              <div className="space-y-3">
                {businesses.map((biz) => (
                  <div key={biz.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{biz.business_name}</h3>
                        {biz.business_description && (
                          <p className="text-sm text-gray-600">{biz.business_description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>ID: {biz.id}</span>
                          {biz.business_location && <span>📍 {biz.business_location}</span>}
                          {biz.currency_code && <span>💰 {biz.currency_code}</span>}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(biz.id, 'Business ID')}
                        className="gap-2"
                      >
                        <Copy size={14} />
                        Copy ID
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{user.full_name || user.username || 'Unnamed User'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {user.id}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(user.id, 'User ID')}
                        className="gap-2"
                      >
                        <Copy size={14} />
                        Copy ID
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Use These IDs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>1. Copy an Organization ID from above</p>
            <p>2. Use it in your WorkspaceContext or set as default organization</p>
            <p>3. All API calls will use this ID to filter data</p>
            <p className="mt-4 font-semibold">Example:</p>
            <pre className="bg-blue-100 p-3 rounded mt-2 overflow-x-auto">
              {`const { data } = useCustomers('your-org-id-here');`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
