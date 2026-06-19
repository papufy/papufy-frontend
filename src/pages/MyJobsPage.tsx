import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FadeContent } from "@/components/effects/FadeContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
        <FadeContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-foreground">
                Meus anúncios
              </h1>
              <p className="text-sm text-muted-foreground">
                Pedidos de serviço e perfis profissionais que você publicou.
              </p>
            </div>
            <Button variant="papufy" size="pill" asChild>
              <Link to="/anunciar/tipo">+ Novo anúncio</Link>
            </Button>
          </div>
        </FadeContent>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <Card className="border-dashed py-0 shadow-none">
            <CardContent className="p-10 text-center">
              <p className="font-semibold text-foreground">
                Você ainda não publicou nenhum anúncio.
              </p>
              <Button variant="link" className="mt-4 text-sky-600" asChild>
                <Link to="/anunciar/tipo">Anunciar grátis</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {listings.map((listing) => {
            const isBico = listing.listingType === "JOB_VACANCY";

            return (
              <Card key={listing.id} size="sm" className="py-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={listing.status} />
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {isBico ? "Pedido" : "Profissional"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(listing.createdAt)}
                        </span>
                      </div>
                      <Link
                        to={`/anuncio/${listing.id}`}
                        className="mt-2 block text-lg font-bold text-foreground hover:text-sky-600"
                      >
                        {listing.titulo}
                      </Link>
                      <p className="text-sm font-semibold text-sky-700">
                        {formatPrice(listing.preco ?? null, listing.aCombinar)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.categoria} · {listing.cidade}, {listing.uf}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/anuncio/${listing.id}`}>Ver</Link>
                      </Button>
                      {listing.status === "OPEN" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-amber-300 text-amber-800"
                          onClick={() => handleClose(listing.id)}
                        >
                          Encerrar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-800"
                          onClick={() => handleReopen(listing.id)}
                        >
                          Reabrir
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700"
                        onClick={() => handleDelete(listing.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
