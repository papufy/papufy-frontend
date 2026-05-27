import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MobileShell } from "../components/mobile/MobileShell";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Listing } from "../types";
import { formatPrice, formatRelativeTime } from "../utils/format";

export function MyJobsPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { listings: data } = await api.listings.listMine();
      setListings(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao carregar anúncios.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleClose = async (id: string) => {
    try {
      await api.listings.close(id);
      showToast("Anúncio encerrado.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  const handleReopen = async (id: string) => {
    try {
      await api.listings.reopen(id);
      showToast("Anúncio reaberto.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este anúncio permanentemente?")) return;
    try {
      await api.listings.remove(id);
      showToast("Anúncio excluído.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  return (
    <MobileShell>
      <div className="mobile-gutter space-y-4 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-papufy-text">
              Meus anúncios
            </h1>
            <p className="text-sm text-papufy-muted">
              Pedidos de serviço e perfis profissionais que você publicou.
            </p>
          </div>
          <Link
            to="/anunciar/tipo"
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm active:scale-95"
          >
            + Novo anúncio
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-papufy-border bg-white p-10 text-center">
            <p className="font-semibold text-papufy-text">
              Você ainda não publicou nenhum anúncio.
            </p>
            <Link
              to="/anunciar/tipo"
              className="mt-4 inline-block font-bold text-sky-600"
            >
              Anunciar grátis
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {listings.map((listing) => {
            const isBico =
              listing.listingType === "JOB_VACANCY";

            return (
              <article
                key={listing.id}
                className="rounded-2xl border border-papufy-border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={listing.status} />
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        {isBico ? "Pedido" : "Profissional"}
                      </span>
                      <span className="text-xs text-papufy-muted">
                        {formatRelativeTime(listing.createdAt)}
                      </span>
                    </div>
                    <Link
                      to={`/anuncio/${listing.id}`}
                      className="mt-2 block text-lg font-bold text-papufy-text hover:text-sky-600"
                    >
                      {listing.titulo}
                    </Link>
                    <p className="text-sm font-semibold text-sky-700">
                      {formatPrice(listing.preco ?? null, listing.aCombinar)}
                    </p>
                    <p className="text-xs text-papufy-muted">
                      {listing.categoria} · {listing.cidade}, {listing.uf}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/anuncio/${listing.id}`}
                      className="rounded-lg border border-papufy-border px-3 py-1.5 text-sm font-medium active:bg-slate-50"
                    >
                      Ver
                    </Link>
                    {listing.status === "OPEN" ? (
                      <button
                        type="button"
                        onClick={() => handleClose(listing.id)}
                        className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-800 active:bg-amber-50"
                      >
                        Encerrar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReopen(listing.id)}
                        className="rounded-lg border border-green-300 px-3 py-1.5 text-sm font-medium text-green-800 active:bg-green-50"
                      >
                        Reabrir
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(listing.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 active:bg-red-50"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
