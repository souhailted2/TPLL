import { Sidebar } from "@/components/layout-sidebar";
import { useOrders } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export default function SalesOrders() {
  const { data: orders, isLoading } = useOrders();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'مكتمل';
      case 'processing': return 'قيد التنفيذ';
      case 'cancelled': return 'ملغي';
      default: return 'قيد المراجعة';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="sales_point" />
      <main className="flex-1 md:mr-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">طلباتي</h1>
            <p className="text-slate-500">سجل الطلبات المرسلة إلى المصنع وحالاتها</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>عدد الأصناف</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono font-bold">#{order.id}</TableCell>
                      <TableCell>
                        {order.createdAt && format(new Date(order.createdAt), 'PPP p', { locale: arSA })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <span>{order.items?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{Number(order.totalAmount).toLocaleString()} ر.س</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                        لم تقم بإرسال أي طلبات بعد
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
