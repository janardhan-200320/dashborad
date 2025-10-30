import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';

// Import admin sections
import BasicInformation from './BasicInformation';
import BusinessHours from './BusinessHours';
import BookingPage from './BookingPage';
import LoginPreferences from './LoginPreferences';
import Salespersons from './Salespersons';
import Workspaces from './Workspaces';
import Resources from './Resources';
import Locations from './Locations';
import Customers from './Customers';
import Reports from './Reports';
import Integrations from './Integrations';
import Customizations from './Customizations';
import DataAdmin from './DataAdmin';

type AdminSection = 
  | 'basic-info' 
  | 'business-hours' 
  | 'booking-page' 
  | 'login-prefs' 
  | 'salespersons'
  | 'workspaces' 
  | 'resources' 
  | 'locations' 
  | 'customers' 
  | 'reports'
  | 'integrations' 
  | 'customizations' 
  | 'data-admin';

export default function AdminCenter() {
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState<AdminSection>('basic-info');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sidebar expansion states
  const [organizationExpanded, setOrganizationExpanded] = useState(true);
  const [modulesExpanded, setModulesExpanded] = useState(false);
  const [integrationsExpanded, setIntegrationsExpanded] = useState(false);
  const [customizationsExpanded, setCustomizationsExpanded] = useState(false);
  const [dataAdminExpanded, setDataAdminExpanded] = useState(false);

  const renderContent = () => {
    switch (currentSection) {
      case 'basic-info':
        return <BasicInformation />;
      case 'business-hours':
        return <BusinessHours />;
      case 'booking-page':
        return <BookingPage />;
      case 'login-prefs':
        return <LoginPreferences />;
      case 'salespersons':
        return <Salespersons />;
      case 'workspaces':
        return <Workspaces />;
      case 'resources':
        return <Resources />;
      case 'locations':
        return <Locations />;
      case 'customers':
        return <Customers />;
      case 'reports':
        return <Reports />;
      case 'integrations':
        return <Integrations />;
      case 'customizations':
        return <Customizations />;
      case 'data-admin':
        return <DataAdmin />;
      default:
        return <BasicInformation />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/dashboard')}
              className="mb-3 gap-2"
            >
              <ArrowLeft size={16} />
              Admin Center
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* Organization Section */}
            <div>
              <button
                onClick={() => setOrganizationExpanded(!organizationExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span>Organization</span>
                {organizationExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {organizationExpanded && (
                <div className="ml-3 mt-1 space-y-1">
                  <button
                    onClick={() => setCurrentSection('basic-info')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'basic-info' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Basic Information
                  </button>
                  <button
                    onClick={() => setCurrentSection('business-hours')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'business-hours' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Business Hours
                  </button>
                  <button
                    onClick={() => setCurrentSection('booking-page')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'booking-page' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Business Booking Page
                  </button>
                  <button
                    onClick={() => setCurrentSection('login-prefs')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'login-prefs' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Customer Login Preferences
                  </button>
                  <button
                    onClick={() => setCurrentSection('salespersons')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'salespersons' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Salespersons
                  </button>
                </div>
              )}
            </div>

            {/* Modules Section */}
            <div>
              <button
                onClick={() => setModulesExpanded(!modulesExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span>Modules</span>
                {modulesExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {modulesExpanded && (
                <div className="ml-3 mt-1 space-y-1">
                  <button
                    onClick={() => setCurrentSection('workspaces')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'workspaces' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Workspaces
                  </button>
                  <button
                    onClick={() => setCurrentSection('resources')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'resources' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Resources
                  </button>
                  <button
                    onClick={() => setCurrentSection('locations')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'locations' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    In-person Locations
                  </button>
                  <button
                    onClick={() => setCurrentSection('customers')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'customers' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Customers
                  </button>
                  <button
                    onClick={() => setCurrentSection('reports')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'reports' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Reports
                  </button>
                </div>
              )}
            </div>

            {/* Integrations Section */}
            <div>
              <button
                onClick={() => setIntegrationsExpanded(!integrationsExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span>Integrations</span>
                {integrationsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {integrationsExpanded && (
                <div className="ml-3 mt-1 space-y-1">
                  <button
                    onClick={() => setCurrentSection('integrations')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'integrations' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    All Integrations
                  </button>
                </div>
              )}
            </div>

            {/* Product Customizations Section */}
            <div>
              <button
                onClick={() => setCustomizationsExpanded(!customizationsExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span>Product Customizations</span>
                {customizationsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {customizationsExpanded && (
                <div className="ml-3 mt-1 space-y-1">
                  <button
                    onClick={() => setCurrentSection('customizations')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'customizations' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    All Customizations
                  </button>
                </div>
              )}
            </div>

            {/* Data Administration Section */}
            <div>
              <button
                onClick={() => setDataAdminExpanded(!dataAdminExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span>Data Administration</span>
                {dataAdminExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {dataAdminExpanded && (
                <div className="ml-3 mt-1 space-y-1">
                  <button
                    onClick={() => setCurrentSection('data-admin')}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      currentSection === 'data-admin' 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Data & Privacy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}
