import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShineBorder } from "@/components/effects/ShineBorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileShell } from "../components/mobile/MobileShell";
import { AutoAnimateList } from "../components/motion/AutoAnimateList";
import { MotionEnter } from "../components/motion/MotionPrimitives";
import { BankCombobox } from "../components/BankCombobox";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { lookupCep, normalizeCep } from "../lib/cep";
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
    WITHDRAWN: asPro ? "Sacado para conta bancária" : "Concluído",
    FAILED: "Falhou",
    CANCELED: "Cancelado",
  };
  return labels[status] ?? status;
}

function displayAmount(tx: WalletTransaction, userId: string): number {
  return tx.professionalId === userId ? tx.professionalNet : tx.amountGross;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function WalletPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [papufyWithdrawable, setPapufyWithdrawable] = useState(0);
  const [maxWithdraw, setMaxWithdraw] = useState(0);
  const [waitingFunds, setWaitingFunds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<WalletTab>("pending");
  const [withdrawValue, setWithdrawValue] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [onboardingSaving, setOnboardingSaving] = useState(false);

  const [obCpf, setObCpf] = useState("");
  const [obPhone, setObPhone] = useState("");
  const [obBirth, setObBirth] = useState("");
  const [obOccupation, setObOccupation] = useState("Prestador de serviços");
  const [obBank, setObBank] = useState("");
  const [obBranch, setObBranch] = useState("");
  const [obBranchDigit, setObBranchDigit] = useState("");
  const [obAccount, setObAccount] = useState("");
  const [obAccountDigit, setObAccountDigit] = useState("");
  const [obAccountType, setObAccountType] = useState<"checking" | "savings">(
    "checking"
  );
  const [obStreet, setObStreet] = useState("");
  const [obNumber, setObNumber] = useState("");
  const [obNeighborhood, setObNeighborhood] = useState("");
  const [obCity, setObCity] = useState("");
  const [obState, setObState] = useState("");
  const [obZip, setObZip] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

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
        setAvailableBalance(balanceData.balance);
        setPapufyWithdrawable(balanceData.papufyWithdrawable);
        setMaxWithdraw(balanceData.maxWithdraw);
        setWaitingFunds(balanceData.waitingFunds ?? 0);
        setNeedsOnboarding(
          Boolean(balanceData.needsOnboarding) || !balanceData.walletId
        );
      } else {
        setAvailableBalance(null);
        setPapufyWithdrawable(0);
        setMaxWithdraw(0);
        setWaitingFunds(0);
        setNeedsOnboarding(true);
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
    if (!user) return;
    if (user.cpfCnpj) setObCpf(user.cpfCnpj);
    if (user.telefone) setObPhone(user.telefone);
    if (user.dataNascimento) {
      const raw = user.dataNascimento.slice(0, 10);
      const [y, m, d] = raw.split("-");
      if (y && m && d) setObBirth(`${d}/${m}/${y}`);
    }
    if (user.cidade) setObCity(user.cidade);
    if (user.uf) setObState(user.uf);
  }, [user]);

  const filtered = useMemo(() => {
    if (!user?.id) return [];
    return transactions.filter((tx) =>
      tab === "pending"
        ? isPendingForUser(tx, user.id)
        : isConfirmedForUser(tx, user.id)
    );
  }, [transactions, tab, user?.id]);

  const handleCepChange = async (value: string) => {
    const masked = value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d{0,3})/, (_m, p1, p2) => (p2 ? `${p1}-${p2}` : p1));
    setObZip(masked);

    const normalized = normalizeCep(masked);
    if (normalized.length !== 8) return;

    setCepLoading(true);
    try {
      const result = await lookupCep(normalized);
      if (!result) {
        showToast("CEP não encontrado. Preencha o endereço manualmente.", "info");
        return;
      }
      if (result.logradouro) setObStreet(result.logradouro);
      if (result.bairro) setObNeighborhood(result.bairro);
      if (result.cidade) setObCity(result.cidade);
      if (result.uf) setObState(result.uf);
    } catch {
      showToast("Não foi possível buscar o CEP. Tente novamente.", "error");
    } finally {
      setCepLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cpf = onlyDigits(obCpf);
    if (cpf.length !== 11 && cpf.length !== 14) {
      showToast("Informe um CPF ou CNPJ válido.", "error");
      return;
    }
    if (onlyDigits(obPhone).length < 10) {
      showToast("Informe telefone com DDD.", "error");
      return;
    }
    if (obBirth.trim().length < 8) {
      showToast("Informe a data de nascimento (DD/MM/AAAA).", "error");
      return;
    }
    if (!obBank.trim()) {
      showToast("Selecione o banco.", "error");
      return;
    }
    if (onlyDigits(obBranch).length < 1) {
      showToast("Informe a agência.", "error");
      return;
    }
    if (!obAccountDigit.trim() || onlyDigits(obAccount).length < 1) {
      showToast("Informe conta e dígito.", "error");
      return;
    }
    if (onlyDigits(obZip).length < 8) {
      showToast("Informe um CEP válido.", "error");
      return;
    }

    setOnboardingSaving(true);
    try {
      await api.payments.onboardAccount({
        name: user.nome,
        email: user.email,
        cpfCnpj: cpf,
        mobilePhone: onlyDigits(obPhone),
        dataNascimento: obBirth.trim(),
        professionalOccupation: obOccupation.trim() || "Prestador de serviços",
        bankAccount: {
          holderName: user.nome,
          holderType: cpf.length === 14 ? "company" : "individual",
          holderDocument: cpf,
          bank: onlyDigits(obBank),
          branchNumber: onlyDigits(obBranch),
          branchCheckDigit: obBranchDigit.trim() || undefined,
          accountNumber: onlyDigits(obAccount),
          accountCheckDigit: obAccountDigit.trim(),
          type: obAccountType,
        },
        recipientAddress: {
          street: obStreet.trim(),
          streetNumber: obNumber.trim(),
          neighborhood: obNeighborhood.trim(),
          city: obCity.trim(),
          state: obState.trim().toUpperCase().slice(0, 2),
          zipCode: onlyDigits(obZip),
        },
      });
      showToast("Conta bancária cadastrada com sucesso!", "success");
      await loadWallet();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar a conta bancária.",
        "error"
      );
    } finally {
      setOnboardingSaving(false);
    }
  };

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

    setWithdrawing(true);
    try {
      await api.payments.withdrawSubaccount({ value: amount });
      showToast("Saque solicitado! O valor será creditado na conta cadastrada.", "success");
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

  const balanceUnavailable = availableBalance === null && !loading && !needsOnboarding;
  const canWithdraw = !loading && !needsOnboarding && !balanceUnavailable && maxWithdraw >= 1;

  return (
    <MobileShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 pb-8">
        <MotionEnter>
          <header>
            <h1 className="text-xl font-bold text-slate-900">Carteira</h1>
            <p className="mt-1 text-sm text-slate-500">
              Conta bancária, saldo e saque
            </p>
          </header>
        </MotionEnter>

        <MotionEnter delay={40}>
          <ShineBorder borderRadius="1rem">
            <Card className="border-0 bg-gradient-to-br from-sky-50 to-blue-50 py-0 shadow-sm ring-0">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Saldo disponível
                </p>
                {loading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-sky-600">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
                    Consultando saldo…
                  </div>
                ) : needsOnboarding ? (
                  <p className="mt-2 text-sm text-sky-800">
                    Cadastre a conta bancária abaixo para ativar recebimentos e saques.
                  </p>
                ) : balanceUnavailable ? (
                  <p className="mt-2 text-sm text-sky-800">
                    Não foi possível consultar o saldo. Tente novamente em instantes.
                  </p>
                ) : (
                  <p className="mt-1 text-3xl font-black text-sky-700">
                    {formatPrice(availableBalance ?? 0, false)}
                  </p>
                )}
                <p className="mt-4 rounded-xl border border-sky-100 bg-white/80 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                  O saque envia o valor para a{" "}
                  <strong className="text-sky-800">conta bancária cadastrada</strong>.
                  Valores ficam disponíveis após a confirmação mútua do serviço.
                </p>

                {!loading && !needsOnboarding && (
                  <p className="mt-3 text-sm font-semibold text-sky-800">
                    Máximo para sacar agora: {formatPrice(maxWithdraw, false)}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white/70 px-3 py-2">
                    <p className="text-slate-500">Liberado para saque</p>
                    <p className="font-semibold text-slate-800">
                      {formatPrice(
                        needsOnboarding
                          ? summary?.availableBalance ?? 0
                          : papufyWithdrawable,
                        false
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 py-2">
                    <p className="text-slate-500">Em processamento</p>
                    <p className="font-semibold text-slate-800">
                      {formatPrice(waitingFunds, false)}
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
                </div>

                <Button
                  type="button"
                  variant="papufy"
                  size="cta"
                  disabled={loading || needsOnboarding || balanceUnavailable || !canWithdraw}
                  onClick={() => setShowWithdrawForm((v) => !v)}
                  className="mt-4 w-full"
                >
                  {showWithdrawForm ? "Fechar formulário de saque" : "Solicitar saque"}
                </Button>
                {!loading && !needsOnboarding && !canWithdraw && (
                  <p className="mt-2 text-center text-xs text-sky-700">
                    {papufyWithdrawable < 1
                      ? "Confirme a conclusão dos serviços no chat para liberar o saque."
                      : "Aguarde a liberação do saldo para sacar este valor."}
                  </p>
                )}
              </CardContent>
            </Card>
          </ShineBorder>
        </MotionEnter>

        {needsOnboarding && (
          <MotionEnter>
            <form onSubmit={handleOnboard}>
              <Card className="py-0 shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <h2 className="text-sm font-bold text-foreground">
                    Cadastre sua conta para receber
                  </h2>
                  <p className="text-xs text-slate-500">
                    Necessário para receber pagamentos e sacar. Use a conta
                    bancária do titular do CPF/CNPJ.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="ob-cpf">CPF/CNPJ</Label>
                      <Input
                        id="ob-cpf"
                        value={obCpf}
                        onChange={(e) => setObCpf(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-phone">Telefone</Label>
                      <Input
                        id="ob-phone"
                        value={obPhone}
                        onChange={(e) => setObPhone(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-birth">Nascimento (DD/MM/AAAA)</Label>
                      <Input
                        id="ob-birth"
                        placeholder="01/01/1990"
                        value={obBirth}
                        onChange={(e) => setObBirth(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-occ">Ocupação</Label>
                      <Input
                        id="ob-occ"
                        value={obOccupation}
                        onChange={(e) => setObOccupation(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <p className="pt-1 text-xs font-semibold text-slate-700">
                    Conta bancária
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="ob-bank">Banco</Label>
                      <BankCombobox
                        id="ob-bank"
                        value={obBank}
                        onChange={setObBank}
                        disabled={onboardingSaving}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-type">Tipo</Label>
                      <select
                        id="ob-type"
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={obAccountType}
                        onChange={(e) =>
                          setObAccountType(e.target.value as "checking" | "savings")
                        }
                        disabled={onboardingSaving}
                      >
                        <option value="checking">Corrente</option>
                        <option value="savings">Poupança</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="ob-branch">Agência</Label>
                      <Input
                        id="ob-branch"
                        value={obBranch}
                        onChange={(e) => setObBranch(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-branch-d">Dígito agência</Label>
                      <Input
                        id="ob-branch-d"
                        value={obBranchDigit}
                        onChange={(e) => setObBranchDigit(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-acc">Conta</Label>
                      <Input
                        id="ob-acc"
                        value={obAccount}
                        onChange={(e) => setObAccount(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-acc-d">Dígito conta</Label>
                      <Input
                        id="ob-acc-d"
                        value={obAccountDigit}
                        onChange={(e) => setObAccountDigit(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <p className="pt-1 text-xs font-semibold text-slate-700">
                    Endereço
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="ob-zip">CEP</Label>
                      <Input
                        id="ob-zip"
                        value={obZip}
                        onChange={(e) => void handleCepChange(e.target.value)}
                        disabled={onboardingSaving || cepLoading}
                        inputMode="numeric"
                        placeholder="00000-000"
                        className="mt-1"
                      />
                      {cepLoading && (
                        <p className="mt-1 text-xs text-slate-500">
                          Buscando endereço…
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="ob-uf">UF</Label>
                      <Input
                        id="ob-uf"
                        maxLength={2}
                        value={obState}
                        onChange={(e) => setObState(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="ob-street">Rua</Label>
                      <Input
                        id="ob-street"
                        value={obStreet}
                        onChange={(e) => setObStreet(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-num">Número</Label>
                      <Input
                        id="ob-num"
                        value={obNumber}
                        onChange={(e) => setObNumber(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ob-neigh">Bairro</Label>
                      <Input
                        id="ob-neigh"
                        value={obNeighborhood}
                        onChange={(e) => setObNeighborhood(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="ob-city">Cidade</Label>
                      <Input
                        id="ob-city"
                        value={obCity}
                        onChange={(e) => setObCity(e.target.value)}
                        disabled={onboardingSaving}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="papufy"
                    size="cta"
                    disabled={onboardingSaving}
                    className="w-full"
                  >
                    {onboardingSaving ? "Cadastrando…" : "Salvar conta bancária"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </MotionEnter>
        )}

        {showWithdrawForm && (
          <MotionEnter>
            <form onSubmit={handleSubaccountWithdraw}>
              <Card className="py-0 shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <h2 className="text-sm font-bold text-foreground">
                    Saque para conta bancária
                  </h2>
                  <p className="text-xs text-slate-500">
                    O valor será transferido para a conta cadastrada. Limite:{" "}
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
          </MotionEnter>
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
          <AutoAnimateList as="ul" className="space-y-3">
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
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </AutoAnimateList>
        )}
      </div>
    </MobileShell>
  );
}
