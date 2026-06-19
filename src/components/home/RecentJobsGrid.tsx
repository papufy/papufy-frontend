import type { Listing } from "../../types";
import { FadeContent } from "@/components/effects/FadeContent";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCardMobile } from "../mobile/ListingCardMobile";

const FEATURED_SKELETON_COUNT = 6;

interface RecentJobsGridProps {
  listings: Listing[];
  loading?: boolean;
  locationLabel: string;
  locationDetecting?: boolean;
  title?: string;
  /** `null` oculta o subtítulo (ex.: seção “Serviços em Destaque”). */
  subtitle?: string | null;
}

export function RecentJobsGrid({
  listings,
  loading = false,
  locationLabel,
  locationDetecting = false,
  title = "Serviços em Destaque",
  subtitle: subtitleProp,
}: RecentJobsGridProps) {
  const subtitle =
    subtitleProp === null
      ? null
      : subtitleProp ??
        (locationDetecting
          ? "Detectando sua localização..."
          : `Perto de ${locationLabel}`);

  return (
    <section className="w-full">
      <FadeContent>
        <header className="mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
          {subtitle != null && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </header>
      </FadeContent>

      {loading && listings.length === 0 ? (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
          {Array.from({ length: FEATURED_SKELETON_COUNT }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square rounded-lg"
            />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 px-3 py-4 text-center text-xs text-muted-foreground">
          Nenhum anúncio perto de {locationLabel} no momento.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6">
          {listings.map((listing) => (
            <ListingCardMobile key={listing.id} listing={listing} compact />
          ))}
        </div>
      )}
    </section>
  );
}
