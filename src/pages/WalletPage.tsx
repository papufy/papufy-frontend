import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { FadeContent } from "@/components/effects/FadeContent";
import { ShineBorder } from "@/components/effects/ShineBorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
    RELEASED: asPro ? "Liberado no Papufy" : "Serviço em andamento / liberado",
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
  const [asaasBalance, setAsaasBalance] = useState<number | null>(null);
  const [asaasWalletId, setAsaasWalletId] = useState<string | null>(null);
  const [papufyWithdrawable, setPapufyWithdrawable] = useState(0);
  const [maxWithdraw, setMaxWithdraw] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<WalletTab>("pending");
  const [withdrawValue, setWithdrawValue] = useState("");
  const [pixAddressKey, setPixAddressKey] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  const loadWallet = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [listData, summaryData, balanceData] = await Promise.all([
        api.payments.listMine(),
        api.payments.wallet(),
        api.payments.balance().catch(() => null),
      ]);
      setTransactions(listData.transactions);
      setSummary(summaryData);
      if (balanceData) {
        setAsaasBalance(balanceData.balance);
        setAsaasWalletId(balanceData.walletId);
        setPapufyWithdrawable(balanceData.papufyWithdrawable);
        setMaxWithdraw(balanceData.maxWithdraw);
      } else {
        setAsaasBalance(null);
        setAsaasWalletId(null);
        setPapufyWithdrawable(0);
        setMaxWithdraw(0);
      }
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

  useEffect(() => {
    if (user?.telefone && !pixAddressKey) {
      const digits = user.telefone.replace(/\D/g, "");
      if (digits.length >= 10) setPixAddressKey(digits);
    }
  }, [user?.telefone, pixAddressKey]);

  const filtered = useMemo(() => {
    if (!user?.id) return [];
    return transactions.filter((tx) =>
      tab === "pending"
        ? isPendingForUser(tx, user.id)
        : isConfirmedForUser(tx, user.id)
    );
  }, [transactions, tab, user?.id]);

  const handleSubaccountWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawValue.replace(",", "."));
    if (!Number.isFinite(amount) || amount < 1) {
      showToast("Informe um valor válido (mínimo R$ 1,00).", "error");
      return;
    }
    if (amount > maxWithdraw + 0.009) {
      showToast(
        `Valor acima do permitido (${formatPrice(maxWithdraw, false)}).`,
        "error"
      );
      return;
    }
    if (!pixAddressKey.trim()) {
      showToast("Informe sua chave Pix de destino.", "error");
      return;
    }

    setWithdrawing(true);
    try {
      await api.payments.withdrawSubaccount({
        value: amount,
        pixAddressKey: pixAddressKey.trim(),
      });
      showToast("Saque Pix solicitado com sucesso!", "success");
      setWithdrawValue("");
      setShowWithdrawForm(false);
      await loadWallet();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível solicitar o saque.",
        "error"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const balanceUnavailable = asaasBalance === null && !loading;
  const canWithdraw = !loading && !balanceUnavailable && maxWithdraw >= 1;

  return (
    <MobileShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 pb-8">
        <header>
          <h1 className="text-xl font-bold text-slate-900">Carteira</h1>
          <p className="mt-1 text-sm text-slate-500">
            Saldo na subconta Asaas, saque Pix e histórico de pagamentos
          </p>
        </header>

        <FadeContent>
        <ShineBorder borderRadius="1rem">
        <Card className="border-0 bg-gradient-to-br from-sky-50 to-blue-50 py-0 shadow-sm ring-0">
          <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            Saldo disponível (subconta Asaas)
          </p>
          {loading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-sky-600">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
              Consultando saldo…
            </div>
          ) : balanceUnavailable ? (
            <p className="mt-2 text-sm text-sky-800">
              Não foi possível consultar a subconta. Verifique CPF e telefone no perfil e
              tente novamente.
            </p>
          ) : (
            <p className="mt-1 text-3xl font-black text-sky-700">
              {formatPrice(asaasBalance ?? 0, false)}
            </p>
          )}
          {asaasWalletId && (
            <p className="mt-2 truncate text-[10px] text-sky-600/80">
              Subconta: {asaasWalletId}
            </p>
          )}

          <p className="mt-4 rounded-xl border border-sky-100 bg-white/80 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
            O <strong className="text-sky-800">saldo Asaas</strong> é o dinheiro já
            creditado na sua subconta (após o cliente pagar). O{" "}
            <strong className="text-sky-800">liberado no Papufy</strong> só aumenta
            quando você e o cliente confirmam a conclusão do serviço. O saque usa o
            menor dos dois valores.
          </p>

          {!loading && !balanceUnavailable && (
            <p className="mt-3 text-sm font-semibold text-sky-800">
              Máximo para sacar agora: {formatPrice(maxWithdraw, false)}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <p className="text-slate-500">Liberado no Papufy</p>
              <p className="font-semibold text-slate-800">
                {formatPrice(
                  balanceUnavailable ? summary?.availableBalance ?? 0 : papufyWithdrawable,
                  false
                )}
              </p>
            </div>
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
              <div className="rounded-xl bg-white/70 px-3 py-2">
                <p className="text-slate-500">Você deve pagar</p>
                <p className="font-semibold text-slate-800">
                  {formatPrice(summary?.pendingPay ?? 0, false)}
                </p>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="papufy"
            size="cta"
            disabled={loading || balanceUnavailable || !canWithdraw}
            onClick={() => setShowWithdrawForm((v) => !v)}
            className="mt-4 w-full"
          >
            {showWithdrawForm ? "Fechar formulário de saque" : "Solicitar saque via Pix"}
          </Button>
          {!loading && !balanceUnavailable && !canWithdraw && (
            <p className="mt-2 text-center text-xs text-sky-700">
              {papufyWithdrawable < 1
                ? "Confirme a conclusão dos serviços no chat para liberar o saque."
                : "Saldo na subconta ainda insuficiente para o valor liberado no Papufy."}
            </p>
          )}
          </CardContent>
        </Card>
        </ShineBorder>
        </FadeContent>

        {showWithdrawForm && (
          <form onSubmit={handleSubaccountWithdraw}>
          <Card className="py-0 shadow-sm">
            <CardContent className="space-y-3 p-4">
            <h2 className="text-sm font-bold text-foreground">Saque da subconta</h2>
            <p className="text-xs text-slate-500">
              Chave Pix do mesmo CPF da subconta. Limite:{" "}
              {formatPrice(maxWithdraw, false)}.
            </p>
            <div>
              <Label htmlFor="wallet-withdraw-value">Valor (R$)</Label>
              <Input
                id="wallet-withdraw-value"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={withdrawValue}
                onChange={(e) => setWithdrawValue(e.target.value)}
                disabled={withdrawing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wallet-withdraw-pix">Chave Pix de destino</Label>
              <Input
                id="wallet-withdraw-pix"
                type="text"
                placeholder="CPF, e-mail, telefone ou aleatória"
                value={pixAddressKey}
                onChange={(e) => setPixAddressKey(e.target.value)}
                disabled={withdrawing}
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              variant="papufy"
              size="cta"
              disabled={withdrawing}
              className="w-full"
            >
              {withdrawing ? "Processando…" : "Confirmar saque"}
            </Button>
            </CardContent>
          </Card>
          </form>
        )}

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
          <div className="space-y-3 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum lançamento nesta aba.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((tx) => {
              const isPro = tx.professionalId === user.id;
              return (
                <li key={tx.id}>
                  <Card size="sm" className="py-0 shadow-sm">
                    <CardContent className="p-4">
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
                  {isPro && tx.status === "WITHDRAWN" && tx.withdrawPixKey && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      Chave Pix: {tx.withdrawPixKey}
                    </p>
                  )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </MobileShell>
  );
}
