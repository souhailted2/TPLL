import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatMaghrebDate } from "@/lib/queryClient";
const tplLogoPath = "/tpl-logo.jpg";

interface WorkshopItemPrintProps {
  order: any;
  item: any;
  onClose: () => void;
}

export function WorkshopItemPrint({ order, item, onClose }: WorkshopItemPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const getUnitLabel = (unit: string) => {
    return unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';
  };

  const handlePrint = () => {
    const logoImg = document.querySelector('#workshop-logo-img') as HTMLImageElement;
    let logoDataUrl = '';
    if (logoImg && logoImg.complete) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.naturalWidth;
        canvas.height = logoImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(logoImg, 0, 0);
          logoDataUrl = canvas.toDataURL('image/jpeg');
        }
      } catch (e) {
        logoDataUrl = '';
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const logoSrc = logoDataUrl || '';
    const nowDate = formatMaghrebDate(new Date());
    const nowTime = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>أمر ورشة - طلب #${order.id} - ${item.product?.name || ''}</title>
        <style>
          @media print {
            body { margin: 0; }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            direction: rtl;
            color: #1a1a1a;
            font-size: 14px;
            padding: 25px;
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
          .logo {
            height: 55px;
            width: 55px;
            object-fit: contain;
            border-radius: 6px;
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
            font-size: 12px;
            color: #666;
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
            display: flex;
            flex-wrap: wrap;
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
            width: 48%;
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
            padding: 12px 10px;
            text-align: right;
            font-size: 14px;
          }
          td {
            padding: 12px 10px;
            border-bottom: 1px solid #e2e8f0;
            text-align: right;
            font-size: 14px;
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
          .signatures {
            display: flex;
            gap: 30px;
            margin-top: 50px;
            padding-top: 20px;
          }
          .sig-box {
            flex: 1;
            text-align: center;
            padding: 15px;
            border: 1px dashed #cbd5e1;
            border-radius: 6px;
          }
          .sig-label {
            font-weight: bold;
            color: #475569;
            margin-bottom: 40px;
            font-size: 15px;
          }
          .sig-line {
            border-top: 1px solid #94a3b8;
            margin-top: 50px;
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
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-right">
            ${logoSrc ? `<img src="${logoSrc}" alt="TPL Logo" class="logo" />` : ''}
            <div>
              <div class="company-name">شركة TPL</div>
              <div class="company-sub">شركة صناعة البراغي واللوالب والمسامير</div>
            </div>
          </div>
          <div class="header-left">
            <div>التاريخ: ${nowDate}</div>
            <div>الوقت: ${nowTime}</div>
          </div>
        </div>

        <div class="doc-title">أمر إنجاز للورشة</div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">رقم الطلب:</span>
            <span class="info-value">#${order.id}</span>
          </div>
          <div class="info-item">
            <span class="info-label">نقطة البيع:</span>
            <span class="info-value">${order.salesPoint?.salesPointName || order.salesPoint?.firstName || '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">تاريخ الطلب:</span>
            <span class="info-value">${formatMaghrebDate(order.createdAt)}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الرمز</th>
              <th>الكمية</th>
              <th>الوحدة</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: bold; font-size: 15px;">${item.product?.name || '-'}</td>
              <td style="color: #64748b;">${item.product?.sku || '-'}</td>
              <td style="font-weight: bold; color: #1e3a5f; font-size: 16px;">${item.quantity}</td>
              <td>${getUnitLabel(item.unit || 'piece')}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div class="notes-section">
          <div class="notes-title">ملاحظات:</div>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-label">مسؤول المستخدمين</div>
            <div class="sig-line">التوقيع والختم</div>
          </div>
          <div class="sig-box">
            <div class="sig-label">مسؤول الورشة</div>
            <div class="sig-line">التوقيع والختم</div>
          </div>
        </div>

        <div class="footer">
          شركة TPL - نظام إدارة سلسلة التوريد | تمت الطباعة بتاريخ ${nowDate} ${nowTime}
        </div>
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
          <h2 className="font-bold text-lg">معاينة أمر الورشة — {item.product?.name}</h2>
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
          <img id="workshop-logo-img" src={tplLogoPath} alt="" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: '1px', width: '1px' }} crossOrigin="anonymous" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1e3a5f', paddingBottom: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={tplLogoPath} alt="TPL Logo" style={{ height: '45px', width: '45px', objectFit: 'contain', borderRadius: '6px' }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f' }}>شركة TPL</div>
                <div style={{ fontSize: '10px', color: '#666' }}>شركة صناعة البراغي واللوالب والمسامير</div>
              </div>
            </div>
            <div style={{ textAlign: 'left', fontSize: '11px', color: '#666' }}>
              <div>التاريخ: {formatMaghrebDate(new Date())}</div>
              <div>الوقت: {new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f', textAlign: 'center', margin: '10px 0', padding: '6px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
            أمر إنجاز للورشة — طلب #{order.id}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '6px', width: '48%' }}>
              <span style={{ fontWeight: 'bold', color: '#475569' }}>نقطة البيع:</span>
              <span>{order.salesPoint?.salesPointName || order.salesPoint?.firstName || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', width: '48%' }}>
              <span style={{ fontWeight: 'bold', color: '#475569' }}>تاريخ الطلب:</span>
              <span>{formatMaghrebDate(order.createdAt)}</span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
            <thead>
              <tr>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>اسم المنتج</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>الرمز</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>الكمية</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>الوحدة</th>
                <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', textAlign: 'right', fontSize: '13px' }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 'bold' }}>{item.product?.name || '-'}</td>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b' }}>{item.product?.sku || '-'}</td>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f' }}>{item.quantity}</td>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>{getUnitLabel(item.unit || 'piece')}</td>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}></td>
              </tr>
            </tbody>
          </table>

          <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', minHeight: '40px' }}>
            <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '5px', fontSize: '12px' }}>ملاحظات:</div>
          </div>

          <div style={{ display: 'flex', gap: '30px', marginTop: '30px' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '30px', fontSize: '14px' }}>مسؤول المستخدمين</div>
              <div style={{ borderTop: '1px solid #94a3b8', marginTop: '30px', paddingTop: '5px', fontSize: '10px', color: '#94a3b8' }}>التوقيع والختم</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '30px', fontSize: '14px' }}>مسؤول الورشة</div>
              <div style={{ borderTop: '1px solid #94a3b8', marginTop: '30px', paddingTop: '5px', fontSize: '10px', color: '#94a3b8' }}>التوقيع والختم</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
