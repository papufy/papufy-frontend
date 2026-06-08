import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SafeText } from "../components/SafeText";
import { TransactionReviewPanel } from "../components/chat/TransactionReviewPanel";
import { PaymentCheckoutSheet } from "../components/mobile/PaymentCheckoutSheet";
import { IconChevronLeft, IconPaperclip } from "../components/icons/NavIcons";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import {
  CONTACT_VIOLATION_MESSAGE,
  containsRestrictedContent,
} from "../lib/contactPolicy";
import type { ChatMessage, Transaction, TransactionReview } from "../types";

function formatPaymentError(err: unknown): string {
  const e = err as Error & {
    code?: string;
    role?: "payer" | "receiver";
    missingFields?: string[];
  };
  if (e.code === "PAYMENT_PROFILE_INCOMPLETE") {
    if (e.role === "receiver") {
      return "O profissional precisa cadastrar CPF e telefone no perfil para receber pagamentos.";
    }
    if (e.missingFields?.includes("cpfCnpj")) {
      return "Informe seu CPF ou CNPJ para concluir o pagamento.";
    }
    return e.message || "Complete seus dados de pagamento no checkout.";
  }
  return e instanceof Error ? e.message : "Erro ao processar pagamento.";
}

export function ChatPage() {
  const { id: activeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    unreadCount,
    connected,
    conversations,
    conversationsLoading,
    joinConversation,
    sendMessage,
    onMessage,
    refreshConversations,
    refreshUnread,
  } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [policyWarning, setPolicyWarning] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const loadingList = conversationsLoading && conversations.length === 0;
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [proposalValue, setProposalValue] = useState("");
  const [proposalReceiverPhone, setProposalReceiverPhone] = useState("");
  const needsPayerCpf = useMemo(() => {
    const doc = user?.cpfCnpj?.replace(/\D/g, "") ?? "";
    return doc.length < 11;
  }, [user?.cpfCnpj]);
  const needsReceiverPhone = useMemo(() => {
    const phone = user?.telefone?.replace(/\D/g, "") ?? "";
    return phone.length < 10;
  }, [user?.telefone]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<ChatMessage | null>(null);
  const [checkoutTransaction, setCheckoutTransaction] = useState<Transaction | null>(
    null
  );
  const [checkoutPixPayload, setCheckoutPixPayload] = useState("");
  const [checkoutPixImage, setCheckoutPixImage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportSending, setReportSending] = useState(false);
  const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
  const [transactionsById, setTransactionsById] = useState<
    Record<string, Transaction>
  >({});
  const [reviewsByTxId, setReviewsByTxId] = useState<
    Record<string, TransactionReview | null>
  >({});
  const [submittingReviewTxId, setSubmittingReviewTxId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const draftHasContactLeak = useMemo(
    () => draft.trim().length > 0 && containsRestrictedContent(draft),
    [draft]
  );

  const loadReviewsForTransactions = useCallback(
    async (txMap: Record<string, Transaction>) => {
      if (!user?.id) return;
      const pending = Object.entries(txMap).filter(
        ([, tx]) =>
          (tx.status === "RELEASED" || tx.status === "WITHDRAWN") &&
          tx.contractorId === user.id
      );
      if (!pending.length) return;

      const fetched = await Promise.all(
        pending.map(async ([id]) => {
          try {
            const { review } = await api.user.getReviewByTransaction(id);
            return [id, review] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );
      setReviewsByTxId((prev) => ({
        ...prev,
        ...Object.fromEntries(fetched),
      }));
    },
    [user?.id]
  );

  const loadConversations = useCallback(async () => {
    setError(null);
    try {
      await refreshConversations({ force: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar chat.");
    }
  }, [refreshConversations]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoadingMessages(true);
      try {
        const { messages: list } = await api.chat.messages(conversationId);
        setMessages(list);
        const txIds = Array.from(
          new Set(
            list
              .map((m) => m.transactionId)
              .filter((id): id is string => Boolean(id))
          )
        );
        if (txIds.length > 0) {
          const fetched = await Promise.all(
            txIds.map(async (id) => {
              const { transaction } = await api.payments.transactionStatus(id);
              return [id, transaction] as const;
            })
          );
          const txMap = {
            ...Object.fromEntries(fetched),
          };
          setTransactionsById((prev) => ({
            ...prev,
            ...txMap,
          }));
          await loadReviewsForTransactions(txMap);
        }
        joinConversation(conversationId);
        await refreshUnread();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar mensagens."
        );
      } finally {
        setLoadingMessages(false);
      }
    },
    [joinConversation, loadReviewsForTransactions, refreshUnread]
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeId) {
      void loadMessages(activeId);
    } else {
      setMessages([]);
    }
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (!activeId) return;
    const id = window.setInterval(() => {
      void loadMessages(activeId);
    }, 8000);
    return () => window.clearInterval(id);
  }, [activeId, loadMessages]);

  useEffect(() => {
    return onMessage((msg) => {
      if (!activeId || msg.conversationId !== activeId) {
        void loadConversations();
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const isMine = user?.id ? msg.senderId === user.id : msg.isMine;
        return [...prev, { ...msg, isMine }];
      });
      void loadConversations();
    });
  }, [activeId, onMessage, loadConversations, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!checkoutTransaction?.id || checkoutTransaction.status !== "PENDING") return;
    const id = window.setInterval(async () => {
      try {
        const { transaction } = await api.payments.transactionStatus(
          checkoutTransaction.id
        );
        setCheckoutTransaction(transaction);
        if (transaction.status === "PAID") {
          await loadMessages(activeId ?? "");
          await loadConversations();
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);
    return () => window.clearInterval(id);
  }, [
    checkoutTransaction?.id,
    checkoutTransaction?.status,
    activeId,
    loadMessages,
    loadConversations,
  ]);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (value.trim() && containsRestrictedContent(value)) {
      setPolicyWarning(CONTACT_VIOLATION_MESSAGE);
    } else {
      setPolicyWarning(null);
    }
  };

  const handleImagePick = async (file: File | undefined) => {
    if (!activeId || !file) return;
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setError("Use imagens JPEG ou PNG (até 5 MB).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setUploadingImage(true);
    setError(null);
    try {
      const { message } = await api.chat.sendImage(activeId, file);
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      void loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;

    if (containsRestrictedContent(draft)) {
      setPolicyWarning(CONTACT_VIOLATION_MESSAGE);
      return;
    }

    const content = draft.trim();
    setDraft("");
    setPolicyWarning(null);

    if (connected) {
      sendMessage(activeId, content);
      return;
    }

    try {
      const { message } = await api.chat.send(activeId, content);
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar.";
      setError(msg);
      if (
        msg.toLowerCase().includes("telefone") ||
        msg.toLowerCase().includes("endereço") ||
        msg.toLowerCase().includes("redes sociais")
      ) {
        setPolicyWarning(msg);
      }
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);
  const showListOnMobile = !activeId;
  const canSendProposal =
    !!activeConversation &&
    activeConversation.contextType === "listing" &&
    activeConversation.myRole === "provider" &&
    activeConversation.listingType === "JOB_VACANCY";

  const canReportProblem = useMemo(() => {
    if (!activeConversation || activeConversation.myRole !== "provider") return false;
    return messages.some(
      (m) =>
        m.type === "PROPOSAL" &&
        m.transactionId &&
        (transactionsById[m.transactionId]?.status === "PAID" ||
          checkoutTransaction?.status === "PAID")
    );
  }, [
    activeConversation,
    messages,
    checkoutTransaction?.status,
    transactionsById,
  ]);

  const submitProposal = async () => {
    if (!activeId) return;
    const value = Number(proposalValue);
    if (!value || value <= 0) return;
    setSendingProposal(true);
    try {
      const receiverProfile =
        needsReceiverPhone && proposalReceiverPhone.trim()
          ? { telefone: proposalReceiverPhone.replace(/\D/g, "") }
          : undefined;
      const { message } = await api.chat.sendProposal(
        activeId,
        value,
        receiverProfile
      );
      setMessages((prev) => [...prev, message]);
      setProposalModalOpen(false);
      setProposalValue("");
      await loadConversations();
    } catch (err) {
      const e = err as Error & { missingFields?: string[] };
      const msg =
        e.missingFields?.includes("telefone")
          ? "Informe seu telefone para receber pagamentos."
          : e instanceof Error
            ? e.message
            : "Erro ao enviar proposta.";
      setError(msg);
    } finally {
      setSendingProposal(false);
    }
  };

  const openCheckout = async (message: ChatMessage) => {
    if (!message.id) return;
    setCheckoutOpen(true);
    setCheckoutMessage(message);
    setCheckoutError(null);
    setCheckoutPixPayload("");
    setCheckoutPixImage(null);
    setCheckoutTransaction(null);

    if (message.transactionId) {
      try {
        const { transaction } = await api.payments.transactionStatus(
          message.transactionId
        );
        setCheckoutTransaction(transaction);
        if (transaction.status === "PENDING") {
          const hasPix =
            Boolean(transaction.pixCopyPaste?.trim()) ||
            Boolean(transaction.pixQrCodeImage?.trim());
          if (hasPix) {
            setCheckoutPixPayload(transaction.pixCopyPaste ?? "");
            setCheckoutPixImage(transaction.pixQrCodeImage ?? null);
          } else {
            setCheckoutLoading(true);
            try {
              const result = await api.payments.checkoutFromProposal(
                message.id,
                { billingType: "PIX" }
              );
              setCheckoutTransaction(result.transaction);
              setCheckoutPixPayload(result.pix.payload ?? "");
              setCheckoutPixImage(result.pix.encodedImage ?? null);
            } finally {
              setCheckoutLoading(false);
            }
          }
        }
      } catch (err) {
        setCheckoutError(formatPaymentError(err));
      }
    }
  };

  const generatePixCheckout = async (payerProfile?: {
    cpfCnpj: string;
    telefone?: string;
  }) => {
    if (!checkoutMessage?.id) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const result = await api.payments.checkoutFromProposal(checkoutMessage.id, {
        billingType: "PIX",
        ...(payerProfile ? { payerProfile } : {}),
      });
      setCheckoutTransaction(result.transaction);
      setCheckoutPixPayload(result.pix.payload ?? "");
      setCheckoutPixImage(result.pix.encodedImage ?? null);
      await loadMessages(activeId ?? "");
      await loadConversations();
    } catch (err) {
      const msg = formatPaymentError(err);
      setCheckoutError(msg);
      setError(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const payWithCard = async (
    card: {
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
    },
    payerProfile?: { cpfCnpj: string; telefone?: string }
  ) => {
    if (!checkoutMessage?.id) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const result = await api.payments.checkoutFromProposal(checkoutMessage.id, {
        billingType: "CREDIT_CARD",
        ...(payerProfile ? { payerProfile } : {}),
        creditCard: {
          holderName: card.holderName.trim(),
          number: card.cardNumber.replace(/\D/g, ""),
          expiryMonth: card.expiryMonth.replace(/\D/g, "").padStart(2, "0"),
          expiryYear: card.expiryYear.replace(/\D/g, ""),
          ccv: card.ccv.replace(/\D/g, ""),
        },
        creditCardHolderInfo: {
          name: card.holderName.trim(),
          email: card.email.trim(),
          cpfCnpj: card.cpfCnpj.replace(/\D/g, ""),
          postalCode: card.postalCode.replace(/\D/g, ""),
          addressNumber: card.addressNumber.trim(),
          phone: card.phone.replace(/\D/g, ""),
        },
      });
      setCheckoutTransaction(result.transaction);
      await loadMessages(activeId ?? "");
      await loadConversations();
    } catch (err) {
      const msg = formatPaymentError(err);
      setCheckoutError(msg);
      setError(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const confirmCompletion = async (transactionId: string) => {
    setConfirmingTxId(transactionId);
    try {
      const { transaction } = await api.payments.confirmCompletion(transactionId);
      setTransactionsById((prev) => ({ ...prev, [transactionId]: transaction }));
      if (checkoutTransaction?.id === transactionId) {
        setCheckoutTransaction(transaction);
      }
      if (
        transaction.status === "RELEASED" ||
        transaction.status === "WITHDRAWN"
      ) {
        await loadReviewsForTransactions({ [transactionId]: transaction });
      }
      await loadMessages(activeId ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar serviço.");
    } finally {
      setConfirmingTxId(null);
    }
  };

  const submitReview = async (
    transactionId: string,
    input: { rating: number; comment?: string }
  ) => {
    setSubmittingReviewTxId(transactionId);
    setError(null);
    try {
      const { review, listingArchived } = await api.user.createReview({
        transactionId,
        rating: input.rating,
        comment: input.comment,
      });
      setReviewsByTxId((prev) => ({ ...prev, [transactionId]: review }));
      if (listingArchived) {
        showToast(
          "Avaliação enviada! O anúncio foi encerrado e removido da vitrine.",
          "success"
        );
      } else {
        showToast("Avaliação enviada com sucesso!", "success");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar a avaliação."
      );
    } finally {
      setSubmittingReviewTxId(null);
    }
  };

  const submitReport = async () => {
    if (!checkoutTransaction?.id || !reportDescription.trim()) return;
    setReportSending(true);
    try {
      await api.payments.reportProblem(
        checkoutTransaction.id,
        reportDescription,
        reportFile ?? undefined
      );
      setReportOpen(false);
      setReportDescription("");
      setReportFile(null);
      await loadMessages(activeId ?? "");
      const { transaction } = await api.payments.transactionStatus(
        checkoutTransaction.id
      );
      setCheckoutTransaction(transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao abrir disputa.");
    } finally {
      setReportSending(false);
    }
  };

  return (
    <Layout showCategories={false}>
      <div className="page-container flex min-h-[calc(100dvh-8rem)] flex-col py-3 sm:py-4 lg:min-h-[calc(100vh-180px)] lg:flex-row lg:gap-4 lg:py-6">
        <aside
          className={`flex w-full flex-col rounded-2xl border border-papufy-border bg-white lg:max-h-[calc(100vh-12rem)] lg:w-80 ${
            showListOnMobile ? "min-h-[50dvh] flex-1" : "hidden lg:flex"
          }`}
        >
          <div className="border-b border-papufy-border px-4 py-3">
            <h1 className="font-bold text-papufy-text">Mensagens</h1>
            <p className="text-xs text-papufy-muted">
              Conversas dos seus trabalhos
              {connected ? " · online" : " · reconectando..."}
              {unreadCount > 0 && (
                <span className="ml-2 font-semibold text-sky-600">
                  · {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loadingList && (
              <p className="p-4 text-sm text-papufy-muted">Carregando...</p>
            )}
            {error && !loadingList && (
              <p className="p-4 text-sm text-red-600">{error}</p>
            )}
            {!loadingList &&
              conversations.map((c) => (
                <Link
                  key={c.id}
                  to={`/chat/${c.id}`}
                  className={`touch-target block border-b border-papufy-border px-4 py-4 transition active:bg-sky-50 lg:py-3 lg:hover:bg-sky-50 ${
                    activeId === c.id ? "bg-sky-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-bold text-papufy-text">
                      {c.otherUser.nome}
                    </p>
                    {c.unread > 0 && (
                      <span className="shrink-0 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-1 text-xs text-papufy-muted">
                    {c.contextTitulo}
                  </p>
                  {c.lastMessage && (
                    <p className="mt-1 line-clamp-1 text-xs text-papufy-muted">
                      {c.lastMessage.isMine ? "Você: " : ""}
                      <SafeText as="span">{c.lastMessage.content}</SafeText>
                    </p>
                  )}
                </Link>
              ))}
            {!loadingList && conversations.length === 0 && (
              <div className="p-4 text-sm text-papufy-muted">
                <p className="font-medium text-papufy-text">
                  Nenhuma conversa ainda
                </p>
                <p className="mt-2">
                  Abra um trabalho e toque em <strong>Chat</strong> para iniciar.
                </p>
                <Link
                  to="/"
                  className="mt-4 inline-block font-semibold text-sky-600 hover:underline"
                >
                  Ver trabalhos
                </Link>
              </div>
            )}
          </div>
        </aside>

        <section
          className={`flex min-h-0 flex-1 flex-col rounded-2xl border border-papufy-border bg-white ${
            activeId ? "min-h-[calc(100dvh-10rem)] flex-1" : "hidden lg:flex lg:min-h-[320px]"
          }`}
        >
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-papufy-muted">
              <p>Selecione uma conversa para continuar.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-papufy-border px-3 py-3 sm:px-4">
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  className="touch-target -ml-1 rounded-full p-2 text-papufy-muted hover:bg-gray-50 lg:hidden"
                  aria-label="Voltar às conversas"
                >
                  <IconChevronLeft />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-papufy-text">
                    {activeConversation?.otherUser.nome ?? "Conversa"}
                  </p>
                  <p className="truncate text-xs text-papufy-muted">
                    {activeConversation?.contextTitulo}
                  </p>
                </div>
                {canSendProposal && (
                  <button
                    type="button"
                    onClick={() => setProposalModalOpen(true)}
                    className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition active:scale-95"
                  >
                    Enviar Proposta
                  </button>
                )}
                {canReportProblem && (
                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition active:scale-95"
                  >
                    Reportar Problema
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
                {loadingMessages && (
                  <p className="text-sm text-papufy-muted">Carregando mensagens...</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}
                  >
                    {m.type === "PROPOSAL" ? (
                      <div className="w-full max-w-xs rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-slate-800 shadow-sm">
                        <p className="text-xs font-semibold text-sky-700">
                          Proposta de valor
                        </p>
                        <p className="mt-1 text-2xl font-black text-sky-700">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 2,
                          }).format(m.proposalValue ?? 0)}
                        </p>
                        {activeConversation?.myRole === "contractor" &&
                          activeConversation?.contextType === "listing" &&
                          (!m.transactionId ||
                            transactionsById[m.transactionId]?.status ===
                              "PENDING") && (
                          <button
                            type="button"
                            onClick={() => void openCheckout(m)}
                            className="mt-3 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-transform active:scale-95"
                          >
                            {m.transactionId
                              ? "Continuar pagamento Pix"
                              : "Aceitar e Pagar Seguro"}
                          </button>
                        )}
                        {m.transactionId && (
                          <>
                            <p className="mt-2 text-xs font-semibold text-sky-700">
                              {(m.transactionId &&
                                transactionsById[m.transactionId]?.status === "PAID") ||
                              checkoutTransaction?.status === "PAID"
                                ? "Pagamento Confirmado — Serviço em Andamento"
                                : m.transactionId &&
                                    transactionsById[m.transactionId]?.status ===
                                      "IN_DISPUTE"
                                  ? "Pagamento em mediação pelo suporte"
                                  : m.transactionId &&
                                      transactionsById[m.transactionId]?.status ===
                                        "RELEASED"
                                    ? "Serviço concluído e pagamento liberado"
                                    : "Proposta vinculada ao pagamento"}
                            </p>
                            {m.transactionId &&
                              transactionsById[m.transactionId]?.status === "PAID" && (
                                <button
                                  type="button"
                                  onClick={() => void confirmCompletion(m.transactionId!)}
                                  disabled={confirmingTxId === m.transactionId}
                                  className="mt-2 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 disabled:opacity-60"
                                >
                                  {confirmingTxId === m.transactionId
                                    ? "Confirmando..."
                                    : "Confirmar serviço concluído"}
                                </button>
                              )}
                            {m.transactionId &&
                              activeConversation?.myRole === "contractor" &&
                              (transactionsById[m.transactionId]?.status ===
                                "RELEASED" ||
                                transactionsById[m.transactionId]?.status ===
                                  "WITHDRAWN") && (
                                <TransactionReviewPanel
                                  transactionId={m.transactionId}
                                  existingReview={reviewsByTxId[m.transactionId]}
                                  professionalName={activeConversation.otherUser.nome}
                                  submitting={submittingReviewTxId === m.transactionId}
                                  onSubmit={(input) =>
                                    submitReview(m.transactionId!, input)
                                  }
                                />
                              )}
                          </>
                        )}
                      </div>
                    ) : m.type === "IMAGE" && m.imageUrl ? (
                      <div
                        className={`max-w-[85%] overflow-hidden rounded-2xl sm:max-w-[80%] ${
                          m.isMine ? "bg-sky-500 p-1" : "bg-gray-100 p-1"
                        }`}
                      >
                        {!m.isMine && (
                          <p className="px-2 pb-1 pt-1 text-xs font-semibold text-papufy-text">
                            {m.senderNome}
                          </p>
                        )}
                        <a
                          href={m.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          <img
                            src={m.imageUrl}
                            alt="Imagem enviada no chat"
                            className="max-h-64 w-full rounded-xl object-cover"
                            loading="lazy"
                          />
                        </a>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[80%] ${
                          m.type === "SYSTEM"
                            ? "border border-sky-100 bg-sky-50 text-sky-700"
                            : m.isMine
                              ? "bg-sky-500 text-white"
                              : "bg-gray-100 text-papufy-text"
                        }`}
                      >
                        {!m.isMine && m.type !== "SYSTEM" && (
                          <p className="mb-1 text-xs font-semibold opacity-70">
                            {m.senderNome}
                          </p>
                        )}
                        <SafeText as="span">{m.content}</SafeText>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {policyWarning && (
                <div
                  role="alert"
                  className="mx-3 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900"
                >
                  {policyWarning}
                </div>
              )}

              <form
                onSubmit={handleSend}
                className="flex flex-col gap-2 border-t border-papufy-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) => void handleImagePick(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                    className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-200 text-sky-600 transition hover:bg-sky-50 disabled:opacity-50"
                    aria-label="Enviar imagem"
                    title="Enviar imagem"
                  >
                    {uploadingImage ? (
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
                    ) : (
                      <IconPaperclip className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    value={draft}
                    onChange={(e) => handleDraftChange(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    aria-invalid={draftHasContactLeak}
                    disabled={uploadingImage}
                    className={`input-field min-h-11 flex-1 rounded-xl border py-3 text-base outline-none sm:text-sm ${
                      draftHasContactLeak
                        ? "border-amber-400 focus:border-amber-500 focus:ring-amber-200"
                        : "border-papufy-border focus:border-sky-400"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || draftHasContactLeak || uploadingImage}
                    className="touch-target shrink-0 rounded-xl bg-sky-500 px-4 text-sm font-bold text-white disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
      <PaymentCheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title={checkoutLoading ? "Processando pagamento..." : "Pagamento Seguro"}
        amountLabel={
          checkoutMessage?.proposalValue
            ? new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(checkoutMessage.proposalValue)
            : "R$ 0,00"
        }
        pixCopyPaste={checkoutPixPayload}
        pixQrCodeImage={checkoutPixImage}
        loading={checkoutLoading}
        errorMessage={checkoutError}
        needsPayerCpf={needsPayerCpf}
        onGeneratePix={(payer) => void generatePixCheckout(payer)}
        onPayCard={(card, payer) => void payWithCard(card, payer)}
        statusLabel={
          checkoutTransaction?.status === "PAID"
            ? "Pagamento Confirmado — Serviço em Andamento"
            : checkoutTransaction?.status === "RELEASED"
              ? "Serviço concluído — valor liberado para saque"
            : checkoutTransaction?.status === "IN_DISPUTE"
              ? "Em mediação do suporte"
              : undefined
        }
      />
      {proposalModalOpen && (
        <div className="fixed inset-0 z-[90] bg-black/40 p-4">
          <div className="mx-auto mt-24 w-full max-w-sm rounded-2xl border border-sky-100 bg-white p-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Enviar Proposta</h3>
            <p className="mt-1 text-xs text-slate-500">
              Informe o valor fixo combinado para este serviço.
            </p>
            <input
              type="number"
              min={1}
              value={proposalValue}
              onChange={(e) => setProposalValue(e.target.value)}
              className="mt-3 w-full rounded-xl border border-sky-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
              placeholder="Ex: 180"
            />
            {needsReceiverPhone && (
              <>
                <p className="mt-3 text-xs text-sky-700">
                  Primeiro recebimento: informe seu telefone para ativar sua conta
                  de pagamento.
                </p>
                <input
                  type="tel"
                  value={proposalReceiverPhone}
                  onChange={(e) => setProposalReceiverPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-sky-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
                  placeholder="Telefone com DDD"
                />
              </>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setProposalModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  !proposalValue ||
                  sendingProposal ||
                  (needsReceiverPhone && proposalReceiverPhone.replace(/\D/g, "").length < 10)
                }
                onClick={() => void submitProposal()}
                className="flex-1 rounded-xl bg-sky-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {sendingProposal ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {reportOpen && (
        <div className="fixed inset-0 z-[95] flex flex-col justify-end bg-black/40">
          <div className="rounded-t-3xl border border-sky-100 bg-white p-4 pb-6 shadow-xl">
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-200" />
            <h3 className="text-base font-bold text-slate-900">Reportar Problema</h3>
            <p className="mt-2 rounded-xl border border-sky-200 bg-sky-50/40 px-3 py-2 text-xs text-sky-800">
              Para agilizar a análise do suporte, é altamente recomendado que você
              envie uma foto do serviço concluído como prova do seu trabalho.
            </p>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-xl border border-sky-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
              placeholder="Descreva o problema com detalhes..."
            />
            <label className="mt-3 block rounded-xl border border-dashed border-sky-200 bg-sky-50/30 px-3 py-4 text-center text-xs font-semibold text-sky-700">
              {reportFile ? reportFile.name : "Anexar foto (câmera ou galeria)"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={reportSending || reportDescription.trim().length < 10}
                onClick={() => void submitReport()}
                className="flex-1 rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {reportSending ? "Enviando..." : "Enviar para o Suporte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
