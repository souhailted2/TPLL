import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatMaghrebDate } from "@/lib/queryClient";

interface WorkshopOrderPrintProps {
  order: any;
  onClose: () => void;
}

export function WorkshopOrderPrint({ order, onClose }: WorkshopOrderPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const acceptedItems = (order.items || []).filter(
    (item: any) => item.itemStatus === 'accepted' || item.itemStatus === 'in_progress' || item.itemStatus === 'completed'
  );

  const getUnitLabel = (unit: string) => {
    return unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>أمر ورشة - طلب #${order.id}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            direction: rtl;
            padding: 20px;
            color: #1a1a1a;
            font-size: 14px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #1e3a5f;
          }
          .company-sub {
            font-size: 11px;
            color: #666;
          }
          .header-left {
            text-align: left;
          }
          .doc-title {
            font-size: 20px;
            font-weight: bold;
            color: #d32f2f;
            text-align: center;
            margin: 15px 0;
            padding: 8px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
            background: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          .info-item {
            display: flex;
            gap: 6px;
          }
          .info-label {
            font-weight: bold;
            color: #475569;
            white-space: nowrap;
          }
          .info-value {
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th {
            background: #1e3a5f;
            color: white;
            padding: 10px 8px;
            text-align: right;
            font-size: 13px;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
            text-align: right;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f8fafc;
          }
          .total-row {
            font-weight: bold;
            background: #f1f5f9 !important;
            border-top: 2px solid #1e3a5f;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-top: 40px;
            padding-top: 20px;
          }
          .sig-box {
            text-align: center;
            padding: 15px;
            border: 1px dashed #cbd5e1;
            border-radius: 6px;
          }
          .sig-label {
            font-weight: bold;
            color: #475569;
            margin-bottom: 40px;
          }
          .sig-line {
            border-top: 1px solid #94a3b8;
            margin-top: 40px;
            padding-top: 5px;
            font-size: 11px;
            color: #94a3b8;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
          }
          .notes-section {
            margin-top: 15px;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            min-height: 60px;
          }
          .notes-title {
            font-weight: bold;
            color: #475569;
            margin-bottom: 5px;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between gap-2 z-[110]">
          <h2 className="font-bold text-lg">معاينة أمر الورشة</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="gap-2" data-testid="button-print-workshop-order">
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-close-print-preview">
              إغلاق
            </Button>
          </div>
        </div>

        <div ref={printRef} className="p-6" dir="rtl">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1e3a5f', paddingBottom: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f' }}>شركة TPL</div>
                <div style={{ fontSize: '11px', color: '#666' }}>شركة صناعة البراغي واللوالب والمسامير</div>
              </div>
            </div>
            <div style={{ textAlign: 'left', fontSize: '12px', color: '#666' }}>
              <div>التاريخ: {formatMaghrebDate(new Date())}</div>
              <div>الوقت: {format(new Date(), 'p')}</div>
            </div>
          </div>

          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d32f2f', textAlign: 'center', margin: '15px 0', padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
            أمر إنجاز للورشة
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontWeight: 'bold', color: '#475569' }}>رقم الطلب:</span>
              <span style={{ color: '#1e293b' }}>#{order.id}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontWeight: 'bold', color: '#475569' }}>نقطة البيع:</span>
              <span style={{ color: '#1e293b' }}>{order.salesPoint?.salesPointName || order.salesPoint?.firstName || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontWeight: 'bold', color: '#475569' }}>تاريخ الطلب:</span>
              <span style={{ color: '#1e293b' }}>{order.createdAt ? formatMaghrebDate(order.createdAt) : '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontWeight: 'bold', color: '#475569' }}>عدد الأصناف المقبولة:</span>
              <span style={{ color: '#1e293b' }}>{acceptedItems.length}</span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
            <thead>
              <tr>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>#</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>اسم المنتج</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>الرمز</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>الكمية</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>الوحدة</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {acceptedItems.map((item: any, idx: number) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontSize: '13px' }}>{idx + 1}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>{item.product?.name || '-'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>{item.product?.sku || '-'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: '#1e3a5f' }}>{item.quantity}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontSize: '13px' }}>{getUnitLabel(item.unit || 'piece')}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontSize: '13px' }}></td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', background: '#f1f5f9', borderTop: '2px solid #1e3a5f' }}>
                <td colSpan={3} style={{ padding: '8px', textAlign: 'right', fontSize: '13px' }}>المجموع</td>
                <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', color: '#1e3a5f' }}>{acceptedItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)}</td>
                <td colSpan={2} style={{ padding: '8px' }}></td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '15px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', minHeight: '60px' }}>
            <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '5px', fontSize: '13px' }}>ملاحظات:</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '40px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', padding: '15px', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '40px' }}>مسؤول الاستقبال</div>
              <div style={{ borderTop: '1px solid #94a3b8', marginTop: '40px', paddingTop: '5px', fontSize: '11px', color: '#94a3b8' }}>التوقيع والختم</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '40px' }}>مسؤول الورشة</div>
              <div style={{ borderTop: '1px solid #94a3b8', marginTop: '40px', paddingTop: '5px', fontSize: '11px', color: '#94a3b8' }}>التوقيع والختم</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '40px' }}>المدير</div>
              <div style={{ borderTop: '1px solid #94a3b8', marginTop: '40px', paddingTop: '5px', fontSize: '11px', color: '#94a3b8' }}>التوقيع والختم</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#94a3b8' }}>
            شركة TPL - نظام إدارة سلسلة التوريد | تمت الطباعة بتاريخ {formatMaghrebDate(new Date())} {new Date().toLocaleTimeString('ar-DZ', {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </div>
    </div>
  );
}
