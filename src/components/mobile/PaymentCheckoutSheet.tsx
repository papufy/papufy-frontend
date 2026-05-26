import { useCallback, useEffect, useState } from "react";
import { QrCodePlaceholder } from "../home/QrCodePlaceholder";

interface PaymentCheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  amountLabel: string;
  /** Código copia-e-cola Pix (mock ou API) */
  pixCopyPaste: string;
}

export function PaymentCheckoutSheet({
  open,
  onClose,
  title,
  amountLabel,
  pixCopyPaste,
}: PaymentCheckoutSheetProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const copyPix = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback silencioso em browsers antigos */
    }
  }, [pixCopyPaste]);

  if (!open && !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Pagamento Pix"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Fechar"
      />

      <div
        className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

        <header className="mb-4 text-center">
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <p className="mt-1 text-2xl font-black text-sky-600">{amountLabel}</p>
          <p className="mt-1 text-xs text-slate-500">
            Escaneie o QR Code ou copie o código Pix
          </p>
        </header>

        <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 shadow-inner">
            <QrCodePlaceholder className="mx-auto scale-110" />
          </div>

          <p className="break-all rounded-xl bg-slate-50 px-3 py-2 text-center font-mono text-[10px] leading-relaxed text-slate-600">
            {pixCopyPaste}
          </p>

          <button
            type="button"
            onClick={copyPix}
            className="touch-target h-14 w-full max-w-sm rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-base font-bold text-white shadow-lg shadow-sky-200/60 transition active:scale-[0.98]"
          >
            {copied ? "Código copiado!" : "Copiar Código Pix"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full text-sm font-semibold text-slate-500 active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
