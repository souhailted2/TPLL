import { useState, useEffect } from "react";
import { X, Share, Plus } from "lucide-react";

export function IosInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    const dismissed = sessionStorage.getItem("ios-banner-dismissed");

    if (isIos && !isInStandalone && !dismissed) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("ios-banner-dismissed", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mx-4 mb-3 rounded-xl bg-blue-900/60 border border-blue-500/40 p-3 text-sm text-blue-100">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-blue-200">📲 فعّل الإشعارات على iPhone</span>
        <button
          onClick={dismiss}
          className="text-blue-400 hover:text-white shrink-0"
          aria-label="إغلاق"
          data-testid="button-dismiss-ios-banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-blue-200/80 mb-2">
        لتصلك الإشعارات على هاتفك، أضف الموقع للشاشة الرئيسية:
      </p>
      <ol className="text-xs space-y-1 text-blue-100/90">
        <li className="flex items-center gap-1.5">
          <span className="bg-blue-700 rounded px-1.5 py-0.5 font-bold">1</span>
          اضغط زر المشاركة
          <Share className="h-3.5 w-3.5 inline shrink-0" />
          في Safari
        </li>
        <li className="flex items-center gap-1.5">
          <span className="bg-blue-700 rounded px-1.5 py-0.5 font-bold">2</span>
          اختر "إضافة إلى الشاشة الرئيسية"
          <Plus className="h-3.5 w-3.5 inline shrink-0" />
        </li>
        <li className="flex items-center gap-1.5">
          <span className="bg-blue-700 rounded px-1.5 py-0.5 font-bold">3</span>
          افتح التطبيق من الشاشة الرئيسية وفعّل الإشعارات
        </li>
      </ol>
    </div>
  );
}
