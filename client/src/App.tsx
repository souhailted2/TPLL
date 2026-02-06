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
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import ReceptionOrders from "@/pages/reception/orders";
import ReceptionProducts from "@/pages/reception/products";
import ShippingOrders from "@/pages/shipping/orders";
import SalesNewOrder from "@/pages/sales/new-order";
import SalesOrders from "@/pages/sales/orders";
import SalesOrderHistory from "@/pages/sales/history";
import { useEffect } from "react";

function Router() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  if (authLoading || (user && (roleLoading || userRole === undefined))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/:rest*" component={() => <Redirect to="/" />} />
      </Switch>
    );
  }

  const role = userRole?.role || 'sales_point';

  const homeRoutes: Record<string, string> = {
    admin: '/admin',
    reception: '/reception/orders',
    shipping: '/shipping/orders',
    sales_point: '/sales/new-order',
  };

  return (
    <Switch>
      <Route path="/">
        <Redirect to={homeRoutes[role] || '/sales/new-order'} />
      </Route>

      {role === 'admin' && (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/orders" component={AdminOrders} />
        </>
      )}

      {role === 'reception' && (
        <>
          <Route path="/reception/orders" component={ReceptionOrders} />
          <Route path="/reception/products" component={ReceptionProducts} />
        </>
      )}

      {role === 'shipping' && (
        <>
          <Route path="/shipping/orders" component={ShippingOrders} />
        </>
      )}

      {role === 'sales_point' && (
        <>
          <Route path="/sales/new-order" component={SalesNewOrder} />
          <Route path="/sales/orders" component={SalesOrders} />
          <Route path="/sales/history" component={SalesOrderHistory} />
        </>
      )}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
