import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PaymentCheckoutSheet } from "../components/mobile/PaymentCheckoutSheet";
import { MobileShell } from "../components/mobile/MobileShell";
import { CATEGORY_META } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { Listing } from "../types";
import { formatLocation, formatPrice } from "../utils/format";

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.listings
      .getById(id)
      .then(({ listing: data }) => setListing(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Anúncio não encontrado.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MobileShell>
        <div className="page-container animate-pulse space-y-4 py-4">
          <div className="aspect-square rounded-2xl bg-gray-200" />
          <div className="h-8 w-2/3 rounded bg-gray-200" />
          <div className="h-24 rounded-xl bg-gray-200" />
        </div>
      </MobileShell>
    );
  }

  if (error || !listing) {
    return (
      <MobileShell>
        <div className="page-container py-12 text-center">
          <p className="text-red-600">{error}</p>
          <Link to="/" className="mt-4 inline-block text-papufy-orange">
            Voltar
          </Link>
        </div>
      </MobileShell>
    );
  }

  const meta = CATEGORY_META[listing.categoria] ?? CATEGORY_META.Outros;
  const isJobVacancy = listing.listingType === "JOB_VACANCY";
  const ctaText = isJobVacancy ? "Quero fazer esse serviço" : "Pagar e contratar";

  const startChat = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: `/anuncio/${id}` } });
      return;
    }
    setStartingChat(true);
    try {
      const { conversationId } = await api.chat.startListingConversation(id);
      navigate(`/chat/${conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar chat.");
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <MobileShell showSearch={false}>
      <article className="page-container space-y-4 py-3 pb-8">
        <div
          className={`flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br ${meta.imageGradient}`}
        >
          <span className="text-7xl">{meta.icon}</span>
        </div>

        <span
          className={`inline-block rounded-md px-2 py-1 text-xs font-bold uppercase text-white ${
            isJobVacancy ? "bg-emerald-600" : "bg-blue-600"
          }`}
        >
          {isJobVacancy ? "PEDIDO DE SERVIÇO" : "PROFISSIONAL DISPONÍVEL"}
        </span>

        <h1 className="text-xl font-bold text-papufy-text">{listing.titulo}</h1>
        <p className="text-2xl font-extrabold text-papufy-text">
          {formatPrice(listing.preco ?? null, listing.aCombinar)}
        </p>
        <p className="text-sm text-papufy-muted">
          {formatLocation(listing.cidade, listing.uf, listing.bairro)}
        </p>

        <section className="rounded-2xl border border-papufy-border bg-white p-4">
          <h2 className="font-bold text-papufy-text">Descrição</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {listing.descricao}
          </p>
        </section>

        <p className="text-center text-xs text-papufy-muted">
          Anunciante: {listing.criador?.nome ?? "—"}
        </p>

        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              navigate("/entrar", { state: { redirect: `/anuncio/${id}` } });
              return;
            }
            if (isJobVacancy || listing.contactUnlocked) {
              void startChat();
              return;
            }
            setCheckoutOpen(true);
          }}
          disabled={startingChat}
          className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white ${
            isJobVacancy ? "bg-emerald-600" : "bg-blue-600"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {startingChat ? "Abrindo chat..." : ctaText}
        </button>

        {!isJobVacancy && !listing.contactUnlocked && (
          <p className="text-center text-xs text-papufy-muted">
            O contato e endereço do serviço são liberados após o pagamento.
          </p>
        )}
      </article>

      {!isJobVacancy && (
        <PaymentCheckoutSheet
          open={checkoutOpen}
          listing={listing}
          onClose={() => setCheckoutOpen(false)}
          onPaid={async () => {
            setCheckoutOpen(false);
            await startChat();
          }}
        />
      )}
    </MobileShell>
  );
}
