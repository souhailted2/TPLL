import { Sidebar } from "@/components/layout-sidebar";
import { StatCard } from "@/components/stat-card";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { Loader2, Package, ShoppingCart, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();

  if (ordersLoading || productsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'submitted' || o.status === 'processing').length || 0;
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
  const totalProducts = products?.length || 0;

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
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="admin" />
      
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
            <p className="text-slate-500">نظرة عامة على طلبات نقاط البيع</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="إجمالي الطلبات" 
              value={totalOrders}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard 
              title="طلبات قيد المعالجة" 
              value={pendingOrders}
              icon={Clock}
              color="orange"
            />
            <StatCard 
              title="الطلبات المكتملة" 
              value={completedOrders}
              icon={CheckCircle2}
              color="green"
            />
            <StatCard 
              title="عدد المنتجات" 
              value={totalProducts}
              icon={Package}
              color="purple"
            />
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 font-display">أحدث الطلبات</h3>
            <div className="space-y-4">
              {orders?.slice(0, 8).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                      #{order.id}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{order.salesPoint?.salesPointName || order.salesPoint?.firstName || 'غير معروف'}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt!).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{order.items?.length || 0} صنف</span>
                    <Badge variant="secondary" className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <p className="text-center text-slate-400 py-4">لا توجد طلبات حديثة</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
