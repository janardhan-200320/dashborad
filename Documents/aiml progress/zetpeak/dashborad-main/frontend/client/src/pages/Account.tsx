import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Globe, Lock, Bell, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AccountPage() {
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    timezone: 'America/New_York',
    phone: '+1 (555) 123-4567',
    avatar: ''
  });

  useEffect(() => {
    const orgData = localStorage.getItem('zervos_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      setUserData({
        name: org.businessName || 'John Doe',
        email: org.email || 'john.doe@example.com',
        timezone: org.timezone || 'America/New_York',
        phone: org.phone || '+1 (555) 123-4567',
        avatar: org.avatar || ''
      });
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1">Manage your personal account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-semibold">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">Upload Photo</Button>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={userData.timezone}
                        onChange={(e) => setUserData({ ...userData, timezone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button>Save Changes</Button>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button>Update Password</Button>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive email updates about your bookings</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">SMS Notifications</p>
                          <p className="text-xs text-gray-500">Receive text messages for important updates</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">Push Notifications</p>
                          <p className="text-xs text-gray-500">Get notified in your browser</p>
                        </div>
                      </div>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
