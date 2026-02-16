import { Sidebar } from "@/components/layout-sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X as XIcon, Save, Factory } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

const FACTORY_SECTIONS = [
  {
    name: "M Babine",
    nameAr: "بابين",
    machines: [
      { code: "MCH1", x: 2, y: 1, w: 1, h: 1 },
      { code: "A1", x: 3, y: 1, w: 1, h: 1 },
      { code: "A2", x: 4, y: 1, w: 1, h: 1 },
      { code: "A3", x: 5, y: 1, w: 1, h: 1 },
      { code: "A4", x: 6, y: 1, w: 1, h: 1 },
      { code: "A5", x: 7, y: 1, w: 1, h: 1 },
      { code: "MCH1-2", x: 2, y: 2, w: 1, h: 1 },
      { code: "B1", x: 3, y: 2, w: 1, h: 1 },
      { code: "B2", x: 4, y: 2, w: 1, h: 1 },
      { code: "B3", x: 5, y: 2, w: 1, h: 1 },
    ],
    color: "bg-blue-100 border-blue-300",
    area: { x: 1, y: 0, w: 8, h: 3 },
  },
  {
    name: "Roulage",
    nameAr: "رولاج",
    machines: [
      { code: "MR1", x: 2, y: 4, w: 1, h: 1 },
      { code: "MR2", x: 3, y: 4, w: 1, h: 1 },
      { code: "MR3", x: 2, y: 5, w: 1, h: 1 },
      { code: "MR4", x: 3, y: 5, w: 1, h: 1 },
      { code: "MR5", x: 2, y: 6, w: 1, h: 1 },
      { code: "MR6", x: 3, y: 6, w: 1, h: 1 },
    ],
    color: "bg-green-100 border-green-300",
    area: { x: 1, y: 3, w: 4, h: 4 },
  },
  {
    name: "MCH Grand",
    nameAr: "ماكينة كبيرة",
    machines: [
      { code: "MCH-G1", x: 2, y: 7, w: 1, h: 1 },
      { code: "MCH-G2", x: 3, y: 7, w: 1, h: 1 },
    ],
    color: "bg-yellow-100 border-yellow-300",
    area: { x: 1, y: 7, w: 4, h: 1 },
  },
  {
    name: "Tréfilage",
    nameAr: "سحب الأسلاك",
    machines: [
      { code: "T1", x: 2, y: 8, w: 1, h: 1 },
      { code: "T2", x: 3, y: 8, w: 1, h: 1 },
      { code: "T3", x: 4, y: 8, w: 1, h: 1 },
      { code: "T4", x: 5, y: 8, w: 1, h: 1 },
    ],
    color: "bg-orange-100 border-orange-300",
    area: { x: 1, y: 8, w: 6, h: 1 },
  },
  {
    name: "Ecrous",
    nameAr: "صواميل",
    machines: [
      { code: "ME1", x: 6, y: 4, w: 1, h: 1 },
      { code: "ME2", x: 7, y: 4, w: 1, h: 1 },
      { code: "ME3", x: 8, y: 4, w: 1, h: 1 },
      { code: "ME4", x: 6, y: 5, w: 1, h: 1 },
      { code: "ME5", x: 7, y: 5, w: 1, h: 1 },
      { code: "ME6", x: 8, y: 5, w: 1, h: 1 },
    ],
    color: "bg-purple-100 border-purple-300",
    area: { x: 5, y: 3, w: 5, h: 3 },
  },
  {
    name: "Clous",
    nameAr: "مسامير",
    machines: [
      { code: "MC1", x: 6, y: 6, w: 1, h: 1 },
      { code: "MC2", x: 7, y: 6, w: 1, h: 1 },
      { code: "MC3", x: 8, y: 6, w: 1, h: 1 },
      { code: "MC4", x: 9, y: 6, w: 1, h: 1 },
      { code: "MC5", x: 6, y: 7, w: 1, h: 1 },
      { code: "MC6", x: 7, y: 7, w: 1, h: 1 },
      { code: "MC7", x: 8, y: 7, w: 1, h: 1 },
      { code: "MC8", x: 9, y: 7, w: 1, h: 1 },
    ],
    color: "bg-red-100 border-red-300",
    area: { x: 5, y: 6, w: 6, h: 2 },
  },
  {
    name: "Vis & Boulons",
    nameAr: "براغي ولوالب",
    machines: [
      { code: "MV1", x: 10, y: 1, w: 1, h: 1 },
      { code: "MV2", x: 11, y: 1, w: 1, h: 1 },
      { code: "MV3", x: 12, y: 1, w: 1, h: 1 },
      { code: "MV4", x: 10, y: 2, w: 1, h: 1 },
      { code: "MV5", x: 11, y: 2, w: 1, h: 1 },
      { code: "MV6", x: 12, y: 2, w: 1, h: 1 },
      { code: "MV7", x: 10, y: 3, w: 1, h: 1 },
      { code: "MV8", x: 11, y: 3, w: 1, h: 1 },
    ],
    color: "bg-teal-100 border-teal-300",
    area: { x: 9, y: 0, w: 5, h: 4 },
  },
  {
    name: "Séchage",
    nameAr: "تجفيف",
    machines: [
      { code: "MS1", x: 13, y: 4, w: 1, h: 1 },
      { code: "MS2", x: 14, y: 4, w: 1, h: 1 },
    ],
    color: "bg-cyan-100 border-cyan-300",
    area: { x: 13, y: 3, w: 3, h: 2 },
  },
  {
    name: "Tige Filetée",
    nameAr: "قضبان ملولبة",
    machines: [
      { code: "MTF1", x: 13, y: 1, w: 1, h: 1 },
      { code: "MTF2", x: 14, y: 1, w: 1, h: 1 },
      { code: "MTF3", x: 13, y: 2, w: 1, h: 1 },
      { code: "MTF4", x: 14, y: 2, w: 1, h: 1 },
    ],
    color: "bg-indigo-100 border-indigo-300",
    area: { x: 13, y: 0, w: 3, h: 3 },
  },
  {
    name: "Boulons",
    nameAr: "براغي",
    machines: [
      { code: "MB1", x: 10, y: 5, w: 1, h: 1 },
      { code: "MB2", x: 11, y: 5, w: 1, h: 1 },
      { code: "MB3", x: 12, y: 5, w: 1, h: 1 },
      { code: "MB4", x: 10, y: 6, w: 1, h: 1 },
      { code: "MB5", x: 11, y: 6, w: 1, h: 1 },
    ],
    color: "bg-amber-100 border-amber-300",
    area: { x: 9, y: 5, w: 4, h: 2 },
  },
  {
    name: "Emballage",
    nameAr: "تغليف",
    machines: [
      { code: "MEM1", x: 13, y: 6, w: 1, h: 1 },
      { code: "MEM2", x: 14, y: 6, w: 1, h: 1 },
      { code: "MEM3", x: 13, y: 7, w: 1, h: 1 },
    ],
    color: "bg-lime-100 border-lime-300",
    area: { x: 13, y: 5, w: 3, h: 3 },
  },
  {
    name: "Cartons",
    nameAr: "كراتين",
    machines: [
      { code: "MK1", x: 2, y: 10, w: 1, h: 1 },
      { code: "MK2", x: 3, y: 10, w: 1, h: 1 },
      { code: "MK3", x: 4, y: 10, w: 1, h: 1 },
      { code: "MK4", x: 5, y: 10, w: 1, h: 1 },
    ],
    color: "bg-stone-100 border-stone-300",
    area: { x: 1, y: 9, w: 6, h: 2 },
  },
];

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function FactoryMap() {
  const { toast } = useToast();
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
      const allMachines = FACTORY_SECTIONS.flatMap(s =>
        s.machines.map(m => ({
          code: m.code,
          name: m.code,
          section: s.name,
          posX: String(m.x),
          posY: String(m.y),
          width: String(m.w),
          height: String(m.h),
        }))
      );
      for (const machine of allMachines) {
        await apiRequest('POST', '/api/machines', machine);
      }
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
      toast({ title: "الماكينة غير موجودة في قاعدة البيانات، يرجى تهيئة الماكينات أولا", variant: "destructive" });
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const hasMachines = machinesData && machinesData.length > 0;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <Sidebar role="factory_monitor" />
      <main className="md:mr-64 pt-20 md:pt-0">
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <Factory className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">خريطة المصنع</h1>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-40 text-sm"
                data-testid="input-log-date"
              />
              {!hasMachines && (
                <Button
                  size="sm"
                  onClick={() => seedMachinesMutation.mutate()}
                  disabled={seedMachinesMutation.isPending}
                  data-testid="button-seed-machines"
                >
                  {seedMachinesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تهيئة الماكينات"}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 overflow-x-auto">
              <div className="min-w-[700px] relative bg-white rounded-lg border p-4" style={{ minHeight: '600px' }}>
                <div className="relative" style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gridTemplateRows: 'repeat(11, 1fr)', gap: '2px', minHeight: '580px' }}>
                  {FACTORY_SECTIONS.map((section) => (
                    <div
                      key={section.name}
                      className={`absolute border-2 rounded-lg opacity-30 ${section.color}`}
                      style={{
                        left: `${(section.area.x / 16) * 100}%`,
                        top: `${(section.area.y / 11) * 100}%`,
                        width: `${(section.area.w / 16) * 100}%`,
                        height: `${(section.area.h / 11) * 100}%`,
                      }}
                    >
                      <span className="absolute top-0.5 right-1 text-[9px] font-bold text-slate-700 opacity-80">
                        {section.nameAr}
                      </span>
                    </div>
                  ))}

                  {FACTORY_SECTIONS.flatMap((section) =>
                    section.machines.map((m) => {
                      const hasLog = todayLogsByMachine[m.code]?.length > 0;
                      const isSelected = selectedMachine === m.code;
                      const totalQty = todayLogsByMachine[m.code]?.reduce((s: number, l: any) => s + l.quantity, 0) || 0;

                      return (
                        <button
                          key={m.code}
                          onClick={() => handleMachineClick(m.code)}
                          className={`absolute flex flex-col items-center justify-center rounded-md border-2 transition-all text-[10px] font-bold cursor-pointer z-10
                            ${isSelected
                              ? 'border-primary bg-primary/20 ring-2 ring-primary shadow-lg scale-110'
                              : hasLog
                                ? 'border-green-500 bg-green-50 hover:bg-green-100'
                                : 'border-slate-300 bg-white hover:bg-slate-50'
                            }`}
                          style={{
                            left: `${(m.x / 16) * 100}%`,
                            top: `${(m.y / 11) * 100}%`,
                            width: `${(m.w / 16) * 100}%`,
                            height: `${(m.h / 11) * 100}%`,
                            padding: '2px',
                          }}
                          data-testid={`button-machine-${m.code}`}
                        >
                          <span className="truncate w-full text-center">{m.code}</span>
                          {hasLog && (
                            <span className="text-[8px] text-green-700 font-bold">{totalQty}</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {FACTORY_SECTIONS.map((s) => (
                  <Badge key={s.name} variant="secondary" className={`text-[10px] ${s.color}`}>
                    {s.nameAr} - {s.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {selectedMachine ? (
                <Card data-testid="card-machine-input">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-bold text-lg">ماكينة {selectedMachine}</h2>
                      <Button size="icon" variant="outline" onClick={() => setSelectedMachine(null)} data-testid="button-close-machine">
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">اسم العامل *</label>
                        <Input
                          value={workerName}
                          onChange={(e) => setWorkerName(e.target.value)}
                          placeholder="اسم العامل"
                          data-testid="input-worker-name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">الكمية المنجزة *</label>
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
                        <label className="text-xs text-slate-500 block mb-1">وصف المنتج</label>
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
                        <p className="text-xs font-bold text-slate-500">سجل اليوم لهذه الماكينة:</p>
                        {todayLogsByMachine[selectedMachine].map((log: any) => (
                          <div key={log.id} className="bg-slate-50 rounded-lg p-2 text-xs space-y-1" data-testid={`log-entry-${log.id}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold">{log.workerName}</span>
                              <Badge variant="secondary" className="text-[10px]">{log.quantity} قطعة</Badge>
                            </div>
                            {log.productDescription && (
                              <p className="text-slate-400">{log.productDescription}</p>
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
                    <Factory className="h-12 w-12 text-slate-300 mx-auto" />
                    <p className="text-sm text-slate-500">اضغط على أي ماكينة في الخريطة لتسجيل الإنتاج</p>
                    <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-50" />
                        <span>تم التسجيل اليوم</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded border-2 border-slate-300 bg-white" />
                        <span>لم يتم التسجيل</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-3">ملخص اليوم</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">إجمالي القطع المنجزة</span>
                      <span className="font-bold text-lg text-green-700" data-testid="text-total-quantity">
                        {todayLogs?.reduce((s: number, l: any) => s + l.quantity, 0) || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">عدد التسجيلات</span>
                      <span className="font-bold" data-testid="text-total-logs">{todayLogs?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">ماكينات نشطة</span>
                      <span className="font-bold" data-testid="text-active-machines">
                        {Object.keys(todayLogsByMachine).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
