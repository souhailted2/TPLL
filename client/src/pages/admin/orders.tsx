import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatus.mutate({ id: orderId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'processing': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'مكتمل';
      case 'processing': return 'قيد التنفيذ';
      case 'cancelled': return 'ملغي';
      default: return 'جديد';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="admin" />
      <main className="flex-1 md:mr-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">سجل الطلبات</h1>
            <p className="text-slate-500">متابعة وتحديث حالات طلبات الفروع</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>نقطة البيع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>إجمالي المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">تحديث الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">#{order.id}</TableCell>
                      <TableCell className="font-bold">{order.salesPoint?.salesPointName}</TableCell>
                      <TableCell>
                        {order.createdAt && format(new Date(order.createdAt), 'PP p', { locale: arSA })}
                      </TableCell>
                      <TableCell>{Number(order.totalAmount).toLocaleString()} ر.س</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Select 
                            defaultValue={order.status} 
                            onValueChange={(val) => handleStatusChange(order.id, val)}
                            disabled={updateStatus.isPending}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submitted">جديد</SelectItem>
                              <SelectItem value="processing">قيد التنفيذ</SelectItem>
                              <SelectItem value="completed">مكتمل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
