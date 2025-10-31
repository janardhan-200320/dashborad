import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Building2,
  CreditCard,
  LogOut,
  HelpCircle,
  Video,
  Sparkles,
  BookOpen,
  Users,
  Code,
  Trash2,
  Globe,
  Smartphone,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useLocation } from 'wouter';

interface UserData {
  name: string;
  email: string;
  timezone: string;
  avatar?: string;
}

interface SubscriptionData {
  type: 'Free' | 'Premium Trial' | 'Enterprise';
  salespersons: { current: number; max: number };
  workspaces: { current: number; max: number };
  resources: { current: number; max: number };
}

export default function ProfileDropdown() {
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch user data from localStorage or use mock data
  const getUserData = (): UserData => {
    const orgData = localStorage.getItem('zervos_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      return {
        name: org.businessName || 'John Doe',
        email: org.email || 'john.doe@example.com',
        timezone: org.timezone || 'America/New_York',
        avatar: org.avatar
      };
    }
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      timezone: 'America/New_York'
    };
  };

  // Mock subscription data (can be fetched from API)
  const getSubscriptionData = (): SubscriptionData => {
    const subscriptionData = localStorage.getItem('zervos_subscription');
    if (subscriptionData) {
      return JSON.parse(subscriptionData);
    }
    // Initialize default subscription data
    const defaultData: SubscriptionData = {
      type: 'Premium Trial',
      salespersons: { current: 1, max: 10 },
      workspaces: { current: 1, max: 3 },
      resources: { current: 0, max: 10 }
    };
    localStorage.setItem('zervos_subscription', JSON.stringify(defaultData));
    return defaultData;
  };

  const userData = getUserData();
  const subscriptionData = getSubscriptionData();

  const handleSignOut = () => {
    // Clear all keys that belong to this app's localStorage namespace
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('zervos_')) localStorage.removeItem(key);
      });
    } catch (e) {
      // fallback: try removing common keys
      localStorage.removeItem('zervos_user_session');
      localStorage.removeItem('zervos_organization');
      localStorage.removeItem('zervos_subscription');
    }

    // Navigate to the public/start page and reload to ensure any in-memory state is cleared
    setLocation('/');
    // Force a hard reload so any React state/context is reset
    setTimeout(() => window.location.reload(), 50);
  };

  const handleViewOrgDetails = () => {
    setLocation('/dashboard/admin-center');
  };

  const handleMyAccount = () => {
    setLocation('/dashboard/account');
  };

  const handleManageSubscription = () => {
    setLocation('/dashboard/subscription');
  };

  const handleDeleteAccount = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Redirect to homepage or login
    setLocation('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Premium Trial':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const calculateProgress = (current: number, max: number) => {
    return (current / max) * 100;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(userData.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          {/* Profile Section */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userData.name}</p>
                <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Globe size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-400">{userData.timezone}</p>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Profile Actions */}
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleViewOrgDetails} className="cursor-pointer">
              <Building2 className="mr-2 h-4 w-4" />
              <span>View Org Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMyAccount} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>My Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Subscription Section */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">Subscription</span>
              </div>
              <Badge className={`${getSubscriptionColor(subscriptionData.type)} border`}>
                {subscriptionData.type}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mb-3"
              onClick={handleManageSubscription}
            >
              Manage
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>

            {/* Usage Stats */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Salespersons</span>
                  <span className="font-medium text-gray-900">
                    {subscriptionData.salespersons.current}/{subscriptionData.salespersons.max}
                  </span>
                </div>
                <Progress
                  value={calculateProgress(
                    subscriptionData.salespersons.current,
                    subscriptionData.salespersons.max
                  )}
                  className="h-1.5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Workspaces</span>
                  <span className="font-medium text-gray-900">
                    {subscriptionData.workspaces.current}/{subscriptionData.workspaces.max}
                  </span>
                </div>
                <Progress
                  value={calculateProgress(
                    subscriptionData.workspaces.current,
                    subscriptionData.workspaces.max
                  )}
                  className="h-1.5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Resources</span>
                  <span className="font-medium text-gray-900">
                    {subscriptionData.resources.current}/{subscriptionData.resources.max}
                  </span>
                </div>
                <Progress
                  value={calculateProgress(
                    subscriptionData.resources.current,
                    subscriptionData.resources.max
                  )}
                  className="h-1.5"
                />
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Help & Support Section */}
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase px-4 py-2">
            Help & Support
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => window.open('https://help.example.com', '_blank')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Need Help?</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => window.open('https://webinars.example.com', '_blank')}
            >
              <Video className="mr-2 h-4 w-4" />
              <span>Webinars</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => window.open('https://whatsnew.example.com', '_blank')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>What's New</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => window.open('https://docs.example.com', '_blank')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Help Guide</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => window.open('https://community.example.com', '_blank')}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Community</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => window.open('https://api.example.com', '_blank')}
            >
              <Code className="mr-2 h-4 w-4" />
              <span>Developer API</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Mobile App Links */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-500 mb-3">Get Bookings on Your Mobile Device</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 hover:bg-black hover:text-white transition-colors"
                onClick={() => window.open('https://apps.apple.com', '_blank')}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                App Store
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 hover:bg-green-600 hover:text-white transition-colors"
                onClick={() => window.open('https://play.google.com', '_blank')}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Play Store
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Delete Account */}
          <div className="px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">Delete Your Account?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete your account? This action cannot be undone.
              All your data, including bookings, workflows, and settings will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteAccount();
                setDeleteDialogOpen(false);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
