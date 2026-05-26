import { useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_RECENT_JOBS, type MockRecentJob } from "../../data/homeMocks";
import { IconHeart } from "../icons/NavIcons";

interface RecentJobsGridProps {
  jobs?: MockRecentJob[];
  title?: string;
  subtitle?: string;
}

export function RecentJobsGrid({
  jobs = MOCK_RECENT_JOBS,
  title = "Procurados por você",
  subtitle = "Perto de Campina Grande, PB",
}: RecentJobsGridProps) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="w-full">
      <header className="mb-3">
        <h2 className="text-lg font-bold tracking-tight text-papufy-text sm:text-xl">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-papufy-muted">{subtitle}</p>
      </header>

      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6">
        {jobs.map((job) => {
          const favorited = favorites[job.id];
          return (
            <Link
              key={job.id}
              to={`/anuncio/${job.id}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-papufy-border bg-white shadow-sm transition active:scale-[0.98]"
            >
              <div
                className={`relative aspect-square w-full overflow-hidden bg-gradient-to-br ${job.imageGradient}`}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 8px)",
                  }}
                  aria-hidden
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl drop-shadow-sm transition group-active:scale-105 sm:text-2xl">
                    {job.imageEmoji}
                  </span>
                </div>

                <span
                  className={`absolute left-1 top-1 rounded px-1 py-px text-[7px] font-bold uppercase leading-none tracking-wide shadow-sm sm:text-[8px] ${job.tagClassName}`}
                >
                  {job.categoryTag}
                </span>

                <button
                  type="button"
                  onClick={(e) => toggleFavorite(job.id, e)}
                  className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition active:scale-90 sm:h-6 sm:w-6 ${
                    favorited ? "text-papufy-orange" : "text-papufy-muted"
                  }`}
                  aria-label={favorited ? "Remover dos favoritos" : "Favoritar"}
                >
                  <IconHeart
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${favorited ? "fill-current" : ""}`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-0.5 p-1.5 sm:p-2">
                <h3 className="line-clamp-2 text-[10px] font-semibold leading-tight text-papufy-text sm:text-[11px]">
                  {job.title}
                </h3>
                <p className="text-[11px] font-extrabold leading-none text-papufy-text sm:text-xs">
                  {job.price}
                </p>
                <p className="line-clamp-1 text-[8px] text-papufy-muted sm:text-[9px]">
                  {job.locationLine}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
