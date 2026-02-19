import { Sidebar } from "@/components/layout-sidebar";
import { StatCard } from "@/components/stat-card";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, ShoppingCart, CheckCircle2, Clock, Wrench, Activity, Factory, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";

const WORKSHOPS = [
  { id: "الفيلتاج", name: "ورشة الفيلتاج", emoji: "⚙️", color: "from-blue-500 to-blue-600" },
  { id: "البلون بوالي", name: "ورشة البلون بوالي", emoji: "🔩", color: "from-green-500 to-green-600" },
  { id: "العيد للبلون العادي", name: "ورشة العيد للبلون العادي", emoji: "🔧", color: "from-orange-500 to-orange-600" },
  { id: "بلقاسم", name: "ورشة بلقاسم", emoji: "🔣", color: "from-purple-500 to-purple-600" },
  { id: "Ecrou", name: "ورشة Ecrou", emoji: "⛓️", color: "from-red-500 to-red-600" },
  { id: "Tige Filetée", name: "ورشة Tige Filetée", emoji: "📏", color: "from-indigo-500 to-indigo-600" },
  { id: "السنسلة", name: "ورشة السنسلة", emoji: "🔗", color: "from-teal-500 to-teal-600" },
  { id: "الشبكة", name: "ورشة الشبكة", emoji: "🛖", color: "from-amber-500 to-amber-600" },
];

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getUnit(section?: string) {
  return section === "Tige Filetée" ? "قطعة" : "كلغ";
}

export default function AdminDashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();

  const { data: machinesData } = useQuery<any[]>({
    queryKey: ['/api/machines'],
  });

  const todayDate = getTodayDate();
  const { data: todayLogs } = useQuery<any[]>({
    queryKey: [`/api/production-logs?date=${todayDate}`],
  });

  const workshopLogCounts = useMemo(() => {
    const counts: Record<string, { qty: number; activeMachines: Set<string> }> = {};
    if (todayLogs) {
      for (const log of todayLogs) {
        const section = log.machine?.section || '';
        if (!counts[section]) counts[section] = { qty: 0, activeMachines: new Set() };
        counts[section].qty += log.quantity;
        counts[section].activeMachines.add(log.machine?.code || '');
      }
    }
    return counts;
  }, [todayLogs]);

  const totalProductionQty = useMemo(() => {
    if (!todayLogs) return 0;
    return todayLogs.reduce((sum, log) => sum + log.quantity, 0);
  }, [todayLogs]);

  const activeMachinesToday = useMemo(() => {
    if (!todayLogs) return 0;
    const unique = new Set(todayLogs.map(l => l.machine?.code).filter(Boolean));
    return unique.size;
  }, [todayLogs]);

  if (ordersLoading || productsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o: any) => o.status === 'submitted' || o.status === 'processing').length || 0;
  const completedOrders = orders?.filter((o: any) => o.status === 'completed').length || 0;
  const totalProducts = products?.total || products?.products?.length || 0;
  const totalMachines = machinesData?.length || 0;
  const hasMachines = totalMachines > 0;

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'تم الاستلام';
      case 'processing': return 'قيد الانجاز';
      case 'shipped': return 'تم الشحن';
      case 'cancelled': return 'ملغي';
      default: return 'في الانتظار';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <Sidebar role="admin" />
      
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">📊 لوحة التحكم</h1>
            <p className="text-muted-foreground">نظرة عامة على طلبات نقاط البيع</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="📦 إجمالي الطلبات" 
              value={totalOrders}
              icon={ShoppingCart}
              color="blue"
              href="/admin/orders"
            />
            <StatCard 
              title="⏳ طلبات قيد المعالجة" 
              value={pendingOrders}
              icon={Clock}
              color="orange"
              href="/admin/orders?filter=pending"
            />
            <StatCard 
              title="✅ الطلبات المكتملة" 
              value={completedOrders}
              icon={CheckCircle2}
              color="green"
              href="/admin/orders?filter=completed"
            />
            <StatCard 
              title="📋 عدد المنتجات" 
              value={totalProducts}
              icon={Package}
              color="purple"
              href="/admin/products"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold" data-testid="text-production-section">🏭 إنتاج اليوم</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="🔧 إجمالي الماكينات"
                value={totalMachines}
                icon={Wrench}
                color="blue"
                href="/admin/production"
              />
              <StatCard
                title="✅ ماكينات نشطة اليوم"
                value={activeMachinesToday}
                icon={Activity}
                color="green"
                href="/admin/production"
              />
              <StatCard
                title="⚖️ إجمالي الإنتاج"
                value={totalProductionQty}
                icon={Factory}
                color="orange"
                href="/admin/production"
              />
              <StatCard
                title="🏭 عدد الورشات"
                value={8}
                icon={LayoutGrid}
                color="purple"
                href="/admin/production"
              />
            </div>
          </div>

          {hasMachines && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold" data-testid="text-workshop-summary">🏭 إنتاج الورشات اليوم</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WORKSHOPS.map((workshop) => {
                  const logInfo = workshopLogCounts[workshop.id];
                  return (
                    <Card key={workshop.id} className="overflow-visible" data-testid={`card-dashboard-workshop-${workshop.id}`}>
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{workshop.emoji}</span>
                          <span className="text-xs font-bold truncate">{workshop.name}</span>
                        </div>
                        <p className="text-sm font-bold text-muted-foreground">
                          ⚖️ {logInfo?.qty || 0} {getUnit(workshop.id)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <Card className="overflow-visible" data-testid="card-recent-orders">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 font-display">📋 أحدث الطلبات</h3>
              <div className="space-y-4">
                {orders?.slice(0, 8).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between gap-2 p-3 rounded-lg hover-elevate transition-colors border border-transparent" data-testid={`dashboard-order-${order.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                        #{order.id}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{order.salesPoint?.salesPointName || order.salesPoint?.firstName || 'غير معروف'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt!).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{order.items?.length || 0} صنف</span>
                      <Badge variant="secondary" className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!orders || orders.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">لا توجد طلبات حديثة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}