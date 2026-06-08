import type { UserReputation } from "../types";

interface ReputationBlockProps {
  reputation: UserReputation;
  /** Nome exibido no contador de trabalhos (ex.: "Maria" ou "você") */
  subjectLabel?: string;
  compact?: boolean;
  className?: string;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-5 w-5 ${filled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
      aria-hidden
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function renderStars(averageRating: number | null) {
  const value = averageRating ?? 0;
  return Array.from({ length: 5 }, (_, index) => (
    <StarIcon key={index} filled={value >= index + 1} />
  ));
}

function jobsLabel(count: number, subjectLabel: string) {
  if (count === 0) {
    return `Nenhum trabalho concluído por ${subjectLabel} ainda`;
  }
  if (count === 1) {
    return `1 trabalho realizado por ${subjectLabel}`;
  }
  return `${count} trabalhos realizados por ${subjectLabel}`;
}

export function ReputationBlock({
  reputation,
  subjectLabel = "esta pessoa",
  compact = false,
  className = "",
}: ReputationBlockProps) {
  const { averageRating, reviewCount, completedJobsCount } = reputation;
  const hasReviews = reviewCount > 0;

  return (
    <section
      className={`rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-4 shadow-sm ${compact ? "p-3" : "sm:p-5"} ${className}`}
      aria-label="Reputação"
    >
      <h2
        className={`font-bold text-slate-900 ${compact ? "text-sm" : "text-base"}`}
      >
        Avaliação
      </h2>

      <div className={`mt-3 flex flex-wrap items-center gap-2 ${compact ? "gap-1.5" : ""}`}>
        <div className="flex items-center gap-0.5" aria-hidden>
          {hasReviews
            ? renderStars(averageRating)
            : Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={false} />)}
        </div>
        {hasReviews ? (
          <p className="text-sm font-semibold text-slate-800">
            {averageRating?.toFixed(1)}{" "}
            <span className="font-normal text-slate-500">
              ({reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"})
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-500">Sem avaliações ainda</p>
        )}
      </div>

      <div
        className={`mt-3 flex items-center gap-2 rounded-xl border border-sky-100 bg-white/80 px-3 py-2.5 ${compact ? "py-2" : ""}`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-700 ${compact ? "h-8 w-8 text-xs" : ""}`}
          aria-hidden
        >
          {completedJobsCount}
        </span>
        <p className={`text-sm font-medium text-slate-700 ${compact ? "text-xs" : ""}`}>
          {jobsLabel(completedJobsCount, subjectLabel)}
        </p>
      </div>
    </section>
  );
}
