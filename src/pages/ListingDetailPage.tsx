import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListingImageGallery } from "../components/ListingImageGallery";
import { ListingSellerCard } from "../components/ListingSellerCard";
import { SafeText } from "../components/SafeText";
import { MobileShell } from "../components/mobile/MobileShell";
import {
  PaymentCheckoutSheet,
  type PayerProfilePayload,
} from "../components/mobile/PaymentCheckoutSheet";
import { StatusBadge } from "../components/StatusBadge";
import { AnimatedLordIcon, useLordPlay } from "../components/icons/AnimatedLordIcon";
import { MotionPressButton } from "../components/motion/MotionPrimitives";
import { BRAZIL_STATES } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Listing } from "../types";
import { digitsOnly } from "../utils/masks";
import {
  formatLocation,
  formatListingPrice,
  formatListingValidity,
  formatRelativeTime,
} from "../utils/format";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";


export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editCidade, setEditCidade] = useState("");
  const [editBairro, setEditBairro] = useState("");
  const [editUf, setEditUf] = useState("PB");
  const [editTelefone, setEditTelefone] = useState("");
  const [editSemQualificacao, setEditSemQualificacao] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewalId, setRenewalId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState("");
  const [pixImage, setPixImage] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string | undefined>();
  const { playToken: chatPlay, trigger: triggerChat } = useLordPlay();
  const needsPayerCpf = useMemo(() => {
    const doc = user?.cpfCnpj?.replace(/\D/g, "") ?? "";
    return doc.length < 11;
  }, [user?.cpfCnpj]);

  const loadListing = async (listingId: string) => {
    const { listing: data } = await api.listings.getById(listingId);
    setListing(data);
    return data;
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadListing(id)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Anúncio não encontrado.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const startEditing = (item: Listing) => {
    setEditTitulo(item.titulo);
    setEditDescricao(item.descricao);
    setEditPreco(item.preco != null ? String(item.preco) : "");
    setEditCidade(item.cidade);
    setEditBairro(item.bairro ?? "");
    setEditUf(item.uf);
    setEditTelefone(item.telefone ?? "");
    setEditSemQualificacao(item.semQualificacao ?? false);
    setEditError(null);
    setEditing(true);
  };

  useEffect(() => {
    if (!listing || !user || searchParams.get("edit") !== "1") return;
    if (listing.userId !== user.id) return;
    startEditing(listing);
    setSearchParams({}, { replace: true });
  }, [listing, user, searchParams, setSearchParams]);

  const cancelEditing = () => {
    setEditing(false);
    setEditError(null);
  };

  const getEditIssues = () => {
    const issues: string[] = [];
    if (editTitulo.trim().length < 5) issues.push("Título (mínimo 5 caracteres)");
    if (editDescricao.trim().length < 20) {
      issues.push("Descrição (mínimo 20 caracteres)");
    }
    if (editCidade.trim().length < 2) issues.push("Cidade");
    if (digitsOnly(editTelefone).length < 10) {
      issues.push("Telefone com DDD");
    }
    const preco = parseFloat(editPreco.replace(",", "."));
    if (!Number.isFinite(preco) || preco <= 0) issues.push("Preço");
    return issues;
  };

  const handleSave = async () => {
    if (!listing) return;
    const issues = getEditIssues();
    if (issues.length > 0) {
      const msg =
        issues.length === 1
          ? `Preencha: ${issues[0]}.`
          : `Preencha: ${issues.join(", ")}.`;
      setEditError(msg);
      showToast(issues[0], "error");
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      const preco = parseFloat(editPreco.replace(",", "."));
      const { listing: updated } = await api.listings.update(listing.id, {
        titulo: editTitulo.trim(),
        descricao: editDescricao.trim(),
        preco,
        aCombinar: false,
        cidade: editCidade.trim(),
        bairro: editBairro.trim() || null,
        uf: editUf,
        telefone: digitsOnly(editTelefone),
        semQualificacao:
          listing.listingType === "JOB_VACANCY" ? editSemQualificacao : false,
      });
      setListing(updated);
      setEditing(false);
      showToast("Anúncio atualizado.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar.";
      setEditError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleContact = async () => {
    if (!listing) return;
    triggerChat();

    if (!isAuthenticated) {
      navigate("/entrar", {
        state: { redirect: `/anuncio/${listing.id}` },
      });
      return;
    }

    if (listing.userId === user?.id) {
      startEditing(listing);
      return;
    }

    setContactLoading(true);
    try {
      const { conversationId } = await api.chat.startListing(listing.id);
      navigate(`/chat/${conversationId}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível abrir o chat.",
        "error"
      );
    } finally {
      setContactLoading(false);
    }
  };

  const handleClose = async () => {
    if (!listing) return;
    try {
      const { listing: updated } = await api.listings.close(listing.id);
      setListing(updated);
      showToast("Anúncio encerrado.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  const openRenew = () => {
    setRenewOpen(true);
    setRenewalId(null);
    setPixPayload("");
    setPixImage(null);
    setCheckoutError(null);
    setStatusLabel(undefined);
  };

  const handleReopen = async () => {
    if (!listing) return;
    const { expired } = formatListingValidity(listing.expiresAt);
    if (expired) {
      openRenew();
      return;
    }
    try {
      const { listing: updated } = await api.listings.reopen(listing.id);
      setListing(updated);
      showToast("Anúncio reaberto.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro.";
      if (/expirado|renove/i.test(msg)) {
        openRenew();
        return;
      }
      showToast(msg, "error");
    }
  };

  const handleGenerateRenewPix = async (payerProfile?: PayerProfilePayload) => {
    if (!listing) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const { renewal, pix } = await api.payments.renewListing(
        listing.id,
        payerProfile
      );
      setRenewalId(renewal.id);
      setPixPayload(pix.payload ?? renewal.pixCopyPaste ?? "");
      setPixImage(pix.encodedImage ?? renewal.pixQrCodeImage ?? null);
      setStatusLabel(
        renewal.status === "PAID" ? "Pagamento confirmado!" : "Aguardando Pix…"
      );
      if (renewal.status === "PAID") {
        const { listing: updated } = await api.listings.getById(listing.id);
        setListing(updated);
        showToast("Anúncio renovado por +15 dias.", "success");
        setRenewOpen(false);
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Não foi possível gerar o Pix."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    if (!renewalId || !renewOpen || !listing) return;
    const timer = window.setInterval(async () => {
      try {
        const { renewal } = await api.payments.listingRenewalStatus(renewalId);
        if (renewal.status === "PAID") {
          setStatusLabel("Pagamento confirmado!");
          const { listing: updated } = await api.listings.getById(listing.id);
          setListing(updated);
          showToast("Anúncio renovado por +15 dias.", "success");
          setRenewOpen(false);
          setRenewalId(null);
        }
      } catch {
        /* ignore */
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [renewalId, renewOpen, listing, showToast]);

  const handleDelete = async () => {
    if (!listing) return;
    if (!confirm("Excluir este anúncio?")) return;
    try {
      await api.listings.remove(listing.id);
      showToast("Anúncio removido.", "success");
      navigate("/minhas-publicacoes", { replace: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="animate-pulse space-y-4 py-4">
          <div className="aspect-[4/3] bg-slate-200" />
          <div className="mobile-gutter space-y-3">
            <div className="h-8 w-2/3 rounded bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-200" />
          </div>
        </div>
      </MobileShell>
    );
  }

  if (error || !listing) {
    return (
      <MobileShell>
        <div className="mobile-gutter py-12 text-center">
          <p className="text-red-600">{error}</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-sky-600">
            Voltar
          </Link>
        </div>
      </MobileShell>
    );
  }

  const isBico = listing.listingType === "JOB_VACANCY";
  const isOwner = listing.userId === user?.id;
  const validity = formatListingValidity(listing.expiresAt);
  const ctaLabel = isOwner
    ? editing
      ? "Editando anúncio"
      : "Editar anúncio"
    : isBico
      ? "Quero fazer esse serviço"
      : "Contratar profissional";
  const typeBadge = isBico ? "Pedido de serviço" : "Profissional disponível";
  const typeBadgeClass = isBico
    ? "bg-emerald-100 text-emerald-800"
    : "bg-sky-100 text-sky-800";
  const breadcrumb = `${listing.uf} › ${listing.cidade} › ${listing.categoria}`;

  return (
    <MobileShell>
      <article className="pb-28 lg:pb-8">
        <div className="border-b border-slate-100 bg-white">
          <div className="mobile-gutter mx-auto flex max-w-6xl items-center justify-between gap-3 py-2 text-xs text-slate-500">
            <p className="truncate">{breadcrumb}</p>
            <span className="shrink-0">{formatRelativeTime(listing.createdAt)}</span>
          </div>
          <ListingImageGallery
            titulo={listing.titulo}
            categoria={listing.categoria}
            imagemCapa={listing.imagemCapa}
            imagens={listing.imagens}
          />
        </div>

        <div className="mobile-gutter mx-auto max-w-6xl py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${typeBadgeClass}`}
              >
                {typeBadge}
              </span>
              <StatusBadge status={listing.status} />
              {isBico && listing.semQualificacao && (
                <span className="inline-block rounded-lg bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-800">
                  Sem qualificação exigida
                </span>
              )}
              {isOwner && (
                <span
                  className={`text-xs font-medium ${
                    validity.expired ? "text-amber-700" : "text-slate-600"
                  }`}
                >
                  {validity.label}
                </span>
              )}
            </div>

            {editing ? (
              <section className="space-y-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Editar anúncio</h2>

                <div>
                  <label className="text-sm font-medium text-slate-700">Título</label>
                  <input
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Descrição</label>
                  <textarea
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    rows={6}
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Preço (R$)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      value={editPreco}
                      onChange={(e) => setEditPreco(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Telefone</label>
                    <input
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(e.target.value)}
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Cidade</label>
                    <input
                      value={editCidade}
                      onChange={(e) => setEditCidade(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">UF</label>
                    <select
                      value={editUf}
                      onChange={(e) => setEditUf(e.target.value)}
                      className={inputClass}
                    >
                      {BRAZIL_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Bairro (opcional)</label>
                  <input
                    value={editBairro}
                    onChange={(e) => setEditBairro(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {isBico && (
                  <label className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={editSemQualificacao}
                      onChange={(e) => setEditSemQualificacao(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-sky-300 text-sky-600"
                    />
                    <span className="text-sm text-slate-700">
                      Não é necessária qualificação para este serviço
                    </span>
                  </label>
                )}

                {editError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {editError}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="papufy"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="rounded-xl px-4"
                  >
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    className="rounded-xl px-4"
                  >
                    Cancelar
                  </Button>
                </div>
              </section>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-bold leading-tight text-slate-900 lg:text-3xl">
                    {listing.titulo}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatLocation(listing.cidade, listing.uf, listing.bairro)}
                  </p>
                </div>

                <Card className="py-0 shadow-sm">
                  <CardContent className="p-4 lg:p-5">
                  <h2 className="font-bold text-foreground">Descrição</h2>
                  <SafeText
                    as="p"
                    className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700"
                  >
                    {listing.descricao}
                  </SafeText>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <aside className="mt-6 space-y-4 lg:mt-0 lg:sticky lg:top-24">
            <Card className="py-0 shadow-sm">
              <CardContent className="p-5">
              <p className="text-3xl font-extrabold text-slate-900">
                {formatListingPrice(listing)}
              </p>
              {listing.listingType === "PROFESSIONAL_PROFILE" &&
                listing.precoMin != null &&
                listing.precoMax != null &&
                listing.precoMin !== listing.precoMax && (
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Valor mínimo e máximo do serviço
                  </p>
                )}

              {!isOwner && (
                <MotionPressButton
                  onClick={() => void handleContact()}
                  disabled={contactLoading || listing.status !== "OPEN"}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 font-bold text-white disabled:opacity-60"
                >
                  <AnimatedLordIcon
                    name="chat"
                    size={26}
                    scale={1}
                    playToken={chatPlay}
                    loop={contactLoading}
                    colors="primary:#ffffff,secondary:#e0f2fe"
                  />
                  {contactLoading ? "Abrindo chat..." : ctaLabel}
                </MotionPressButton>
              )}

              {isOwner && !editing && (
                <Button
                  type="button"
                  variant="papufy"
                  size="cta"
                  onClick={() => startEditing(listing)}
                  className="mt-4 w-full rounded-xl"
                >
                  Editar anúncio
                </Button>
              )}
              </CardContent>
            </Card>

            {listing.criador && (
              <ListingSellerCard
                publisher={listing.criador}
                locationLabel={formatLocation(
                  listing.cidade,
                  listing.uf,
                  listing.bairro
                )}
              />
            )}

            {isOwner && (
              <Card className="py-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-bold text-foreground">Gerenciar anúncio</p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    validity.expired ? "text-amber-700" : "text-slate-600"
                  }`}
                >
                  {validity.label}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-sky-300 text-sky-800"
                    onClick={openRenew}
                  >
                    Renovar por R$ 15 (+15 dias)
                  </Button>
                  {listing.status === "OPEN" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-amber-300 text-amber-800"
                      onClick={() => void handleClose()}
                    >
                      Encerrar anúncio
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-green-300 text-green-800"
                      onClick={() => void handleReopen()}
                    >
                      {validity.expired
                        ? "Renovar e reabrir"
                        : "Reabrir anúncio"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-200 text-red-700"
                    onClick={() => void handleDelete()}
                  >
                    Excluir anúncio
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/minhas-publicacoes">
                      Ver todos os meus anúncios
                    </Link>
                  </Button>
                </div>
              </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </article>

      {!isOwner && (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <MotionPressButton
            onClick={() => void handleContact()}
            disabled={contactLoading || listing.status !== "OPEN"}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 font-bold text-white disabled:opacity-60"
          >
            <AnimatedLordIcon
              name="chat"
              size={26}
              scale={1}
              playToken={chatPlay}
              loop={contactLoading}
              colors="primary:#ffffff,secondary:#e0f2fe"
            />
            {contactLoading ? "Abrindo chat..." : ctaLabel}
          </MotionPressButton>
        </div>
      )}

      <PaymentCheckoutSheet
        open={renewOpen}
        onClose={() => {
          if (checkoutLoading) return;
          setRenewOpen(false);
          setRenewalId(null);
          setPixPayload("");
          setPixImage(null);
          setCheckoutError(null);
        }}
        title="Renovar anúncio"
        amountLabel="R$ 15,00 · +15 dias de validade"
        pixCopyPaste={pixPayload}
        pixQrCodeImage={pixImage}
        statusLabel={statusLabel}
        loading={checkoutLoading}
        errorMessage={checkoutError}
        needsPayerCpf={needsPayerCpf}
        pixOnly
        onGeneratePix={(profile) => void handleGenerateRenewPix(profile)}
      />
    </MobileShell>
  );
}
