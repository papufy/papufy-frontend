import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import type { BillingType, Listing, Transaction } from "../../types";

interface PaymentCheckoutSheetProps {
  open: boolean;
  listing: Listing;
  onClose: () => void;
  onPaid: (transaction: Transaction) => void;
}

export function PaymentCheckoutSheet({
  open,
  listing,
  onClose,
  onPaid,
}: PaymentCheckoutSheetProps) {
  const [billingType, setBillingType] = useState<BillingType>("PIX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [pixImage, setPixImage] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState<string | null>(null);

  const canCheckout = useMemo(
    () => !listing.aCombinar && !!listing.preco && listing.preco > 0,
    [listing.aCombinar, listing.preco]
  );

  useEffect(() => {
    if (!open || !transaction) return;
    if (transaction.status === "PAID") {
      onPaid(transaction);
      return;
    }
    const timer = setInterval(async () => {
      try {
        const { transaction: fresh } = await api.payments.getTransactionStatus(
          transaction.id
        );
        setTransaction(fresh);
        if (fresh.status === "PAID") {
          clearInterval(timer);
          onPaid(fresh);
        }
      } catch {
        // mantém polling silencioso para UX mobile
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [open, transaction, onPaid]);

  const handleCheckout = async () => {
    if (!canCheckout) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.payments.checkout({
        listingId: listing.id,
        billingType,
      });
      setTransaction(result.transaction);
      setPixImage(result.pix?.encodedImage ?? null);
      setPixPayload(result.pix?.payload ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const copyPix = async () => {
    if (!pixPayload) return;
    try {
      await navigator.clipboard.writeText(pixPayload);
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Fechar checkout"
      />
      <div className="relative rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" />
        <h3 className="text-lg font-bold text-papufy-text">Checkout do serviço</h3>
        <p className="mt-1 text-sm text-papufy-muted">
          {listing.titulo} ·{" "}
          {listing.aCombinar ? "A combinar" : `R$ ${listing.preco?.toFixed(2)}`}
        </p>

        {!canCheckout && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Este serviço está com valor a combinar. Não há checkout disponível.
          </p>
        )}

        {!transaction && (
          <>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setBillingType("PIX")}
                className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold ${
                  billingType === "PIX"
                    ? "border-papufy-orange bg-papufy-tint text-papufy-orange"
                    : "border-papufy-border text-papufy-muted"
                }`}
              >
                Pix
              </button>
              <button
                type="button"
                onClick={() => setBillingType("CREDIT_CARD")}
                className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold ${
                  billingType === "CREDIT_CARD"
                    ? "border-papufy-orange bg-papufy-tint text-papufy-orange"
                    : "border-papufy-border text-papufy-muted"
                }`}
              >
                Cartão
              </button>
            </div>

            {billingType === "CREDIT_CARD" && (
              <p className="mt-3 text-xs text-papufy-muted">
                Cartão disponível no backend. Neste fluxo mobile, recomendamos Pix
                para aprovação imediata.
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={!canCheckout || loading}
              className="mt-4 h-12 w-full rounded-xl bg-papufy-orange text-sm font-bold text-white disabled:opacity-50"
            >
              {loading ? "Gerando cobrança..." : "Continuar para pagamento"}
            </button>
          </>
        )}

        {transaction && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-papufy-border p-3">
              <p className="text-xs font-semibold uppercase text-papufy-muted">
                Status
              </p>
              <p className="mt-1 text-sm font-bold text-papufy-text">
                {transaction.status === "PAID"
                  ? "Pagamento confirmado"
                  : "Aguardando pagamento"}
              </p>
            </div>

            {pixImage && (
              <div className="rounded-xl border border-papufy-border p-3">
                <img
                  src={`data:image/png;base64,${pixImage}`}
                  alt="QR Code Pix"
                  className="mx-auto h-48 w-48"
                />
                <button
                  type="button"
                  onClick={copyPix}
                  className="mt-3 h-10 w-full rounded-lg border border-papufy-border text-sm font-semibold text-papufy-text"
                >
                  Copiar código Pix
                </button>
              </div>
            )}

            {transaction.invoiceUrl && (
              <a
                href={transaction.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-sm font-semibold text-papufy-orange underline"
              >
                Abrir link de pagamento
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

