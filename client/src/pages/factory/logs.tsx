import { Sidebar } from "@/components/layout-sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Trash2, Search, User, Package, Cpu, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { authHeaders } from "@/hooks/use-auth";

const WORKSHOP_SECTIONS = [
  "الفيلتاج",
  "البلون بوالي",
  "العيد للبلون العادي",
  "بلقاسم",
  "Ecrou",
  "Tige Filetée",
  "السنسلة",
  "الشبكة",
];

const SECTION_STYLES: Record<string, { border: string; header: string; badge: string; quantityColor: string }> = {
  "الفيلتاج":            { border: "border-r-4 border-r-blue-500",   header: "bg-blue-50",   badge: "bg-blue-100 text-blue-800",   quantityColor: "text-blue-700" },
  "البلون بوالي":        { border: "border-r-4 border-r-purple-500", header: "bg-purple-50", badge: "bg-purple-100 text-purple-800", quantityColor: "text-purple-700" },
  "العيد للبلون العادي": { border: "border-r-4 border-r-orange-500", header: "bg-orange-50", badge: "bg-orange-100 text-orange-800", quantityColor: "text-orange-700" },
  "بلقاسم":              { border: "border-r-4 border-r-teal-500",   header: "bg-teal-50",   badge: "bg-teal-100 text-teal-800",   quantityColor: "text-teal-700" },
  "Ecrou":               { border: "border-r-4 border-r-emerald-500",header: "bg-emerald-50",badge: "bg-emerald-100 text-emerald-800",quantityColor: "text-emerald-700" },
  "Tige Filetée":        { border: "border-r-4 border-r-indigo-500", header: "bg-indigo-50", badge: "bg-indigo-100 text-indigo-800", quantityColor: "text-indigo-700" },
  "السنسلة":             { border: "border-r-4 border-r-amber-500",  header: "bg-amber-50",  badge: "bg-amber-100 text-amber-800",  quantityColor: "text-amber-700" },
  "الشبكة":              { border: "border-r-4 border-r-rose-500",   header: "bg-rose-50",   badge: "bg-rose-100 text-rose-800",   quantityColor: "text-rose-700" },
};

const DEFAULT_STYLE = { border: "border-r-4 border-r-slate-400", header: "bg-slate-50", badge: "bg-slate-100 text-slate-700", quantityColor: "text-slate-700" };

function getSectionStyle(section: string) {
  return SECTION_STYLES[section] || DEFAULT_STYLE;
}

function getUnit(section?: string) {
  return section === "Tige Filetée" ? "قطعة" : "كلغ";
}

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function FactoryLogs() {
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState(getTodayDate());
  const [workerFilter, setWorkerFilter] = useState("");
  const [workshopFilter, setWorkshopFilter] = useState("all");

  const queryParams = new URLSearchParams();
  if (dateFilter) queryParams.set('date', dateFilter);
  if (workerFilter.trim()) queryParams.set('workerName', workerFilter.trim());

  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: ['/api/production-logs', dateFilter, workerFilter],
    queryFn: async () => {
      const res = await fetch(`/api/production-logs?${queryParams.toString()}`, { headers: { ...authHeaders() } });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/production-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/production-logs'] });
      toast({ title: "تم الحذف" });
    },
  });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (workshopFilter === "all") return logs;
    return logs.filter((log: any) => log.machine?.section === workshopFilter);
  }, [logs, workshopFilter]);

  const totalQuantity = filteredLogs.reduce((s: number, l: any) => s + l.quantity, 0);
  const uniqueMachines = Object.keys(
    filteredLogs.reduce((acc: any, l: any) => { acc[l.machine?.code || ''] = true; return acc; }, {})
  ).length;

  const logsByMachine: Record<string, any[]> = {};
  for (const log of filteredLogs) {
    const code = log.machine?.code || 'غير معروف';
    if (!logsByMachine[code]) logsByMachine[code] = [];
    logsByMachine[code].push(log);
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-background" dir="rtl">
      <Sidebar role="factory_monitor" />
      <main className="md:mr-64 pt-20 md:pt-0">
        <div className="p-4 md:p-6 space-y-5">

          {/* Page Title */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">سجل الإنتاج</h1>
              <p className="text-xs text-slate-500">متابعة إنتاج الورشات والعمال</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">التاريخ</label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-40"
                    data-testid="input-filter-date"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">الورشة</label>
                  <Select value={workshopFilter} onValueChange={setWorkshopFilter}>
                    <SelectTrigger className="w-52" data-testid="select-filter-workshop">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الورشات</SelectItem>
                      {WORKSHOP_SECTIONS.map((section) => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">اسم العامل</label>
                  <div className="relative">
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={workerFilter}
                      onChange={(e) => setWorkerFilter(e.target.value)}
                      placeholder="بحث بالاسم..."
                      className="pr-9 w-48"
                      data-testid="input-filter-worker"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="mr-auto flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-[10px] text-green-600 font-medium">إجمالي الإنتاج</p>
                      <p className="text-xl font-bold text-green-700 leading-tight" data-testid="text-total">{totalQuantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                    <Cpu className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">عدد المكائن</p>
                      <p className="text-xl font-bold text-slate-700 leading-tight">{uniqueMachines}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">عدد السجلات</p>
                      <p className="text-xl font-bold text-slate-700 leading-tight" data-testid="text-count">{filteredLogs.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <Card className="border border-slate-200">
              <CardContent className="p-12 text-center">
                <FileText className="h-14 w-14 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">لا توجد تسجيلات لهذا التاريخ</p>
                <p className="text-xs text-slate-400 mt-1">جرب تغيير التاريخ أو الورشة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(logsByMachine).map(([machineCode, machineLogs]) => {
                const machineTotal = machineLogs.reduce((s: number, l: any) => s + l.quantity, 0);
                const section = machineLogs[0]?.machine?.section || '';
                const machineName = machineLogs[0]?.machine?.name || machineCode;
                const style = getSectionStyle(section);
                const unit = getUnit(section);

                return (
                  <Card
                    key={machineCode}
                    className={`overflow-hidden bg-white shadow-sm border border-slate-200 ${style.border}`}
                    data-testid={`card-machine-logs-${machineCode}`}
                  >
                    {/* Card Header */}
                    <CardHeader className={`${style.header} px-5 py-3.5 border-b border-slate-200`}>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-slate-800 font-mono">{machineName}</span>
                              <span className="text-slate-400 text-sm font-mono">({machineCode})</span>
                            </div>
                            {section && (
                              <span className={`inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
                                {section}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-slate-500 font-medium">إجمالي الإنتاج</p>
                          <p className={`text-2xl font-bold ${style.quantityColor}`}>
                            {machineTotal} <span className="text-sm font-medium">{unit}</span>
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Log Rows */}
                    <CardContent className="p-0">
                      {machineLogs.map((log: any, idx: number) => (
                        <div
                          key={log.id}
                          className={`flex items-center gap-4 px-5 py-3.5 ${idx !== machineLogs.length - 1 ? 'border-b border-slate-100' : ''}`}
                          data-testid={`log-row-${log.id}`}
                        >
                          {/* Worker Avatar */}
                          <div className="bg-slate-100 rounded-full p-2 shrink-0">
                            <User className="h-4 w-4 text-slate-500" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-tight">{log.workerName}</p>
                            {log.productDescription && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Package className="h-3 w-3 text-slate-400 shrink-0" />
                                <p className="text-xs text-slate-500 truncate">{log.productDescription}</p>
                              </div>
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="text-left shrink-0">
                            <p className={`text-xl font-bold ${style.quantityColor}`}>{log.quantity}</p>
                            <p className="text-[10px] text-slate-400 text-center">{unit}</p>
                          </div>

                          {/* Delete */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => deleteMutation.mutate(log.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-log-${log.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
