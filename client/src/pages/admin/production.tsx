import { Sidebar } from "@/components/layout-sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, ArrowRight, Plus, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

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

type StatsPeriod = 'day' | 'week' | 'month' | 'year';

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getUnit(section?: string) {
  return section === "Tige Filetée" ? "قطعة" : "كلغ";
}

function getDateRange(period: StatsPeriod): { from: string; to: string } {
  const now = new Date();
  const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let from: Date;
  switch (period) {
    case 'day':
      from = new Date(now);
      break;
    case 'week':
      from = new Date(now);
      from.setDate(from.getDate() - 6);
      break;
    case 'month':
      from = new Date(now);
      from.setDate(from.getDate() - 29);
      break;
    case 'year':
      from = new Date(now);
      from.setFullYear(from.getFullYear() - 1);
      break;
  }
  const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
  return { from: fromStr, to };
}

export default function AdminProduction() {
  const { toast } = useToast();
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('day');
  const [addMachineOpen, setAddMachineOpen] = useState(false);
  const [newMachineCode, setNewMachineCode] = useState("");
  const [newMachineName, setNewMachineName] = useState("");
  const [addMachineWorkshop, setAddMachineWorkshop] = useState<string>("");
  const [logWorkerFilter, setLogWorkerFilter] = useState("");
  const [logWorkshopFilter, setLogWorkshopFilter] = useState("all");

  const { data: machinesData, isLoading: machinesLoading } = useQuery<any[]>({
    queryKey: ['/api/machines'],
  });

  const { data: todayLogs } = useQuery<any[]>({
    queryKey: ['/api/production-logs', { date: selectedDate }],
    queryFn: async () => {
      const res = await fetch(`/api/production-logs?date=${selectedDate}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const statsRange = useMemo(() => getDateRange(statsPeriod), [statsPeriod]);

  const { data: statsLogs } = useQuery<any[]>({
    queryKey: ['/api/production-logs', { from: statsRange.from, to: statsRange.to }],
    queryFn: async () => {
      const res = await fetch(`/api/production-logs?from=${statsRange.from}&to=${statsRange.to}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const addMachineMutation = useMutation({
    mutationFn: async (data: { code: string; name: string; section: string }) => {
      await apiRequest('POST', '/api/machines', { ...data, posX: null, posY: null, width: null, height: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/machines'] });
      toast({ title: "✅ تم إضافة الماكينة بنجاح" });
      setNewMachineCode("");
      setNewMachineName("");
      setAddMachineOpen(false);
    },
    onError: () => {
      toast({ title: "❌ فشل إضافة الماكينة", variant: "destructive" });
    },
  });

  const workshopMachineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (machinesData) {
      for (const m of machinesData) {
        const section = m.section || '';
        counts[section] = (counts[section] || 0) + 1;
      }
    }
    return counts;
  }, [machinesData]);

  const workshopLogCounts = useMemo(() => {
    const counts: Record<string, { logs: number; qty: number; activeMachines: Set<string> }> = {};
    if (todayLogs) {
      for (const log of todayLogs) {
        const section = log.machine?.section || '';
        if (!counts[section]) counts[section] = { logs: 0, qty: 0, activeMachines: new Set() };
        counts[section].logs++;
        counts[section].qty += log.quantity;
        counts[section].activeMachines.add(log.machine?.code || '');
      }
    }
    return counts;
  }, [todayLogs]);

  const workshopMachines = useMemo(() => {
    if (!machinesData || !selectedWorkshop) return [];
    const filtered = machinesData.filter((m: any) => m.section === selectedWorkshop);
    filtered.sort((a: any, b: any) => {
      const numA = parseInt((a.name || '').match(/\d+/)?.[0] || '999', 10);
      const numB = parseInt((b.name || '').match(/\d+/)?.[0] || '999', 10);
      if (numA !== numB) return numA - numB;
      const subA = parseInt((a.name || '').match(/\d+-(\d+)/)?.[1] || '0', 10);
      const subB = parseInt((b.name || '').match(/\d+-(\d+)/)?.[1] || '0', 10);
      return subA - subB;
    });
    return filtered;
  }, [machinesData, selectedWorkshop]);

  const todayLogsByMachine = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (todayLogs) {
      for (const log of todayLogs) {
        const code = log.machine?.code || '';
        if (!map[code]) map[code] = [];
        map[code].push(log);
      }
    }
    return map;
  }, [todayLogs]);

  const statsData = useMemo(() => {
    if (!statsLogs) return { totalQty: 0, totalLogs: 0, activeMachines: 0, workshopBreakdown: [] as any[] };
    const totalQty = statsLogs.reduce((s, l) => s + l.quantity, 0);
    const totalLogs = statsLogs.length;
    const machineSet = new Set(statsLogs.map(l => l.machine?.code).filter(Boolean));
    const activeMachines = machineSet.size;

    const byWorkshop: Record<string, { qty: number; logs: number; machines: Set<string> }> = {};
    for (const log of statsLogs) {
      const section = log.machine?.section || '';
      if (!byWorkshop[section]) byWorkshop[section] = { qty: 0, logs: 0, machines: new Set() };
      byWorkshop[section].qty += log.quantity;
      byWorkshop[section].logs++;
      byWorkshop[section].machines.add(log.machine?.code || '');
    }

    const workshopBreakdown = WORKSHOPS.map(w => ({
      ...w,
      qty: byWorkshop[w.id]?.qty || 0,
      logs: byWorkshop[w.id]?.logs || 0,
      machines: byWorkshop[w.id]?.machines?.size || 0,
    })).sort((a, b) => b.qty - a.qty);

    return { totalQty, totalLogs, activeMachines, workshopBreakdown };
  }, [statsLogs]);

  const filteredLogsForDisplay = useMemo(() => {
    if (!todayLogs) return [];
    let filtered = todayLogs;
    if (logWorkshopFilter !== 'all') {
      filtered = filtered.filter((l: any) => l.machine?.section === logWorkshopFilter);
    }
    if (logWorkerFilter.trim()) {
      const term = logWorkerFilter.trim().toLowerCase();
      filtered = filtered.filter((l: any) => (l.workerName || '').toLowerCase().includes(term));
    }
    return filtered;
  }, [todayLogs, logWorkshopFilter, logWorkerFilter]);

  const logsByMachine: Record<string, any[]> = {};
  for (const log of filteredLogsForDisplay) {
    const code = log.machine?.code || 'غير معروف';
    if (!logsByMachine[code]) logsByMachine[code] = [];
    logsByMachine[code].push(log);
  }

  const totalFilteredQty = filteredLogsForDisplay.reduce((s: number, l: any) => s + l.quantity, 0);

  if (machinesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentWorkshop = WORKSHOPS.find(w => w.id === selectedWorkshop);
  const periodLabels: Record<StatsPeriod, string> = { day: 'اليوم', week: 'الأسبوع', month: 'الشهر', year: 'السنة' };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Sidebar role="admin" />
      <main className="md:mr-64 pt-20 md:pt-0">
        <div className="p-4 md:p-6 space-y-6">
          {!selectedWorkshop ? (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏭</span>
                    <h1 className="text-xl font-bold" data-testid="text-production-title">مراقبة الإنتاج</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">إدارة ومتابعة إنتاج الورشات</p>
                </div>
                <Dialog open={addMachineOpen} onOpenChange={(open) => {
                  setAddMachineOpen(open);
                  if (!open) { setNewMachineCode(""); setNewMachineName(""); setAddMachineWorkshop(""); }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" data-testid="button-admin-add-machine">
                      <Plus className="h-4 w-4" />
                      إضافة ماكينة
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl" className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>➕ إضافة ماكينة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">🏭 الورشة *</label>
                        <Select value={addMachineWorkshop} onValueChange={setAddMachineWorkshop}>
                          <SelectTrigger data-testid="select-admin-machine-workshop" className="bg-background">
                            <SelectValue placeholder="اختر الورشة" />
                          </SelectTrigger>
                          <SelectContent>
                            {WORKSHOPS.map(w => (
                              <SelectItem key={w.id} value={w.id}>{w.emoji} {w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">🆔 رمز الماكينة *</label>
                        <Input
                          value={newMachineCode}
                          onChange={(e) => setNewMachineCode(e.target.value)}
                          placeholder="مثال: FIL-M20"
                          className="bg-background"
                          data-testid="input-admin-machine-code"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">🏷️ اسم العرض *</label>
                        <Input
                          value={newMachineName}
                          onChange={(e) => setNewMachineName(e.target.value)}
                          placeholder="مثال: M20"
                          className="bg-background"
                          data-testid="input-admin-machine-name"
                        />
                      </div>
                      <Button
                        className="w-full gap-2"
                        disabled={!newMachineCode.trim() || !newMachineName.trim() || !addMachineWorkshop || addMachineMutation.isPending}
                        onClick={() => {
                          addMachineMutation.mutate({
                            code: newMachineCode.trim(),
                            name: newMachineName.trim(),
                            section: addMachineWorkshop,
                          });
                        }}
                        data-testid="button-admin-confirm-add-machine"
                      >
                        {addMachineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        إضافة
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card data-testid="card-stats-period">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="font-bold text-sm">📊 إحصائيات الإنتاج</h2>
                    <div className="flex gap-1">
                      {(['day', 'week', 'month', 'year'] as StatsPeriod[]).map(p => (
                        <Button
                          key={p}
                          size="sm"
                          variant={statsPeriod === p ? 'default' : 'outline'}
                          onClick={() => setStatsPeriod(p)}
                          className="text-xs"
                          data-testid={`button-stats-${p}`}
                        >
                          {periodLabels[p]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-xs text-muted-foreground">⚖️ إجمالي الإنتاج</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="text-stats-total-qty">{statsData.totalQty}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-xs text-muted-foreground">📋 عدد التسجيلات</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400" data-testid="text-stats-total-logs">{statsData.totalLogs}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-xs text-muted-foreground">✅ ماكينات نشطة</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400" data-testid="text-stats-active-machines">{statsData.activeMachines}</p>
                    </div>
                  </div>

                  {statsData.workshopBreakdown.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-muted-foreground">🏭 إنتاج الورشات ({periodLabels[statsPeriod]})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {statsData.workshopBreakdown.map(w => (
                          <div key={w.id} className="bg-muted rounded-lg p-2 text-center">
                            <span className="text-sm">{w.emoji}</span>
                            <p className="text-[10px] font-bold truncate">{w.name}</p>
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">{w.qty} {getUnit(w.id)}</p>
                            <p className="text-[10px] text-muted-foreground">{w.logs} سجل | {w.machines} ماكينة</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">📅 عرض ورشات يوم:</span>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44 text-sm"
                  data-testid="input-production-date"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {WORKSHOPS.map((workshop) => {
                  const machineCount = workshopMachineCounts[workshop.id] || 0;
                  const logInfo = workshopLogCounts[workshop.id];

                  return (
                    <Card
                      key={workshop.id}
                      className="cursor-pointer hover-elevate transition-all overflow-visible"
                      onClick={() => setSelectedWorkshop(workshop.id)}
                      data-testid={`card-admin-workshop-${workshop.id}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${workshop.color} flex items-center justify-center shadow-sm`}>
                          <span className="text-xl">{workshop.emoji}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{workshop.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">🔧 {machineCount} ماكينة</p>
                        </div>
                        {logInfo ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-[10px]">
                              ⚖️ {logInfo.qty} {getUnit(workshop.id)}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              ✅ {logInfo.activeMachines.size} نشطة
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">💤 لا يوجد إنتاج</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card data-testid="card-production-logs">
                <CardContent className="p-4 space-y-4">
                  <h2 className="font-bold text-sm">📋 سجل الإنتاج</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">الورشة</label>
                      <Select value={logWorkshopFilter} onValueChange={setLogWorkshopFilter}>
                        <SelectTrigger className="w-48" data-testid="select-admin-log-workshop">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الورشات</SelectItem>
                          {WORKSHOPS.map(w => (
                            <SelectItem key={w.id} value={w.id}>{w.emoji} {w.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">اسم العامل</label>
                      <div className="relative">
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={logWorkerFilter}
                          onChange={(e) => setLogWorkerFilter(e.target.value)}
                          placeholder="بحث بالاسم..."
                          className="pr-8 w-48"
                          data-testid="input-admin-log-worker"
                        />
                      </div>
                    </div>
                    <div className="mr-auto flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">إجمالي الإنتاج</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="text-logs-total">{totalFilteredQty}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">عدد التسجيلات</p>
                        <p className="text-2xl font-bold" data-testid="text-logs-count">{filteredLogsForDisplay.length}</p>
                      </div>
                    </div>
                  </div>

                  {filteredLogsForDisplay.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>لا توجد تسجيلات لهذا التاريخ</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(logsByMachine).map(([machineCode, machineLogs]) => {
                        const machineTotal = machineLogs.reduce((s: number, l: any) => s + l.quantity, 0);
                        const section = machineLogs[0]?.machine?.section || '';

                        return (
                          <div key={machineCode} className="border rounded-lg p-3 space-y-2" data-testid={`admin-log-machine-${machineCode}`}>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono font-bold">{machineCode}</Badge>
                                {section && <span className="text-xs text-muted-foreground">{section}</span>}
                              </div>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{machineTotal} {getUnit(section)}</Badge>
                            </div>
                            <div className="space-y-1">
                              {machineLogs.map((log: any) => (
                                <div key={log.id} className="flex items-center justify-between gap-2 bg-muted rounded-lg p-2 text-xs" data-testid={`admin-log-row-${log.id}`}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-bold">👷 {log.workerName}</span>
                                      <Badge variant="outline" className="text-[10px]">⚖️ {log.quantity} {getUnit(section)}</Badge>
                                    </div>
                                    {log.productDescription && (
                                      <p className="text-muted-foreground mt-1">📝 {log.productDescription}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedWorkshop(null)}
                    data-testid="button-back-admin-workshops"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <span className="text-xl">{currentWorkshop?.emoji}</span>
                  <h1 className="text-xl font-bold">
                    {currentWorkshop?.name || selectedWorkshop}
                  </h1>
                </div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40 text-sm"
                  data-testid="input-workshop-date"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {workshopMachines.map((machine: any) => {
                      const hasLog = todayLogsByMachine[machine.code]?.length > 0;
                      const totalQty = todayLogsByMachine[machine.code]?.reduce((s: number, l: any) => s + l.quantity, 0) || 0;
                      const displayName = machine.name || machine.code;

                      return (
                        <Card
                          key={machine.code}
                          className={`overflow-visible ${hasLog ? 'border-green-500' : ''}`}
                          data-testid={`card-admin-machine-${machine.code}`}
                        >
                          <CardContent className="p-3 text-center space-y-1">
                            <span className="text-base block">{hasLog ? "✅" : "⚙️"}</span>
                            <p className="font-bold text-sm">{displayName}</p>
                            {hasLog && (
                              <Badge variant="secondary" className="text-[10px]">
                                ⚖️ {totalQty} {getUnit(selectedWorkshop || '')}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {workshopMachines.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <span className="text-4xl block mb-3">🔧</span>
                        <p className="text-muted-foreground">لا توجد ماكينات في هذه الورشة</p>
                      </CardContent>
                    </Card>
                  )}

                  {todayLogs && todayLogs.filter(l => l.machine?.section === selectedWorkshop).length > 0 && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-bold text-sm">📋 سجلات الإنتاج</h3>
                        <div className="space-y-2">
                          {todayLogs
                            .filter(l => l.machine?.section === selectedWorkshop)
                            .map((log: any) => (
                              <div key={log.id} className="bg-muted rounded-lg p-3 text-xs space-y-1" data-testid={`admin-log-entry-${log.id}`}>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">⚙️ {log.machine?.name || log.machine?.code}</span>
                                    <span className="text-muted-foreground">|</span>
                                    <span>👷 {log.workerName}</span>
                                  </div>
                                  <Badge variant="secondary" className="text-[10px]">⚖️ {log.quantity} {getUnit(selectedWorkshop || '')}</Badge>
                                </div>
                                {log.productDescription && (
                                  <p className="text-muted-foreground">📝 {log.productDescription}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-3">📊 ملخص الورشة</h3>
                      <div className="space-y-3 text-xs">
                        {(() => {
                          const logInfo = workshopLogCounts[selectedWorkshop];
                          const machineCount = workshopMachineCounts[selectedWorkshop] || 0;
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">🔧 عدد الماكينات</span>
                                <span className="font-bold">{machineCount}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">✅ ماكينات نشطة</span>
                                <span className="font-bold">{logInfo?.activeMachines.size || 0}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">📋 عدد السجلات</span>
                                <span className="font-bold">{logInfo?.logs || 0}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">⚖️ إجمالي الإنتاج</span>
                                <span className="font-bold text-green-600">{logInfo?.qty || 0} {getUnit(selectedWorkshop || '')}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
