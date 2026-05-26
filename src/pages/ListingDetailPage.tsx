import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SafeText } from "../components/SafeText";
import { PaymentCheckoutSheet } from "../components/mobile/PaymentCheckoutSheet";
import { MobileShell } from "../components/mobile/MobileShell";
import { CATEGORY_META } from "../constants/categories";
import { api } from "../lib/api";
import type { Listing } from "../types";
import { formatLocation, formatPrice } from "../utils/format";

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const pixCode = useMemo(() => {
    if (!listing) return "";
    const value = listing.aCombinar
      ? "0.00"
      : (listing.preco ?? 0).toFixed(2);
    return `00020126580014BR.GOV.BCB.PIX0136papufy@pagamento520400005303986540${value}5802BR5925PAPUFY MARKETPLACE6009SAO PAULO62070503***6304ABCD`;
  }, [listing]);

  if (loading) {
    return (
      <MobileShell>
        <div className="mobile-gutter animate-pulse space-y-4 py-4">
          <div className="aspect-square rounded-2xl bg-slate-200" />
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
        </div>
      </MobileShell>
    );
  }

  if (error || !listing) {
    return (
      <MobileShell>
        <div className="mobile-gutter py-12 text-center">
          <p className="text-red-600">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block font-semibold text-sky-600"
          >
            Voltar
          </Link>
        </div>
      </MobileShell>
    );
  }

  const meta = CATEGORY_META[listing.categoria] ?? CATEGORY_META.Outros;
  const isBico =
    listing.listingType === "JOB_VACANCY" || listing.tipo === "BICO";
  const cover = listing.imagemCapa;
  const showImage = Boolean(cover && !cover.includes("placeholders/"));

  return (
    <MobileShell>
      <article className="mobile-gutter space-y-4 py-3 pb-28">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
          {showImage ? (
            <img
              src={cover!}
              alt={listing.titulo}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center bg-gradient-to-br ${meta.imageGradient}`}
            >
              <span className="text-7xl">{meta.icon}</span>
            </div>
          )}
        </div>

        <span
          className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isBico
              ? "bg-emerald-100 text-emerald-800"
              : "bg-sky-100 text-sky-800"
          }`}
        >
          {isBico ? "[Pedido de serviço]" : "[Profissional disponível]"}
        </span>

        <h1 className="text-xl font-bold text-slate-900">{listing.titulo}</h1>
        <p className="text-2xl font-extrabold text-sky-700">
          {formatPrice(listing.preco ?? null, listing.aCombinar)}
        </p>
        <p className="text-sm text-slate-500">
          {formatLocation(listing.cidade, listing.uf, listing.bairro)}
        </p>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-slate-900">Descrição</h2>
          <SafeText
            as="p"
            className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700"
          >
            {listing.descricao}
          </SafeText>
        </section>

        <p className="text-center text-xs text-slate-500">
          Anunciante: {listing.criador?.nome ?? "—"}
        </p>
      </article>

      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setCheckoutOpen(true)}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-base font-bold text-white shadow-lg shadow-sky-200/50 active:scale-[0.98]"
        >
          Pagar com Pix
        </button>
      </div>

      <PaymentCheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title={listing.titulo}
        amountLabel={formatPrice(listing.preco ?? null, listing.aCombinar)}
        pixCopyPaste={pixCode}
      />
    </MobileShell>
  );
}
