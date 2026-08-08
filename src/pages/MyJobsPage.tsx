import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileShell } from "../components/mobile/MobileShell";
import {
  PaymentCheckoutSheet,
  type PayerProfilePayload,
} from "../components/mobile/PaymentCheckoutSheet";
import { AutoAnimateList } from "../components/motion/AutoAnimateList";
import { MotionEnter } from "../components/motion/MotionPrimitives";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Listing } from "../types";
import {
  formatListingPrice,
  formatListingValidity,
  formatRelativeTime,
} from "../utils/format";

export function MyJobsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewListing, setRenewListing] = useState<Listing | null>(null);
  const [renewalId, setRenewalId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState("");
  const [pixImage, setPixImage] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string | undefined>();

  const needsPayerCpf = useMemo(() => {
    const doc = user?.cpfCnpj?.replace(/\D/g, "") ?? "";
    return doc.length < 11;
  }, [user?.cpfCnpj]);

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

  useEffect(() => {
    if (!renewalId || !renewListing) return;
    const timer = window.setInterval(async () => {
      try {
        const { renewal } = await api.payments.listingRenewalStatus(renewalId);
        if (renewal.status === "PAID") {
          setStatusLabel("Pagamento confirmado!");
          showToast("Anúncio renovado por +15 dias.", "success");
          setRenewListing(null);
          setRenewalId(null);
          setPixPayload("");
          setPixImage(null);
          void load();
        }
      } catch {
        /* ignore poll errors */
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [renewalId, renewListing, load, showToast]);

  const handleClose = async (id: string) => {
    try {
      await api.listings.close(id);
      showToast("Anúncio encerrado.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  const handleReopen = async (listing: Listing) => {
    const { expired } = formatListingValidity(listing.expiresAt);
    if (expired) {
      openRenew(listing);
      return;
    }
    try {
      await api.listings.reopen(listing.id);
      showToast("Anúncio reaberto.", "success");
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro.";
      if (/expirado|renove/i.test(msg)) {
        openRenew(listing);
        return;
      }
      showToast(msg, "error");
    }
  };

  const openRenew = (listing: Listing) => {
    setRenewListing(listing);
    setRenewalId(null);
    setPixPayload("");
    setPixImage(null);
    setCheckoutError(null);
    setStatusLabel(undefined);
  };

  const handleGenerateRenewPix = async (payerProfile?: PayerProfilePayload) => {
    if (!renewListing) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const { renewal, pix } = await api.payments.renewListing(
        renewListing.id,
        payerProfile
      );
      setRenewalId(renewal.id);
      setPixPayload(pix.payload ?? renewal.pixCopyPaste ?? "");
      setPixImage(pix.encodedImage ?? renewal.pixQrCodeImage ?? null);
      setStatusLabel(
        renewal.status === "PAID" ? "Pagamento confirmado!" : "Aguardando Pix…"
      );
      if (renewal.status === "PAID") {
        showToast("Anúncio renovado por +15 dias.", "success");
        setRenewListing(null);
        void load();
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Não foi possível gerar o Pix."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este anúncio?")) return;
    try {
      await api.listings.remove(id);
      showToast("Anúncio removido.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  return (
    <MobileShell>
      <div className="mobile-gutter space-y-4 py-5">
        <MotionEnter>
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
        </MotionEnter>

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

        <AutoAnimateList className="space-y-3">
          {listings.map((listing) => {
            const isBico = listing.listingType === "JOB_VACANCY";
            const validity = formatListingValidity(listing.expiresAt);

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
                        {formatListingPrice(listing)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.categoria} · {listing.cidade}, {listing.uf}
                      </p>
                      <p
                        className={`mt-1 text-xs font-medium ${
                          validity.expired ? "text-amber-700" : "text-slate-600"
                        }`}
                      >
                        {validity.label}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/anuncio/${listing.id}`}>Ver</Link>
                      </Button>
                      <Button variant="papufy" size="sm" asChild>
                        <Link to={`/anuncio/${listing.id}?edit=1`}>
                          Alterar
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-sky-300 text-sky-800"
                        onClick={() => openRenew(listing)}
                      >
                        Renovar por R$ 15
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
                          onClick={() => void handleReopen(listing)}
                        >
                          {validity.expired ? "Renovar e reabrir" : "Reabrir"}
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
        </AutoAnimateList>
      </div>

      <PaymentCheckoutSheet
        open={Boolean(renewListing)}
        onClose={() => {
          if (checkoutLoading) return;
          setRenewListing(null);
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
