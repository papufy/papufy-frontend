import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ListingPublisher } from "../types";
import { formatLastAccess, formatMemberSince } from "../utils/format";
import { getProfilePhotoUrl } from "../lib/profilePhoto";

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function VerifiedRow({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2 text-sm text-slate-600">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
        }`}
        aria-hidden
      >
        {ok ? "✓" : "×"}
      </span>
      {label}
    </li>
  );
}

interface ListingSellerCardProps {
  publisher: ListingPublisher;
  locationLabel?: string;
}

export function ListingSellerCard({
  publisher,
  locationLabel,
}: ListingSellerCardProps) {
  const photoUrl = getProfilePhotoUrl(publisher.id);
  const location =
    locationLabel ??
    [publisher.cidade, publisher.uf].filter(Boolean).join(", ");

  return (
    <Card className="py-0 shadow-sm">
      <CardContent className="p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-600">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(publisher.nome)
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-slate-900">
            {publisher.nome}
          </p>
          {publisher.lastSeenAt && (
            <p className="mt-0.5 text-xs text-slate-500">
              {formatLastAccess(publisher.lastSeenAt)}
            </p>
          )}
        </div>
      </div>

      <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
        {publisher.memberSince && (
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-slate-400" aria-hidden>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
            </span>
            {formatMemberSince(publisher.memberSince)}
          </li>
        )}
        {location && (
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-slate-400" aria-hidden>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z" strokeLinecap="round" />
                <circle cx="12" cy="11" r="2.5" />
              </svg>
            </span>
            <span>{location}</span>
          </li>
        )}
      </ul>

      <Button variant="outline" className="mt-4 h-11 w-full rounded-xl" asChild>
        <Link to={`/usuario/${publisher.id}`}>
          Acessar perfil do anunciante
        </Link>
      </Button>

      <Separator className="mt-5" />
      <div className="pt-4">
        <p className="text-sm font-semibold text-slate-700">
          Informações verificadas
        </p>
        <ul className="mt-3 space-y-2">
          <VerifiedRow ok={publisher.verifiedEmail ?? true} label="E-mail" />
          <VerifiedRow ok={publisher.verifiedPhone ?? false} label="Telefone" />
        </ul>
      </div>
      </CardContent>
    </Card>
  );
}
