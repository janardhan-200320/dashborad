import { Calendar, TrendingUp, TrendingDown, Clock, Activity, DollarSign, AlertCircle, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; isUp: boolean };
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard = ({ title, value, trend, icon, colorClass }: StatCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span className={`flex items-center text-sm font-medium ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface RecentActivity {
  id: string;
  customerName: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
}

const DashboardOverview = () => {
  const recentActivities: RecentActivity[] = [
    { id: '1', customerName: 'John Doe', service: 'Technical Interview', time: '2 hours ago', status: 'confirmed' },
    { id: '2', customerName: 'Jane Smith', service: 'HR Screening', time: '3 hours ago', status: 'pending' },
    { id: '3', customerName: 'Robert Brown', service: 'Final Round', time: '5 hours ago', status: 'completed' },
    { id: '4', customerName: 'Alice Johnson', service: 'Phone Screen', time: '1 day ago', status: 'confirmed' },
    { id: '5', customerName: 'Mike Wilson', service: 'Team Meeting', time: '1 day ago', status: 'completed' },
  ];

  // Weekly chart data (last 7 days)
  const weeklyData = [
    { day: 'Mon', bookings: 12 },
    { day: 'Tue', bookings: 18 },
    { day: 'Wed', bookings: 8 },
    { day: 'Thu', bookings: 15 },
    { day: 'Fri', bookings: 22 },
    { day: 'Sat', bookings: 6 },
    { day: 'Sun', bookings: 4 },
  ];

  const maxBookings = Math.max(...weeklyData.map(d => d.bookings));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={8}
          trend={{ value: 12, isUp: true }}
          icon={<Calendar className="text-blue-600" size={24} />}
          colorClass="bg-blue-100"
        />
        <StatCard
          title="This Week's Bookings"
          value={85}
          trend={{ value: 8, isUp: true }}
          icon={<Activity className="text-green-600" size={24} />}
          colorClass="bg-green-100"
        />
        <StatCard
          title="Pending Confirmations"
          value={5}
          icon={<AlertCircle className="text-yellow-600" size={24} />}
          colorClass="bg-yellow-100"
        />
        <StatCard
          title="Upcoming Appointments"
          value={23}
          icon={<Clock className="text-purple-600" size={24} />}
          colorClass="bg-purple-100"
        />
      </div>

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Booking Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Bookings</CardTitle>
            <CardDescription>Bookings for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium text-gray-900">{data.bookings}</div>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all hover:from-blue-700 hover:to-blue-500"
                    style={{ height: `${(data.bookings / maxBookings) * 100}%`, minHeight: '20px' }}
                  />
                  <div className="text-xs font-medium text-gray-600">{data.day}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 5 bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.customerName}</p>
                    <p className="text-xs text-gray-600 truncate">{activity.service}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Next Appointment</p>
              <h3 className="text-xl font-bold text-gray-900">John Doe - Technical Interview</h3>
              <p className="text-sm text-gray-600 mt-1">Today at 3:00 PM (in 2 hours)</p>
            </div>
            <div className="p-4 bg-white rounded-full shadow-sm">
              <Clock className="text-blue-600" size={32} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
