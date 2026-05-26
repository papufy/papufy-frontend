import {
  MOCK_FEATURED_PROFESSIONALS,
  type MockFeaturedProfessional,
} from "../../data/homeMocks";

function VerifiedBadge() {
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-papufy-blue text-[10px] text-white"
      title="Verificado"
      aria-label="Verificado"
    >
      ✓
    </span>
  );
}

interface FeaturedProfessionalsScrollProps {
  professionals?: MockFeaturedProfessional[];
  title?: string;
}

export function FeaturedProfessionalsScroll({
  professionals = MOCK_FEATURED_PROFESSIONALS,
  title = "Profissionais em Destaque",
}: FeaturedProfessionalsScrollProps) {
  return (
    <section className="w-full">
      <header className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-papufy-text">
          {title}
        </h2>
      </header>

      <div
        className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 touch-pan-x snap-x-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {professionals.map((pro) => (
          <article
            key={pro.id}
            className="w-[148px] shrink-0 snap-start rounded-2xl border border-papufy-border bg-white p-3 shadow-sm transition active:scale-[0.97]"
          >
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-3xl shadow-inner ${pro.avatarGradient}`}
            >
              <span aria-hidden>{pro.avatarEmoji}</span>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1">
              <p className="truncate text-sm font-bold text-papufy-text">
                {pro.name}
              </p>
              {pro.verified && <VerifiedBadge />}
            </div>

            <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wide text-sky-600">
              {pro.badge}
            </p>

            <p className="mt-1 line-clamp-2 text-center text-[11px] leading-tight text-papufy-muted">
              {pro.specialty}
            </p>

            <button
              type="button"
              className="mt-2 w-full rounded-full border-2 border-papufy-orange py-1.5 text-[10px] font-bold text-sky-600 active:scale-95"
            >
              Ver perfil
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
