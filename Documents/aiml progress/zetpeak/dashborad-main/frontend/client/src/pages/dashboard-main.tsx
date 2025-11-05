import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardOverview from '@/components/DashboardOverview';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  Search,
  Download,
  Eye,
  Edit2,
  Video,
  MessageSquare,
  Share2,
  Info,
  Plus,
  Copy,
  Star,
  TrendingUp,
  Filter,
  Globe,
  Bell,
  Lock,
  CreditCard,
  Palette,
  Image as ImageIcon,
  Shield,
  CheckCircle,
  DollarSign,
  Zap,
  Activity,
  Award,
} from 'lucide-react';

type Tab = 'bookings' | 'sessions' | 'responses' | 'settings' | 'overview';
type BookingFilter = 'upcoming' | 'important' | 'recurring' | 'completed' | 'cancelled';

const DashboardMain = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<BookingFilter>('completed');
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailReminders: true,
    emailCancellations: true,
    smsBookings: false,
    smsReminders: true,
    smsCancellations: false,
  });
  const [darkMode, setDarkMode] = useState(false);

  // Completed bookings data
  const completedBookings = [
    {
      id: 1,
      date: 'Tuesday, 05 Aug 2025',
      time: '07:00pm - 07:30pm',
      name: 'Ajay N',
      duration: '30 mins',
      platform: 'Google Meet',
      service: 'Science based Business Development Marketing',
    },
    {
      id: 2,
      date: 'Friday, 01 Aug 2025',
      time: '04:00pm - 04:30pm',
      name: 'Pragadeesh Gurumoorthy',
      duration: '30 mins',
      platform: 'Google Meet',
      service: 'Science based Business Development Marketing',
    },
    {
      id: 3,
      date: 'Friday, 25 Jul 2025',
      time: '11:00am - 11:30am',
      name: 'Kavya GR',
      duration: '30 mins',
      platform: 'Google Meet',
      service: 'Science based Business Development Marketing',
    },
  ];

  // Filter counts
  const filterCounts = {
    upcoming: 0,
    important: 1,
    recurring: 0,
    completed: 8,
    cancelled: 0,
  };

  const renderBookings = () => (
    <>
      {/* Search and Export Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Product Title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'upcoming'
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Upcoming ({filterCounts.upcoming})
            </button>
            <button
              onClick={() => setActiveFilter('important')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'important'
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Important ({filterCounts.important})
            </button>
            <button
              onClick={() => setActiveFilter('recurring')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'recurring'
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Recurring ({filterCounts.recurring})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'completed'
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Completed ({filterCounts.completed})
            </button>
            <button
              onClick={() => setActiveFilter('cancelled')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'cancelled'
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancelled ({filterCounts.cancelled})
            </button>
          </div>

          {/* Bookings List or Empty State */}
          {activeFilter === 'completed' && completedBookings.length > 0 ? (
            <div className="space-y-4">
              {completedBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="font-medium">{booking.date}</span>
                        <span>•</span>
                        <Clock size={16} />
                        <span>{booking.time}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Booking with {booking.name} ({booking.duration})
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Video size={16} className="text-green-600" />
                        <span className="font-medium">{booking.platform}</span>
                        <span>|</span>
                        <span>{booking.service}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      Edit
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                        <path d="M4 8L8 12L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="flex justify-center mb-6">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-gray-300">
                  <circle cx="60" cy="50" r="30" fill="currentColor" opacity="0.2"/>
                  <path d="M45 45C45 45 50 40 60 40C70 40 75 45 75 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="52" cy="52" r="2" fill="currentColor"/>
                  <circle cx="68" cy="52" r="2" fill="currentColor"/>
                  <path d="M40 75L45 80L50 75L55 80L60 75L65 80L70 75L75 80L80 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your schedule looks empty. Share sessions<br />across your socials to get bookings.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                  <MessageSquare size={18} />
                  Learn More
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium text-gray-700">
                  <Share2 size={18} />
                  Share Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Stats */}
        <div className="space-y-6">
          {/* Profile Link Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">superprofile.bio/bookings/pr...</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Eye size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <Info size={14} className="text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">8</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Amount Earned</span>
                <Info size={14} className="text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">₹3000</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Total views</span>
                <Info size={14} className="text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">169</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Conversions</span>
                <Info size={14} className="text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">4.1%</p>
            </div>
          </div>

          {/* Share Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share your booking page</h3>
                <p className="text-sm text-gray-600">View the different ways you can share this.</p>
              </div>
            </div>
            <button className="w-full bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Share
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'bookings':
        return renderBookings();
      case 'sessions':
        return <div className="p-6 text-gray-600">Sessions tab content (to be implemented)</div>;
      case 'responses':
        return <div className="p-6 text-gray-600">Responses tab content (to be implemented)</div>;
      case 'settings':
        return <div className="p-6 text-gray-600">Settings tab content (to be implemented)</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        {/* Header Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'bookings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'sessions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'responses'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Responses
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default DashboardMain;
