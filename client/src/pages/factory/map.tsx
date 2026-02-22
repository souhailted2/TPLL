import { Sidebar } from "@/components/layout-sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Factory, ArrowRight, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { authHeaders } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WORKSHOPS = [
  { id: "الفيلتاج", name: "ورشة الفيلتاج", emoji: "\u2699\uFE0F", color: "from-blue-500 to-blue-600" },
  { id: "البلون بوالي", name: "ورشة البلون بوالي", emoji: "\uD83D\uDD29", color: "from-green-500 to-green-600" },
  { id: "العيد للبلون العادي", name: "ورشة العيد للبلون العادي", emoji: "\uD83D\uDD27", color: "from-orange-500 to-orange-600" },
  { id: "بلقاسم", name: "ورشة بلقاسم", emoji: "\uD83D\uDD33", color: "from-purple-500 to-purple-600" },
  { id: "Ecrou", name: "ورشة Ecrou", emoji: "\u26D3\uFE0F", color: "from-red-500 to-red-600" },
  { id: "Tige Filetée", name: "ورشة Tige Filetée", emoji: "\uD83D\uDCCF", color: "from-indigo-500 to-indigo-600" },
  { id: "السنسلة", name: "ورشة السنسلة", emoji: "\uD83D\uDD17", color: "from-teal-500 to-teal-600" },
  { id: "الشبكة", name: "ورشة الشبكة", emoji: "\uD83D\uDED6", color: "from-amber-500 to-amber-600" },
];

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getUnit(section?: string) {
  return section === "Tige Filetée" ? "قطعة" : "كلغ";
}

export default function FactoryMap() {
  const { toast } = useToast();
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [workerName, setWorkerName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [logDate, setLogDate] = useState(getTodayDate());
  const [addMachineOpen, setAddMachineOpen] = useState(false);
  const [newMachineCode, setNewMachineCode] = useState("");
  const [newMachineName, setNewMachineName] = useState("");
  const [addMachineWorkshop, setAddMachineWorkshop] = useState<string>("");

  const { data: machinesData, isLoading: machinesLoading } = useQuery<any[]>({
    queryKey: ['/api/machines'],
  });

  const { data: todayLogs } = useQuery<any[]>({
    queryKey: ['/api/production-logs', { date: logDate }],
    queryFn: async () => {
      const res = await fetch(`/api/production-logs?date=${logDate}`, { headers: { ...authHeaders() } });
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
      toast({ title: "\u2705 تم إضافة جميع الماكينات" });
    },
  });

  const addMachineMutation = useMutation({
    mutationFn: async (data: { code: string; name: string; section: string }) => {
      await apiRequest('POST', '/api/machines', { ...data, posX: null, posY: null, width: null, height: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/machines'] });
      toast({ title: "\u2705 تم إضافة الماكينة بنجاح" });
      setNewMachineCode("");
      setNewMachineName("");
      setAddMachineOpen(false);
    },
    onError: () => {
      toast({ title: "\u274C فشل إضافة الماكينة", variant: "destructive" });
    },
  });

  const addLogMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/production-logs', data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/production-logs'] });
      toast({ title: "\u2705 تم تسجيل الإنتاج بنجاح" });
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
      toast({ title: "\u26A0\uFE0F يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const dbMachine = machineDbMap[selectedMachine];
    if (!dbMachine) {
      toast({ title: "\u274C الماكينة غير موجودة في قاعدة البيانات", variant: "destructive" });
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
  const currentWorkshop = WORKSHOPS.find(w => w.id === selectedWorkshop);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Sidebar role="factory_monitor" />
      <main className="md:mr-64 pt-20 md:pt-0">
        <div className="p-4 md:p-6 space-y-4">
          {!selectedWorkshop ? (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{"\uD83C\uDFED"}</span>
                  <h1 className="text-xl font-bold">ورشات المصنع</h1>
                </div>
                {!hasMachines && (
                  <Button
                    onClick={() => seedMachinesMutation.mutate()}
                    disabled={seedMachinesMutation.isPending}
                    data-testid="button-seed-machines"
                  >
                    {seedMachinesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "\u2699\uFE0F تهيئة الماكينات"}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {WORKSHOPS.map((workshop) => {
                  const machineCount = workshopMachineCounts[workshop.id] || 0;
                  const logInfo = workshopLogCounts[workshop.id];

                  return (
                    <Card
                      key={workshop.id}
                      className="cursor-pointer hover-elevate transition-all overflow-visible"
                      onClick={() => {
                        setSelectedWorkshop(workshop.id);
                        setSelectedMachine(null);
                      }}
                      data-testid={`card-workshop-${workshop.id}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${workshop.color} flex items-center justify-center shadow-sm`}>
                          <span className="text-xl">{workshop.emoji}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{workshop.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{"\uD83D\uDD27"} {machineCount} ماكينة</p>
                        </div>
                        {logInfo ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-[10px]">
                              {"\u2696\uFE0F"} {logInfo.qty} {getUnit(workshop.id)}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {"\u2705"} {logInfo.activeMachines.size} نشطة
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">{"\uD83D\uDCA4"} لا يوجد إنتاج اليوم</p>
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
                  <span className="text-xl">{currentWorkshop?.emoji}</span>
                  <h1 className="text-xl font-bold">
                    {currentWorkshop?.name || selectedWorkshop}
                  </h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-40 text-sm"
                    data-testid="input-log-date"
                  />
                  <Dialog open={addMachineOpen} onOpenChange={(open) => {
                    setAddMachineOpen(open);
                    if (open && selectedWorkshop) setAddMachineWorkshop(selectedWorkshop);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2" data-testid="button-add-machine">
                        <Plus className="h-4 w-4" />
                        إضافة ماكينة
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle>{"\u2795"} إضافة ماكينة جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">{"\uD83C\uDFED"} الورشة</label>
                          <Select value={addMachineWorkshop} onValueChange={setAddMachineWorkshop}>
                            <SelectTrigger data-testid="select-machine-workshop" className="bg-background">
                              <SelectValue placeholder="اختر الورشة" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {WORKSHOPS.map(w => (
                                <SelectItem key={w.id} value={w.id}>{w.emoji} {w.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">{"\uD83C\uDD94"} رمز الماكينة *</label>
                          <Input
                            value={newMachineCode}
                            onChange={(e) => setNewMachineCode(e.target.value)}
                            placeholder="مثال: FIL-M20"
                            className="bg-background"
                            data-testid="input-new-machine-code"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">{"\uD83C\uDFF7\uFE0F"} اسم العرض *</label>
                          <Input
                            value={newMachineName}
                            onChange={(e) => setNewMachineName(e.target.value)}
                            placeholder="مثال: M20"
                            className="bg-background"
                            data-testid="input-new-machine-name"
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
                          data-testid="button-confirm-add-machine"
                        >
                          {addMachineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          إضافة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                          <span className="text-base">{hasLog ? "\u2705" : "\u2699\uFE0F"}</span>
                          <span className="font-bold text-sm">{displayName}</span>
                          {hasLog && (
                            <span className="text-[10px] opacity-80">{totalQty} {getUnit(selectedWorkshop || '')}</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {workshopMachines.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <span className="text-4xl block mb-3">{"\uD83D\uDD27"}</span>
                        <p className="text-muted-foreground">لا توجد ماكينات في هذه الورشة</p>
                        {!hasMachines && (
                          <Button
                            className="mt-4"
                            onClick={() => seedMachinesMutation.mutate()}
                            disabled={seedMachinesMutation.isPending}
                            data-testid="button-seed-machines-workshop"
                          >
                            {seedMachinesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "\u2699\uFE0F تهيئة الماكينات"}
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
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{"\u2699\uFE0F"}</span>
                          <h2 className="font-bold text-lg">
                            ماكينة {machineDbMap[selectedMachine]?.name || selectedMachine}
                          </h2>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">{"\uD83D\uDC77"} اسم العامل *</label>
                            <Input
                              value={workerName}
                              onChange={(e) => setWorkerName(e.target.value)}
                              placeholder="اسم العامل"
                              data-testid="input-worker-name"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">{"\u2696\uFE0F"} {selectedWorkshop === "Tige Filetée" ? "عدد القطع *" : "الوزن بالكيلو *"}</label>
                            <Input
                              type="number"
                              min={0}
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder={selectedWorkshop === "Tige Filetée" ? "عدد القطع" : "الوزن بالكيلو"}
                              data-testid="input-quantity"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">{"\uD83D\uDCDD"} وصف المنتج</label>
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
                            <p className="text-xs font-bold text-muted-foreground">{"\uD83D\uDCCB"} سجل اليوم لهذه الماكينة:</p>
                            {todayLogsByMachine[selectedMachine].map((log: any) => (
                              <div key={log.id} className="bg-muted rounded-lg p-2 text-xs space-y-1" data-testid={`log-entry-${log.id}`}>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-bold">{"\uD83D\uDC77"} {log.workerName}</span>
                                  <Badge variant="secondary" className="text-[10px]">{"\u2696\uFE0F"} {log.quantity} {getUnit(selectedWorkshop || '')}</Badge>
                                </div>
                                {log.productDescription && (
                                  <p className="text-muted-foreground">{"\uD83D\uDCDD"} {log.productDescription}</p>
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
                        <span className="text-4xl block">{"\uD83D\uDC46"}</span>
                        <p className="text-sm text-muted-foreground">اضغط على أي ماكينة لتسجيل الإنتاج</p>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>{"\u2705"}</span>
                            <span>تم التسجيل اليوم</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{"\u2699\uFE0F"}</span>
                            <span>لم يتم التسجيل</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-3">{"\uD83D\uDCCA"} ملخص الورشة</h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">{"\u2696\uFE0F"} إجمالي الإنتاج ({getUnit(selectedWorkshop || '')})</span>
                          <span className="font-bold text-lg text-green-700 dark:text-green-400" data-testid="text-total-quantity">
                            {workshopLogCounts[selectedWorkshop]?.qty || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">{"\uD83D\uDCCB"} عدد التسجيلات</span>
                          <span className="font-bold" data-testid="text-total-logs">
                            {workshopLogCounts[selectedWorkshop]?.logs || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">{"\u2705"} ماكينات نشطة</span>
                          <span className="font-bold" data-testid="text-active-machines">
                            {workshopLogCounts[selectedWorkshop]?.activeMachines.size || 0} / {workshopMachineCounts[selectedWorkshop] || 0}
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
