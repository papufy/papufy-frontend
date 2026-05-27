import { useCallback, useEffect, useMemo, useState } from "react";
import { QrCodePlaceholder } from "../home/QrCodePlaceholder";

export interface PaymentCardPayload {
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
}

export interface PayerProfilePayload {
  cpfCnpj: string;
  telefone?: string;
}

interface PaymentCheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  amountLabel: string;
  pixCopyPaste: string;
  pixQrCodeImage?: string | null;
  statusLabel?: string;
  loading?: boolean;
  errorMessage?: string | null;
  /** Exibe CPF do pagador quando ainda não há cadastro no Asaas */
  needsPayerCpf?: boolean;
  onGeneratePix?: (payerProfile?: PayerProfilePayload) => void;
  onPayCard?: (
    payload: PaymentCardPayload,
    payerProfile?: PayerProfilePayload
  ) => void;
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 text-sm font-medium text-sky-600"
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600"
        aria-hidden
      />
      {label}
    </div>
  );
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function resolvePixImageSrc(encoded?: string | null): string | null {
  if (!encoded?.trim()) return null;
  const trimmed = encoded.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

function validateCardForm(payload: PaymentCardPayload): string | null {
  const number = payload.cardNumber.replace(/\D/g, "");
  if (number.length < 13) return "Informe um número de cartão válido.";
  if (!payload.holderName.trim()) return "Informe o nome impresso no cartão.";
  const month = payload.expiryMonth.replace(/\D/g, "");
  const year = payload.expiryYear.replace(/\D/g, "");
  if (month.length !== 2 || Number(month) < 1 || Number(month) > 12) {
    return "Validade inválida (use MM).";
  }
  if (year.length !== 2 && year.length !== 4) {
    return "Validade inválida (use AA ou AAAA).";
  }
  if (payload.ccv.replace(/\D/g, "").length < 3) return "Informe o CVV.";
  if (payload.cpfCnpj.replace(/\D/g, "").length < 11) {
    return "Informe CPF/CNPJ do titular.";
  }
  if (!payload.email.includes("@")) return "Informe um e-mail válido.";
  if (payload.postalCode.replace(/\D/g, "").length < 8) return "Informe o CEP.";
  if (!payload.addressNumber.trim()) return "Informe o número do endereço.";
  if (payload.phone.replace(/\D/g, "").length < 10) {
    return "Informe um telefone válido.";
  }
  return null;
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
  errorMessage = null,
  needsPayerCpf = false,
  onGeneratePix,
  onPayCard,
}: PaymentCheckoutSheetProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
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
  const [payerCpf, setPayerCpf] = useState("");
  const [payerPhone, setPayerPhone] = useState("");

  const pixImageSrc = useMemo(
    () => resolvePixImageSrc(pixQrCodeImage),
    [pixQrCodeImage]
  );

  const displayError = localError ?? errorMessage;
  const busy = loading;

  useEffect(() => {
    if (open) {
      setVisible(true);
      setLocalError(null);
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

  useEffect(() => {
    if (!errorMessage) return;
    setLocalError(null);
  }, [errorMessage]);

  const copyPix = useCallback(async () => {
    if (!pixCopyPaste.trim()) return;
    try {
      await navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setLocalError("Não foi possível copiar. Selecione o código manualmente.");
    }
  }, [pixCopyPaste]);

  const buildPayerProfile = (): PayerProfilePayload | undefined => {
    if (!needsPayerCpf) return undefined;
    const cpf = payerCpf.replace(/\D/g, "");
    if (cpf.length < 11) {
      setLocalError("Informe seu CPF ou CNPJ para o primeiro pagamento.");
      return undefined;
    }
    const phone = payerPhone.replace(/\D/g, "");
    return {
      cpfCnpj: cpf,
      telefone: phone.length >= 10 ? phone : undefined,
    };
  };

  const handleGeneratePix = () => {
    setLocalError(null);
    const payerProfile = buildPayerProfile();
    if (needsPayerCpf && !payerProfile) return;
    onGeneratePix?.(payerProfile);
  };

  const handlePayCard = () => {
    const payload: PaymentCardPayload = {
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
    };
    const validationError = validateCardForm(payload);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    const payerProfile = buildPayerProfile();
    if (needsPayerCpf && !payerProfile) return;
    setLocalError(null);
    onPayCard?.(payload, payerProfile);
  };

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  if (!open && !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Pagamento seguro"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        disabled={busy}
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
            <p className="mt-1 text-xs font-semibold text-sky-600">
              {statusLabel}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">Escolha Pix ou Cartão</p>
        </header>

        {displayError && (
          <p
            className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-center text-xs font-medium text-sky-800"
            role="alert"
          >
            {displayError}
          </p>
        )}

        {busy && (
          <div className="mb-4">
            <LoadingSpinner
              label={
                method === "PIX"
                  ? "Gerando cobrança Pix..."
                  : "Processando cartão..."
              }
            />
          </div>
        )}

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
          {needsPayerCpf && (
            <div className="w-full rounded-xl border border-sky-100 bg-sky-50/50 p-3">
              <p className="mb-2 text-xs font-semibold text-sky-800">
                Primeiro pagamento — confirme seus dados
              </p>
              <input
                value={payerCpf}
                onChange={(e) =>
                  setPayerCpf(e.target.value.replace(/\D/g, "").slice(0, 14))
                }
                placeholder="CPF ou CNPJ"
                disabled={busy}
                inputMode="numeric"
                className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
              <input
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                placeholder="Telefone (opcional)"
                disabled={busy}
                inputMode="tel"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
            </div>
          )}

          <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              disabled={busy}
              className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
                method === "PIX"
                  ? "bg-white text-sky-700 shadow"
                  : "text-slate-600"
              }`}
              onClick={() => setMethod("PIX")}
            >
              Pix
            </button>
            <button
              type="button"
              disabled={busy}
              className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
                method === "CREDIT_CARD"
                  ? "bg-white text-sky-700 shadow"
                  : "text-slate-600"
              }`}
              onClick={() => setMethod("CREDIT_CARD")}
            >
              Cartão
            </button>
          </div>

          {method === "PIX" ? (
            <>
              <button
                type="button"
                onClick={handleGeneratePix}
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : null}
                {busy ? "Gerando Pix..." : "Gerar cobrança Pix"}
              </button>

              <div className="flex w-full flex-col items-center rounded-2xl border border-sky-100 bg-sky-50/60 p-5 shadow-inner">
                {pixImageSrc ? (
                  <img
                    src={pixImageSrc}
                    alt="QR Code Pix"
                    className="mx-auto h-52 w-52 max-w-full object-contain"
                  />
                ) : (
                  <QrCodePlaceholder className="mx-auto scale-110" />
                )}
                {!pixCopyPaste && !pixImageSrc && (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Gere a cobrança para exibir o QR Code e o copia e cola.
                  </p>
                )}
              </div>

              {pixCopyPaste && (
                <>
                  <p className="w-full break-all rounded-xl bg-slate-50 px-3 py-2 text-center font-mono text-[10px] leading-relaxed text-slate-600">
                    {pixCopyPaste}
                  </p>

                  <button
                    type="button"
                    onClick={() => void copyPix()}
                    disabled={busy || !pixCopyPaste.trim()}
                    className="touch-target flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-sm font-bold text-white shadow-lg shadow-sky-200/60 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {copied ? "Código copiado!" : "Copiar Código Pix"}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <input
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Nome impresso no cartão"
                disabled={busy}
                autoComplete="cc-name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="Número do cartão"
                disabled={busy}
                inputMode="numeric"
                autoComplete="cc-number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
              <div className="grid w-full grid-cols-3 gap-2">
                <input
                  value={expiryMonth}
                  onChange={(e) =>
                    setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  placeholder="MM"
                  disabled={busy}
                  inputMode="numeric"
                  autoComplete="cc-exp-month"
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
                />
                <input
                  value={expiryYear}
                  onChange={(e) =>
                    setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="AA"
                  disabled={busy}
                  inputMode="numeric"
                  autoComplete="cc-exp-year"
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
                />
                <input
                  value={ccv}
                  onChange={(e) =>
                    setCcv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="CVV"
                  disabled={busy}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
                />
              </div>
              <input
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="CPF/CNPJ do pagador"
                disabled={busy}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefone"
                disabled={busy}
                inputMode="tel"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
              <input
                value={postalCode}
                onChange={(e) =>
                  setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                placeholder="CEP"
                disabled={busy}
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
              <input
                value={addressNumber}
                onChange={(e) => setAddressNumber(e.target.value)}
                placeholder="Número do endereço"
                disabled={busy}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail do titular"
                disabled={busy}
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handlePayCard}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : null}
                {busy ? "Processando..." : "Pagar com Cartão"}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="h-11 w-full text-sm font-semibold text-slate-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
