import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  FileText,
  Home,
  Building2,
  Menu,
  X,
  LogOut,
  PhoneCall,
  LayoutGrid,
  Clock3
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

interface Company {
  name: string;
  industry: string;
  eventTypeLabel?: string;
  teamMemberLabel?: string;
  availableDays?: string[];
  availableTimeStart?: string;
  availableTimeEnd?: string;
  currency?: string;
}

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const savedCompany = localStorage.getItem('zervos_company');
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    }
  }, []);

  // Use dynamic labels from company profile
  const eventTypeLabel = company?.eventTypeLabel || 'Sales Calls';
  const teamMemberLabel = company?.teamMemberLabel || 'Salespersons';

  const navigation = [
    { name: 'Appointments', icon: Calendar, path: '/dashboard/appointments' },
    { name: eventTypeLabel, icon: PhoneCall, path: '/dashboard/callbacks' },
    { name: 'Workflows', icon: Settings, path: '/dashboard/workflows' },
    { name: teamMemberLabel, icon: Users, path: '/dashboard/settings' },
    { name: 'Booking Pages', icon: FileText, path: '/dashboard/form-info' },
  ];

  const secondaryNavigation = [
    { name: 'Admin Center', icon: LayoutGrid, path: '/dashboard/admin-center' },
  ];

  const isActive = (path: string) => location === path;

  const handleLogout = () => {
    localStorage.removeItem('zervos_company');
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-[#0a1628] text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={24} />
              {sidebarOpen && (
                <div>
                  <h1 className="font-bold text-lg">Zervos</h1>
                  {company && (
                    <p className="text-xs text-gray-400 truncate">{company.name}</p>
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-700 rounded lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                href={item.path}
              >
                <a
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#1e3a5f] border-l-4 border-blue-400'
                      : 'hover:bg-gray-800 border-l-4 border-transparent'
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="font-medium">{item.name}</span>}
                </a>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 mx-4 border-t border-gray-700"></div>

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.path}
                href={item.path}
              >
                <a
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#1e3a5f] border-l-4 border-blue-400'
                      : 'hover:bg-gray-800 border-l-4 border-transparent'
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="font-medium">{item.name}</span>}
                </a>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-700 p-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <ProfileDropdown />
              <div className="flex-1 ml-2">
                <p className="font-medium text-sm">Admin User</p>
                <p className="text-xs text-gray-400">admin@zervos.com</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <ProfileDropdown />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => isActive(item.path))?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {company && (
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                  <Building2 size={18} className="text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{company.name}</p>
                    <p className="text-xs text-gray-500">{company.industry}</p>
                  </div>
                </div>
              )}
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
