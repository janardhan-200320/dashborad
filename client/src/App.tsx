import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Onboarding from "@/pages/onboarding";
import Success from "@/pages/success";
import DashboardMain from "@/pages/dashboard-main";
import AppointmentsPage from "@/pages/appointments";
import CallbacksPage from "@/pages/callbacks";
import TimeslotsPage from "@/pages/timeslots";
import CalendarPage from "@/pages/calendar";
import SettingsPage from "@/pages/settings";
import FormInfoPage from "@/pages/form-info";
import ServicesPage from "@/pages/services";
import CustomersPage from "@/pages/customers";
import AdminCenterPage from "@/pages/admin-center";
import SalespersonsPage from "@/pages/salespersons";
import PublicBookingPage from "@/pages/public-booking";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/success" component={Success} />
      <Route path="/book/:serviceId" component={PublicBookingPage} />
      <Route path="/dashboard" component={DashboardMain} />
      <Route path="/dashboard/appointments" component={AppointmentsPage} />
      <Route path="/dashboard/callbacks" component={CallbacksPage} />
      <Route path="/dashboard/timeslots" component={TimeslotsPage} />
      <Route path="/dashboard/calendar" component={CalendarPage} />
      <Route path="/dashboard/settings" component={SettingsPage} />
      <Route path="/dashboard/form-info" component={FormInfoPage} />
      <Route path="/dashboard/services" component={ServicesPage} />
      <Route path="/dashboard/customers" component={CustomersPage} />
      <Route path="/dashboard/admin-center" component={AdminCenterPage} />
      <Route path="/dashboard/salespersons" component={SalespersonsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
