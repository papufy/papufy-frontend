import { useCallback, useEffect, useState } from "react";
import { QrCodePlaceholder } from "../home/QrCodePlaceholder";

interface PaymentCheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  amountLabel: string;
  /** Código copia-e-cola Pix (mock ou API) */
  pixCopyPaste: string;
  pixQrCodeImage?: string | null;
  statusLabel?: string;
  loading?: boolean;
  onGeneratePix?: () => void;
  onPayCard?: (payload: {
    cardNumber: string;
    holderName: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
    cpfCnpj: string;
    phone: string;
    postalCode: string;
    addressNumber: string;
    email: string;
  }) => void;
}

export function PaymentCheckoutSheet({
  open,
  onClose,
  title,
  amountLabel,
  pixCopyPaste,
  pixQrCodeImage,
  statusLabel,
  loading = false,
  onGeneratePix,
  onPayCard,
}: PaymentCheckoutSheetProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [ccv, setCcv] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [email, setEmail] = useState("");

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
          {statusLabel && (
            <p className="mt-1 text-xs font-semibold text-sky-600">{statusLabel}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">Escolha Pix ou Cartão</p>
        </header>

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
          <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${method === "PIX" ? "bg-white text-sky-700 shadow" : "text-slate-600"}`}
              onClick={() => setMethod("PIX")}
            >
              Pix
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${method === "CREDIT_CARD" ? "bg-white text-sky-700 shadow" : "text-slate-600"}`}
              onClick={() => setMethod("CREDIT_CARD")}
            >
              Cartão
            </button>
          </div>

          {method === "PIX" ? (
            <>
              <button
                type="button"
                onClick={onGeneratePix}
                disabled={loading}
                className="h-11 w-full rounded-xl bg-sky-500 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Gerando Pix..." : "Gerar cobrança Pix"}
              </button>
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 shadow-inner">
                {pixQrCodeImage ? (
                  <img
                    src={pixQrCodeImage}
                    alt="QR Code Pix"
                    className="mx-auto h-44 w-44 object-contain"
                  />
                ) : (
                  <QrCodePlaceholder className="mx-auto scale-110" />
                )}
              </div>
              {pixCopyPaste && (
                <>
                  <p className="break-all rounded-xl bg-slate-50 px-3 py-2 text-center font-mono text-[10px] leading-relaxed text-slate-600">
                    {pixCopyPaste}
                  </p>

                  <button
                    type="button"
                    onClick={copyPix}
                    className="touch-target h-12 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-sm font-bold text-white shadow-lg shadow-sky-200/60 transition active:scale-[0.98]"
                  >
                    {copied ? "Código copiado!" : "Copiar Código Pix"}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <input value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Nome impresso no cartão" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Número do cartão" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <div className="grid w-full grid-cols-3 gap-2">
                <input value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} placeholder="MM" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <input value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} placeholder="AAAA" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <input value={ccv} onChange={(e) => setCcv(e.target.value)} placeholder="CVV" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <input value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} placeholder="CPF/CNPJ do pagador" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="CEP" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} placeholder="Número" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  onPayCard?.({
                    cardNumber,
                    holderName,
                    expiryMonth,
                    expiryYear,
                    ccv,
                    cpfCnpj,
                    phone,
                    postalCode,
                    addressNumber,
                    email,
                  })
                }
                className="h-11 w-full rounded-xl bg-sky-600 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Processando..." : "Pagar com Cartão"}
              </button>
            </>
          )}

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
