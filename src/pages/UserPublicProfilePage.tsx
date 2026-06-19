import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FadeContent } from "@/components/effects/FadeContent";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCardMobile } from "../components/mobile/ListingCardMobile";
import { MobileShell } from "../components/mobile/MobileShell";
import { ReputationBlock } from "../components/ReputationBlock";
import { api } from "../lib/api";
import { getProfilePhotoUrl } from "../lib/profilePhoto";
import type { Listing, ListingPublisher } from "../types";
import {
  formatLastAccess,
  formatMemberSince,
  formatLocation,
} from "../utils/format";

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function UserPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [publisher, setPublisher] = useState<ListingPublisher | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.user
      .getPublicProfile(id)
      .then((data) => {
        setPublisher({
          ...data.user,
          reputation: data.reputation,
        });
        setListings(data.listings);
        setTotalListings(data.totalListings);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Perfil não encontrado.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MobileShell>
        <div className="mobile-gutter space-y-4 py-6">
          <Skeleton className="h-24 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </MobileShell>
    );
  }

  if (error || !publisher) {
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

  const photoUrl = getProfilePhotoUrl(publisher.id);
  const location = formatLocation(
    publisher.cidade ?? "",
    publisher.uf ?? "",
    null
  );

  return (
    <MobileShell>
      <div className="mobile-gutter mx-auto max-w-5xl space-y-6 py-5">
        <FadeContent>
        <Card className="py-0 shadow-sm">
          <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-lg font-bold text-slate-600">
              {photoUrl ? (
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                getInitials(publisher.nome)
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900">{publisher.nome}</h1>
              {publisher.lastSeenAt && (
                <p className="mt-1 text-sm text-slate-500">
                  {formatLastAccess(publisher.lastSeenAt)}
                </p>
              )}
              {publisher.memberSince && (
                <p className="mt-1 text-sm text-slate-500">
                  {formatMemberSince(publisher.memberSince)}
                </p>
              )}
              {publisher.cidade && publisher.uf && (
                <p className="mt-1 text-sm text-slate-500">{location}</p>
              )}
            </div>
          </div>

          {publisher.reputation && (
            <div className="mt-4">
              <ReputationBlock
                reputation={publisher.reputation}
                subjectLabel={publisher.nome.split(" ")[0] ?? "este usuário"}
                compact
              />
            </div>
          )}
          </CardContent>
        </Card>
        </FadeContent>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Publicações recentes
              </h2>
              <p className="text-sm text-slate-500">
                {totalListings} anúncio{totalListings === 1 ? "" : "s"} ativo
                {totalListings === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Este usuário não tem anúncios ativos no momento.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {listings.map((listing) => (
                <ListingCardMobile key={listing.id} listing={listing} compact />
              ))}
            </div>
          )}
        </section>
      </div>
    </MobileShell>
  );
}
