import { Sidebar } from "@/components/layout-sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Trash2, Search } from "lucide-react";
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

  const logsByMachine: Record<string, any[]> = {};
  for (const log of filteredLogs) {
    const code = log.machine?.code || 'غير معروف';
    if (!logsByMachine[code]) logsByMachine[code] = [];
    logsByMachine[code].push(log);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background" dir="rtl">
      <Sidebar role="factory_monitor" />
      <main className="md:mr-64 pt-20 md:pt-0">
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">سجل الإنتاج</h1>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">التاريخ</label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-40"
                    data-testid="input-filter-date"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">الورشة</label>
                  <Select value={workshopFilter} onValueChange={setWorkshopFilter}>
                    <SelectTrigger className="w-48" data-testid="select-filter-workshop">
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
                  <label className="text-xs text-muted-foreground block mb-1">اسم العامل</label>
                  <div className="relative">
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={workerFilter}
                      onChange={(e) => setWorkerFilter(e.target.value)}
                      placeholder="بحث بالاسم..."
                      className="pr-8 w-48"
                      data-testid="input-filter-worker"
                    />
                  </div>
                </div>
                <div className="mr-auto flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">إجمالي الإنتاج</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="text-total">{totalQuantity}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">عدد التسجيلات</p>
                    <p className="text-2xl font-bold" data-testid="text-count">{filteredLogs.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">لا توجد تسجيلات لهذا التاريخ</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(logsByMachine).map(([machineCode, machineLogs]) => {
                const machineTotal = machineLogs.reduce((s: number, l: any) => s + l.quantity, 0);
                const section = machineLogs[0]?.machine?.section || '';

                return (
                  <Card key={machineCode} data-testid={`card-machine-logs-${machineCode}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono font-bold">{machineCode}</Badge>
                          {section && <span className="text-xs text-muted-foreground">{section}</span>}
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{machineTotal} {getUnit(section)}</Badge>
                      </div>

                      <div className="space-y-2">
                        {machineLogs.map((log: any) => (
                          <div key={log.id} className="flex items-center justify-between gap-2 bg-muted rounded-lg p-3" data-testid={`log-row-${log.id}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm">{log.workerName}</span>
                                <Badge variant="outline" className="text-[10px]">{log.quantity} {getUnit(section)}</Badge>
                              </div>
                              {log.productDescription && (
                                <p className="text-xs text-muted-foreground mt-1">{log.productDescription}</p>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="outline"
                              className="border-red-200 text-red-500 shrink-0"
                              onClick={() => deleteMutation.mutate(log.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-log-${log.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
