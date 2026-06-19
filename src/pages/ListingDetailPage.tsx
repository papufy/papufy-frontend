import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListingImageGallery } from "../components/ListingImageGallery";
import { ListingSellerCard } from "../components/ListingSellerCard";
import { SafeText } from "../components/SafeText";
import { MobileShell } from "../components/mobile/MobileShell";
import { StatusBadge } from "../components/StatusBadge";
import { BRAZIL_STATES } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Listing } from "../types";
import { digitsOnly } from "../utils/masks";
import {
  formatLocation,
  formatPrice,
  formatRelativeTime,
} from "../utils/format";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";


export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        semQualificacao: editSemQualificacao,
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

  const handleReopen = async () => {
    if (!listing) return;
    try {
      const { listing: updated } = await api.listings.reopen(listing.id);
      setListing(updated);
      showToast("Anúncio reaberto.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    if (!confirm("Excluir este anúncio permanentemente?")) return;
    try {
      await api.listings.remove(listing.id);
      showToast("Anúncio excluído.", "success");
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
          <div className="mobile-gutter flex items-center justify-between gap-3 py-2 text-xs text-slate-500">
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
              {listing.semQualificacao && (
                <span className="inline-block rounded-lg bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-800">
                  Sem qualificação exigida
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
                {formatPrice(listing.preco ?? null, listing.aCombinar)}
              </p>

              {!isOwner && (
                <Button
                  type="button"
                  variant="papufy"
                  size="cta"
                  onClick={() => void handleContact()}
                  disabled={contactLoading || listing.status !== "OPEN"}
                  className="mt-4 w-full rounded-xl"
                >
                  {contactLoading ? "Abrindo chat..." : ctaLabel}
                </Button>
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
                <div className="mt-3 flex flex-col gap-2">
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
                      Reabrir anúncio
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
          <Button
            type="button"
            variant="papufy"
            size="cta"
            onClick={() => void handleContact()}
            disabled={contactLoading || listing.status !== "OPEN"}
            className="w-full rounded-2xl"
          >
            {contactLoading ? "Abrindo chat..." : ctaLabel}
          </Button>
        </div>
      )}
    </MobileShell>
  );
}
