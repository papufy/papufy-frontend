import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { getCategoryMeta } from "../constants/categories";
import type { Job } from "../types";
import { formatLocation, formatPrice, formatRelativeTime } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const meta = getCategoryMeta(job.categoria);

  return (
    <Link
      to={`/trabalho/${job.id}`}
      className="group block active:scale-[0.99]"
    >
      <Card
        size="sm"
        className="flex-row overflow-hidden py-0 shadow-sm transition hover:shadow-md sm:flex-col"
      >
      <div
        className={`relative flex h-28 w-32 shrink-0 items-center justify-center bg-gradient-to-br sm:h-36 sm:w-full ${meta.imageGradient}`}
      >
        <span className="text-4xl drop-shadow-md transition sm:text-5xl sm:group-hover:scale-105">
          {meta.icon}
        </span>
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs ${meta.color}`}
        >
          {job.categoria}
        </span>
        {job.status === "CLOSED" && (
          <span className="absolute right-2 top-2 sm:right-3 sm:top-3">
            <StatusBadge status="CLOSED" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 sm:gap-2 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-papufy-text sm:text-base sm:group-hover:text-papufy-orange">
          {job.titulo}
        </h3>

        <p className="text-base font-extrabold text-papufy-text sm:text-lg">
          {formatPrice(job.preco ?? null, job.aCombinar)}
        </p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-papufy-muted sm:mt-auto sm:justify-between sm:text-xs">
          <span className="line-clamp-1">
            {formatLocation(job.cidade, job.uf, job.bairro)} —{" "}
            {formatRelativeTime(job.createdAt)}
          </span>
          {(job.interesses ?? 0) > 0 && (
            <span className="shrink-0 font-medium text-papufy-orange">
              {job.interesses} interessado{(job.interesses ?? 0) !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
      </Card>
    </Link>
  );
}
