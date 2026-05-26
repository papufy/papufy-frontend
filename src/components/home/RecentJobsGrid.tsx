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
      <header className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-papufy-text">
          {title}
        </h2>
        <p className="mt-1 text-sm text-papufy-muted">{subtitle}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {jobs.map((job) => {
          const favorited = favorites[job.id];
          return (
            <Link
              key={job.id}
              to={`/anuncio/${job.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-papufy-border bg-white shadow-sm transition active:scale-[0.98]"
            >
              <div
                className={`relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br ${job.imageGradient}`}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 16px)",
                  }}
                  aria-hidden
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl drop-shadow-lg transition group-active:scale-105">
                    {job.imageEmoji}
                  </span>
                </div>

                <span
                  className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm ${job.tagClassName}`}
                >
                  {job.categoryTag}
                </span>

                <button
                  type="button"
                  onClick={(e) => toggleFavorite(job.id, e)}
                  className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition active:scale-90 ${
                    favorited ? "text-papufy-orange" : "text-papufy-muted"
                  }`}
                  aria-label={favorited ? "Remover dos favoritos" : "Favoritar"}
                >
                  <IconHeart
                    className={`h-4 w-4 ${favorited ? "fill-current" : ""}`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-1 p-3">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-papufy-text">
                  {job.title}
                </h3>
                <p className="text-base font-extrabold text-papufy-text">
                  {job.price}
                </p>
                <div className="mt-0.5 flex items-center justify-between gap-1 text-[10px] text-papufy-muted">
                  <span className="line-clamp-1">{job.locationLine}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
