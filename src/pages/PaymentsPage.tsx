import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "../components/mobile/MobileShell";
import { api } from "../lib/api";
import { formatPrice } from "../utils/format";

type Filter = "pending" | "confirmed";

export function PaymentsPage() {
  const [items, setItems] = useState<
    Array<{
      id: string;
      status: string;
      amount: number;
      listingTitle: string;
      roleLabel: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api.payments.listMine();
        if (cancelled) return;
        setItems(
          data.transactions.map((tx) => ({
            id: tx.id,
            status: tx.status,
            amount: tx.professionalNet ?? tx.amountGross,
            listingTitle: tx.listing?.titulo ?? "Serviço",
            roleLabel: tx.professional?.id === tx.professionalId ? "Profissional" : "Cliente",
          }))
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((tx) =>
        filter === "pending"
          ? ["PENDING", "PAID", "IN_DISPUTE", "RELEASED"].includes(tx.status)
          : ["WITHDRAWN", "CANCELED", "FAILED"].includes(tx.status)
      ),
    [items, filter]
  );

  const handleWithdraw = async (id: string) => {
    const pixKey = window.prompt("Informe sua chave Pix para saque");
    if (!pixKey) return;
    await api.payments.withdraw(id, pixKey);
    const data = await api.payments.listMine();
    setItems(
      data.transactions.map((tx) => ({
        id: tx.id,
        status: tx.status,
        amount: tx.professionalNet ?? tx.amountGross,
        listingTitle: tx.listing?.titulo ?? "Serviço",
        roleLabel: tx.professional?.id === tx.professionalId ? "Profissional" : "Cliente",
      }))
    );
  };

  return (
    <MobileShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Pagamentos</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm ${filter === "pending" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setFilter("pending")}
          >
            Pendentes
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm ${filter === "confirmed" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setFilter("confirmed")}
          >
            Confirmados
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Carregando pagamentos...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum pagamento nesta aba.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => (
              <div key={tx.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">{tx.listingTitle}</p>
                <p className="text-sm text-slate-600">{formatPrice(tx.amount, false)}</p>
                <p className="text-xs text-slate-500">Status: {tx.status}</p>
                {tx.status === "RELEASED" && (
                  <button
                    type="button"
                    className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                    onClick={() => void handleWithdraw(tx.id)}
                  >
                    Sacar via Pix
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
