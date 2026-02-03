import { Sidebar } from "@/components/layout-sidebar";
import { StatCard } from "@/components/stat-card";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { Loader2, Package, ShoppingCart, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const totalRevenue = orders?.reduce((acc, order) => acc + Number(order.totalAmount), 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'submitted' || o.status === 'processing').length || 0;
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;

  // Chart Data Mockup (Real app would aggregate dates)
  const chartData = [
    { name: 'السبت', sales: 4000 },
    { name: 'الأحد', sales: 3000 },
    { name: 'الاثنين', sales: 2000 },
    { name: 'الثلاثاء', sales: 2780 },
    { name: 'الأربعاء', sales: 1890 },
    { name: 'الخميس', sales: 2390 },
    { name: 'الجمعة', sales: 3490 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="admin" />
      
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
            <p className="text-slate-500">نظرة عامة على أداء المصنع والمبيعات</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="إجمالي الإيرادات" 
              value={`${totalRevenue.toLocaleString()} ر.س`}
              icon={TrendingUp}
              color="green"
              trend="+12.5%"
              trendUp={true}
            />
            <StatCard 
              title="طلبات قيد المعالجة" 
              value={pendingOrders}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard 
              title="الطلبات المكتملة" 
              value={completedOrders}
              icon={CheckCircle2}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 font-display">تحليل المبيعات الأسبوعي</h3>
              <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-4 font-display">أحدث الطلبات</h3>
              <div className="space-y-4">
                {orders?.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                        #{order.id}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{order.salesPoint?.salesPointName || 'غير معروف'}</p>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt!).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status === 'completed' ? 'مكتمل' : 
                       order.status === 'processing' ? 'قيد التنفيذ' : 'جديد'}
                    </div>
                  </div>
                ))}
                {(!orders || orders.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد طلبات حديثة</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
