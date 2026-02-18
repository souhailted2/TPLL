import { Sidebar } from "@/components/layout-sidebar";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";

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

export default function AdminProduction() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const { data: machinesData, isLoading: machinesLoading } = useQuery<any[]>({
    queryKey: ['/api/machines'],
  });

  const { data: todayLogs } = useQuery<any[]>({
    queryKey: [`/api/production-logs?date=${selectedDate}`],
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

  if (machinesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentWorkshop = WORKSHOPS.find(w => w.id === selectedWorkshop);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Sidebar role="admin" />
      <main className="md:mr-64 pt-20 md:pt-0">
        <div className="p-4 md:p-6 space-y-4">
          {!selectedWorkshop ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏭</span>
                  <h1 className="text-xl font-bold" data-testid="text-production-title">مراقبة الإنتاج</h1>
                </div>
                <p className="text-sm text-muted-foreground">عرض إنتاج الورشات (للاطلاع فقط)</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">📅 التاريخ:</span>
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
                              📦 {logInfo.qty} قطعة
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
                                📦 {totalQty} قطعة
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
                                  <Badge variant="secondary" className="text-[10px]">📦 {log.quantity} قطعة</Badge>
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
                                <span className="text-muted-foreground">📦 إجمالي الإنتاج</span>
                                <span className="font-bold text-green-600">{logInfo?.qty || 0} قطعة</span>
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