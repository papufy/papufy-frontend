import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { MobileShell } from "../components/mobile/MobileShell";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Transaction, TransactionStatus } from "../types";
import { formatPrice } from "../utils/format";

type WalletTab = "pending" | "confirmed";

type WalletTransaction = Transaction & {
  listing?: { id: string; titulo: string };
  contractor?: { id: string; nome: string };
  professional?: { id: string; nome: string };
};

interface WalletSummary {
  availableBalance: number;
  pendingReceive: number;
  pendingPay: number;
  totalWithdrawn: number;
}

function isPendingForUser(tx: WalletTransaction, userId: string): boolean {
  if (tx.professionalId === userId) {
    return tx.status === "PENDING" || tx.status === "PAID" || tx.status === "IN_DISPUTE";
  }
  if (tx.contractorId === userId) {
    return tx.status === "PENDING";
  }
  return false;
}

function isConfirmedForUser(tx: WalletTransaction, userId: string): boolean {
  if (tx.professionalId === userId) {
    return tx.status === "RELEASED" || tx.status === "WITHDRAWN";
  }
  if (tx.contractorId === userId) {
    return (
      tx.status === "PAID" ||
      tx.status === "RELEASED" ||
      tx.status === "WITHDRAWN" ||
      tx.status === "IN_DISPUTE" ||
      tx.status === "FAILED" ||
      tx.status === "CANCELED"
    );
  }
  return false;
}

function statusLabel(status: TransactionStatus, userId: string, tx: WalletTransaction): string {
  const asPro = tx.professionalId === userId;
  const labels: Record<TransactionStatus, string> = {
    PENDING: asPro ? "Aguardando pagamento do cliente" : "Aguardando seu pagamento",
    PAID: asPro ? "Pago — confirme a conclusão do serviço" : "Pagamento confirmado",
    IN_DISPUTE: "Em mediação do suporte",
    RELEASED: asPro ? "Liberado para saque" : "Serviço em andamento / liberado",
    WITHDRAWN: asPro ? "Sacado via Pix" : "Concluído",
    FAILED: "Falhou",
    CANCELED: "Cancelado",
  };
  return labels[status] ?? status;
}

function displayAmount(tx: WalletTransaction, userId: string): number {
  return tx.professionalId === userId ? tx.professionalNet : tx.amountGross;
}

export function WalletPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<WalletTab>("pending");
  const [withdrawTxId, setWithdrawTxId] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const loadWallet = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [listData, summaryData] = await Promise.all([
        api.payments.listMine(),
        api.payments.wallet(),
      ]);
      setTransactions(listData.transactions);
      setSummary(summaryData);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível carregar a carteira.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  const filtered = useMemo(() => {
    if (!user?.id) return [];
    return transactions.filter((tx) =>
      tab === "pending"
        ? isPendingForUser(tx, user.id)
        : isConfirmedForUser(tx, user.id)
    );
  }, [transactions, tab, user?.id]);

  const handleWithdraw = async () => {
    if (!withdrawTxId || !pixKey.trim()) return;
    setWithdrawing(true);
    try {
      await api.payments.withdraw(withdrawTxId, pixKey.trim());
      showToast("Saque Pix solicitado com sucesso!", "success");
      setWithdrawTxId(null);
      setPixKey("");
      await loadWallet();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao sacar via Pix.",
        "error"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MobileShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 pb-8">
        <header>
          <h1 className="text-xl font-bold text-slate-900">Carteira</h1>
          <p className="mt-1 text-sm text-slate-500">
            Saldo, pagamentos pendentes e confirmados
          </p>
        </header>

        <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            Saldo disponível para saque
          </p>
          <p className="mt-1 text-3xl font-black text-sky-700">
            {formatPrice(summary?.availableBalance ?? 0, false)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <p className="text-slate-500">A receber (pendente)</p>
              <p className="font-semibold text-slate-800">
                {formatPrice(summary?.pendingReceive ?? 0, false)}
              </p>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <p className="text-slate-500">Já sacado</p>
              <p className="font-semibold text-slate-800">
                {formatPrice(summary?.totalWithdrawn ?? 0, false)}
              </p>
            </div>
            {(summary?.pendingPay ?? 0) > 0 && (
              <div className="col-span-2 rounded-xl bg-white/70 px-3 py-2">
                <p className="text-slate-500">Você deve pagar (pendente)</p>
                <p className="font-semibold text-slate-800">
                  {formatPrice(summary?.pendingPay ?? 0, false)}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              tab === "pending"
                ? "bg-white text-sky-700 shadow"
                : "text-slate-600"
            }`}
            onClick={() => setTab("pending")}
          >
            Pendentes
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              tab === "confirmed"
                ? "bg-white text-sky-700 shadow"
                : "text-slate-600"
            }`}
            onClick={() => setTab("confirmed")}
          >
            Confirmados
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-sky-600">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
            Carregando carteira...
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            Nenhum lançamento nesta aba.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((tx) => {
              const isPro = tx.professionalId === user.id;
              const canWithdraw = isPro && tx.status === "RELEASED";
              return (
                <li
                  key={tx.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {tx.listing?.titulo ?? "Serviço"}
                      </p>
                      <p className="mt-0.5 text-xs text-sky-600">
                        {isPro ? "Você recebe" : "Você pagou"}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {formatPrice(displayAmount(tx, user.id), false)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {statusLabel(tx.status, user.id, tx)}
                  </p>
                  {tx.paidAt && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      Pago em{" "}
                      {new Date(tx.paidAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                  {canWithdraw && (
                    <button
                      type="button"
                      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-60"
                      onClick={() => {
                        setWithdrawTxId(tx.id);
                        setPixKey(user.telefone?.replace(/\D/g, "") ?? "");
                      }}
                    >
                      Sacar via Pix
                    </button>
                  )}
                  {isPro && tx.status === "WITHDRAWN" && tx.withdrawPixKey && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      Chave Pix: {tx.withdrawPixKey}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {withdrawTxId && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-title"
          >
            <h2 id="withdraw-title" className="text-lg font-bold text-slate-900">
              Sacar via Pix
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Informe sua chave Pix (CPF, e-mail, telefone ou aleatória). O saque é
              processado pelo Asaas.
            </p>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Sua chave Pix"
              disabled={withdrawing}
              className="mt-4 w-full rounded-xl border border-sky-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 disabled:bg-slate-50"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={withdrawing}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 disabled:opacity-50"
                onClick={() => {
                  setWithdrawTxId(null);
                  setPixKey("");
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={withdrawing || !pixKey.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() => void handleWithdraw()}
              >
                {withdrawing ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : null}
                {withdrawing ? "Sacando..." : "Confirmar saque"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
