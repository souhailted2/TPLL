import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-user-role";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";

// Pages
import LandingPage from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import SalesNewOrder from "@/pages/sales/new-order";
import SalesOrders from "@/pages/sales/orders";
import { useEffect } from "react";

function Router() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  // Handle global loading state (auth + role check)
  if (authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated -> Landing Page
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/:rest*" component={() => <Redirect to="/" />} />
      </Switch>
    );
  }

  // Role Routing
  const role = userRole?.role || 'sales_point'; // Default to sales_point if not set

  return (
    <Switch>
      {/* Root Redirect based on role */}
      <Route path="/">
        {role === 'admin' ? <Redirect to="/admin" /> : <Redirect to="/sales/new-order" />}
      </Route>

      {/* Admin Routes */}
      {role === 'admin' && (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/orders" component={AdminOrders} />
        </>
      )}

      {/* Sales Point Routes */}
      {role === 'sales_point' && (
        <>
          <Route path="/sales/new-order" component={SalesNewOrder} />
          <Route path="/sales/orders" component={SalesOrders} />
        </>
      )}

      {/* Catch-all for 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force RTL on mount
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

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
