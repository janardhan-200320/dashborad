import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Settings,
  FileText,
  Building2,
  Menu,
  PhoneCall,
  LayoutGrid,
  Bell,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import WorkspaceSelector from './WorkspaceSelector';
import AnimatedButton from './AnimatedButton';
import PageTransition from './PageTransition';
import TopProgressBar from './TopProgressBar';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { safeGetItem } from '@/lib/storage';

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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [orgLogo, setOrgLogo] = useState<string>('');
  const { selectedWorkspace } = useWorkspace();

  useEffect(() => {
    const savedCompany = safeGetItem<Company | null>('zervos_company', null);
    if (savedCompany) {
      setCompany(savedCompany);
    }

    // Load organization settings for logo
    const loadOrgSettings = () => {
      const settings = safeGetItem<any>('zervos_organization_settings', null);
      if (settings && typeof settings === 'object' && settings.logo) {
        setOrgLogo(settings.logo);
      }
    };

    loadOrgSettings();

    // Listen for organization settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      if (event.detail?.logo) {
        setOrgLogo(event.detail.logo);
      }
    };

    window.addEventListener('organization-settings-updated', handleSettingsUpdate as EventListener);

    return () => {
      window.removeEventListener('organization-settings-updated', handleSettingsUpdate as EventListener);
    };
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

  const activeNavItem = [...navigation, ...secondaryNavigation].find(item => isActive(item.path));

  const renderNavItems = (expanded: boolean) => (
    <LayoutGroup>
      {[...navigation, { divider: true }, ...secondaryNavigation].map((item) => {
        if ('divider' in item) {
          return <div key="divider" className="mx-4 my-4 h-px bg-slate-700" />;
        }

        const active = isActive(item.path);

        return (
          <Link key={item.path} href={item.path}>
            <a
              onMouseEnter={() => !expanded && setHoveredNav(item.path)}
              onMouseLeave={() => setHoveredNav(prev => (prev === item.path ? null : prev))}
              className={`relative flex items-center ${
                expanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3'
              } text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-xl overflow-visible`}
            >
              <motion.span
                className="relative z-10 flex items-center justify-center"
                initial={false}
                animate={{ scale: active ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <item.icon size={20} className={active ? 'text-white' : 'text-slate-300'} />
              </motion.span>

              {expanded && <span className={`relative z-10 font-medium ${active ? 'text-white' : 'text-slate-200'}`}>{item.name}</span>}

              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-slate-700 shadow-lg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <AnimatePresence>
        {hoveredNav === item.path && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-700 px-3 py-1 text-xs font-semibold text-white shadow-lg ring-1 ring-slate-600"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </a>
          </Link>
        );
      })}
    </LayoutGroup>
  );

  const SidebarShell = ({ expanded }: { expanded: boolean }) => (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 280 : 96 }}
      transition={{ type: 'spring', stiffness: 200, damping: 28 }}
      className="relative z-30 hidden h-full flex-col overflow-hidden border-r border-slate-700 bg-slate-800 text-white shadow-2xl lg:flex"
    >
      <div className="relative px-4 pb-4 pt-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              layout
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 shadow-lg"
            >
              {orgLogo ? (
                <img src={orgLogo} alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <Building2 size={20} className="text-white" />
              )}
            </motion.div>
            {expanded && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
                  <Sparkles size={14} className="text-brand-400" />
                  <span>Zervos</span>
                </div>
                {company ? (
                  <p className="text-xs text-slate-400">{company.name}</p>
                ) : (
                  <p className="text-xs text-slate-400">bharath</p>
                )}
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarExpanded(!expanded)}
            className="hidden rounded-lg bg-slate-700 p-2 text-slate-300 shadow-inner ring-1 ring-slate-600 transition hover:bg-slate-600 lg:inline-flex"
            aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
          >
            <Menu size={18} />
          </motion.button>
        </div>

        <WorkspaceSelector sidebarOpen={expanded} />

        <div className="mt-4 flex-1 space-y-1 overflow-y-auto pb-6">
          {renderNavItems(expanded)}
        </div>

      </div>
    </motion.aside>
  );

  const MobileSidebar = () => (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 220, damping: 30 }}
            className="relative z-10 flex h-full w-80 flex-col overflow-y-auto border-r border-slate-700 bg-slate-800 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500">
                  {orgLogo ? (
                    <img src={orgLogo} alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <Building2 size={20} className="text-white" />
                  )}
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Zervos</p>
                  {company && <p className="text-xs text-slate-400">{company.name}</p>}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-slate-700 p-2 text-slate-300 ring-1 ring-slate-600"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <Menu size={18} />
              </motion.button>
            </div>

            <WorkspaceSelector sidebarOpen={true} />

            <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-4 pb-6">
              {renderNavItems(true)}
            </div>

          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          className="absolute -right-32 top-[-20%] h-[36rem] w-[36rem] rounded-full bg-purple-200/40 blur-[140px]"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 16, ease: 'easeInOut', delay: 1 }}
          className="absolute left-[-20%] top-1/4 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-[120px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),transparent_65%)]" />
      </div>

      <TopProgressBar />

      <SidebarShell expanded={sidebarExpanded} />
      <MobileSidebar />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="relative z-20 border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </motion.button>
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  <Sparkles size={12} /> Experience
                </p>
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  {activeNavItem?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200 sm:inline-flex"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </motion.button>
              {selectedWorkspace ? (
                <motion.div
                  layout
                  className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm sm:flex"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selectedWorkspace.color} text-slate-900`}>
                    <span className="text-sm font-bold">{selectedWorkspace.initials}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{selectedWorkspace.name}</p>
                    <p className="text-xs text-slate-500">
                      {selectedWorkspace.status} • {selectedWorkspace.email || 'No email'}
                    </p>
                  </div>
                </motion.div>
              ) : company && (
                <motion.div
                  layout
                  className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm sm:flex"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    {orgLogo ? (
                      <img src={orgLogo} alt="Logo" className="h-9 w-9 rounded-xl object-cover" />
                    ) : (
                      <Building2 size={18} className="text-slate-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{company.name}</p>
                    <p className="text-xs text-slate-500">{company.industry}</p>
                  </div>
                </motion.div>
              )}
              <ProfileDropdown />
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <PageTransition pathname={location}>
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
