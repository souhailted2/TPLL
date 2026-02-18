import { Sidebar } from "@/components/layout-sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Factory, ArrowRight, Wrench, Settings, CircleDot, Hexagon, Circle, Ruler, Link, Grid3X3 } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";

const WORKSHOPS: { id: string; name: string; icon: LucideIcon; color: string }[] = [
  { id: "الفيلتاج", name: "ورشة الفيلتاج", icon: Wrench, color: "bg-blue-500" },
  { id: "البلون بوالي", name: "ورشة البلون بوالي", icon: Settings, color: "bg-green-500" },
  { id: "العيد للبلون العادي", name: "ورشة العيد للبلون العادي", icon: CircleDot, color: "bg-orange-500" },
  { id: "بلقاسم", name: "ورشة بلقاسم", icon: Hexagon, color: "bg-purple-500" },
  { id: "Ecrou", name: "ورشة Ecrou", icon: Circle, color: "bg-red-500" },
  { id: "Tige Filetée", name: "ورشة Tige Filetée", icon: Ruler, color: "bg-indigo-500" },
  { id: "السنسلة", name: "ورشة السنسلة", icon: Link, color: "bg-teal-500" },
  { id: "الشبكة", name: "ورشة الشبكة", icon: Grid3X3, color: "bg-amber-500" },
];

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function FactoryMap() {
  const { toast } = useToast();
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [workerName, setWorkerName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [logDate, setLogDate] = useState(getTodayDate());

  const { data: machinesData, isLoading: machinesLoading } = useQuery<any[]>({
    queryKey: ['/api/machines'],
  });

  const { data: todayLogs } = useQuery<any[]>({
    queryKey: ['/api/production-logs', { date: logDate }],
    queryFn: async () => {
      const res = await fetch(`/api/production-logs?date=${logDate}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const seedMachinesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/machines/seed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/machines'] });
      toast({ title: "تم إضافة جميع الماكينات" });
    },
  });

  const addLogMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/production-logs', data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/production-logs'] });
      toast({ title: "تم تسجيل الإنتاج بنجاح" });
      setQuantity("");
      setProductDesc("");
    },
  });

  const machineDbMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (machinesData) {
      for (const m of machinesData) {
        map[m.code] = m;
      }
    }
    return map;
  }, [machinesData]);

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

  const handleMachineClick = (code: string) => {
    setSelectedMachine(code === selectedMachine ? null : code);
  };

  const handleSubmitLog = async () => {
    if (!selectedMachine || !workerName.trim() || !quantity.trim()) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const dbMachine = machineDbMap[selectedMachine];
    if (!dbMachine) {
      toast({ title: "الماكينة غير موجودة في قاعدة البيانات", variant: "destructive" });
      return;
    }
    await addLogMutation.mutateAsync({
      machineId: dbMachine.id,
      workerName: workerName.trim(),
      quantity: Number(quantity),
      productDescription: productDesc.trim() || null,
      logDate,
    });
  };

  if (machinesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const hasMachines = machinesData && machinesData.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background" dir="rtl">
      <Sidebar role="factory_monitor" />
      <main className="md:mr-64 pt-20 md:pt-0">
        <div className="p-4 md:p-6 space-y-4">
          {!selectedWorkshop ? (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <Factory className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-bold">ورشات المصنع</h1>
                </div>
                {!hasMachines && (
                  <Button
                    onClick={() => seedMachinesMutation.mutate()}
                    disabled={seedMachinesMutation.isPending}
                    data-testid="button-seed-machines"
                  >
                    {seedMachinesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تهيئة الماكينات"}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {WORKSHOPS.map((workshop) => {
                  const Icon = workshop.icon;
                  const machineCount = workshopMachineCounts[workshop.id] || 0;
                  const logInfo = workshopLogCounts[workshop.id];

                  return (
                    <Card
                      key={workshop.id}
                      className="cursor-pointer hover-elevate transition-all"
                      onClick={() => {
                        setSelectedWorkshop(workshop.id);
                        setSelectedMachine(null);
                      }}
                      data-testid={`card-workshop-${workshop.id}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className={`w-10 h-10 rounded-lg ${workshop.color} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{workshop.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{machineCount} ماكينة</p>
                        </div>
                        {logInfo && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {logInfo.qty} قطعة
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {logInfo.activeMachines.size} نشطة
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedWorkshop(null);
                      setSelectedMachine(null);
                    }}
                    data-testid="button-back-workshops"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <h1 className="text-xl font-bold">
                    {WORKSHOPS.find(w => w.id === selectedWorkshop)?.name || selectedWorkshop}
                  </h1>
                </div>
                <Input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-40 text-sm"
                  data-testid="input-log-date"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {workshopMachines.map((machine: any) => {
                      const hasLog = todayLogsByMachine[machine.code]?.length > 0;
                      const isSelected = selectedMachine === machine.code;
                      const totalQty = todayLogsByMachine[machine.code]?.reduce((s: number, l: any) => s + l.quantity, 0) || 0;
                      const displayName = machine.name || machine.code;

                      return (
                        <Button
                          key={machine.code}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto py-3 flex flex-col items-center gap-1 ${
                            hasLog && !isSelected ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' : ''
                          }`}
                          onClick={() => handleMachineClick(machine.code)}
                          data-testid={`button-machine-${machine.code}`}
                        >
                          <span className="font-bold text-sm">{displayName}</span>
                          {hasLog && (
                            <span className="text-[10px] opacity-80">{totalQty} قطعة</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {workshopMachines.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">لا توجد ماكينات في هذه الورشة</p>
                        {!hasMachines && (
                          <Button
                            className="mt-4"
                            onClick={() => seedMachinesMutation.mutate()}
                            disabled={seedMachinesMutation.isPending}
                            data-testid="button-seed-machines-workshop"
                          >
                            {seedMachinesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تهيئة الماكينات"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedMachine ? (
                    <Card data-testid="card-machine-input">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-bold text-lg">
                            ماكينة {machineDbMap[selectedMachine]?.name || selectedMachine}
                          </h2>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">اسم العامل *</label>
                            <Input
                              value={workerName}
                              onChange={(e) => setWorkerName(e.target.value)}
                              placeholder="اسم العامل"
                              data-testid="input-worker-name"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">الكمية المنجزة *</label>
                            <Input
                              type="number"
                              min={0}
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="الكمية"
                              data-testid="input-quantity"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">وصف المنتج</label>
                            <Input
                              value={productDesc}
                              onChange={(e) => setProductDesc(e.target.value)}
                              placeholder="مثال: برغي M8"
                              data-testid="input-product-desc"
                            />
                          </div>

                          <Button
                            className="w-full gap-2"
                            onClick={handleSubmitLog}
                            disabled={addLogMutation.isPending}
                            data-testid="button-save-log"
                          >
                            {addLogMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            تسجيل الإنتاج
                          </Button>
                        </div>

                        {todayLogsByMachine[selectedMachine]?.length > 0 && (
                          <div className="border-t pt-3 space-y-2">
                            <p className="text-xs font-bold text-muted-foreground">سجل اليوم لهذه الماكينة:</p>
                            {todayLogsByMachine[selectedMachine].map((log: any) => (
                              <div key={log.id} className="bg-muted rounded-lg p-2 text-xs space-y-1" data-testid={`log-entry-${log.id}`}>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-bold">{log.workerName}</span>
                                  <Badge variant="secondary" className="text-[10px]">{log.quantity} قطعة</Badge>
                                </div>
                                {log.productDescription && (
                                  <p className="text-muted-foreground">{log.productDescription}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center space-y-3">
                        <Factory className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">اضغط على أي ماكينة لتسجيل الإنتاج</p>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-50 dark:bg-green-950" />
                            <span>تم التسجيل اليوم</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded border-2 border-muted-foreground" />
                            <span>لم يتم التسجيل</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-3">ملخص الورشة</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">إجمالي القطع المنجزة</span>
                          <span className="font-bold text-lg text-green-700 dark:text-green-400" data-testid="text-total-quantity">
                            {workshopLogCounts[selectedWorkshop]?.qty || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">عدد التسجيلات</span>
                          <span className="font-bold" data-testid="text-total-logs">
                            {workshopLogCounts[selectedWorkshop]?.logs || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">ماكينات نشطة</span>
                          <span className="font-bold" data-testid="text-active-machines">
                            {workshopLogCounts[selectedWorkshop]?.activeMachines.size || 0}
                          </span>
                        </div>
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
