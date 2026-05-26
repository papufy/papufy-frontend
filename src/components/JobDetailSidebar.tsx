import { IconChat } from "./icons/NavIcons";
import { StatusBadge } from "./StatusBadge";
import type { Job, JobInterestItem } from "../types";
import { formatLocation, formatPrice, formatRelativeTime } from "../utils/format";

interface JobDetailSidebarProps {
  job: Job;
  isOwner: boolean;
  isClosed: boolean;
  hasChat: boolean;
  actionLoading: boolean;
  interests: JobInterestItem[];
  onChat: () => void;
  onClose: () => void;
  onRespond: (conversationId: string) => void;
}

export function JobDetailSidebar({
  job,
  isOwner,
  isClosed,
  hasChat,
  actionLoading,
  interests,
  onChat,
  onClose,
  onRespond,
}: JobDetailSidebarProps) {
  const advertiserName = job.criador?.nome ?? "Anunciante";
  const initial = advertiserName.charAt(0).toUpperCase();
  const price = formatPrice(job.preco ?? null, job.aCombinar);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-xl border border-papufy-border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-papufy-text">
              {price}
            </p>
            {job.aCombinar && (
              <p className="mt-1 text-sm text-papufy-muted">
                Valor negociável com o profissional
              </p>
            )}
          </div>
          <StatusBadge status={job.status} />
        </div>

        <hr className="my-5 border-papufy-border" />

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-lg font-bold text-papufy-orange">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-papufy-text">
              {advertiserName}
            </p>
            <p className="text-xs text-papufy-muted">
              Publicado {formatRelativeTime(job.createdAt)}
            </p>
            {job.criador?.cidade && (
              <p className="text-xs text-papufy-muted">
                {formatLocation(job.cidade, job.uf, job.bairro)}
              </p>
            )}
          </div>
        </div>

        {!isOwner && !isClosed && (
          <button
            type="button"
            onClick={onChat}
            disabled={actionLoading}
            className="mt-5 hidden w-full items-center justify-center gap-2 rounded-full border-2 border-papufy-orange bg-white py-3.5 text-base font-bold text-papufy-orange transition hover:bg-sky-50 disabled:opacity-60 lg:flex"
          >
            <IconChat className="h-5 w-5" />
            {actionLoading
              ? "Abrindo..."
              : hasChat
                ? "Chat"
                : "Chat"}
          </button>
        )}

        {!isOwner && isClosed && (
          <p className="mt-5 rounded-lg bg-gray-100 py-3 text-center text-sm text-papufy-muted">
            Anúncio encerrado
          </p>
        )}

        {isOwner && job.status === "OPEN" && (
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-full border border-amber-300 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            Encerrar anúncio
          </button>
        )}

        {isOwner && interests.length > 0 && (
          <div className="mt-5 border-t border-papufy-border pt-4">
            <p className="text-xs font-semibold uppercase text-papufy-muted">
              Interessados ({interests.length})
            </p>
            <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
              {interests.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate font-medium">
                    {item.profissional.nome}
                  </span>
                  {item.conversationId && (
                    <button
                      type="button"
                      onClick={() => onRespond(item.conversationId!)}
                      className="shrink-0 text-xs font-bold text-papufy-orange hover:underline"
                    >
                      Chat
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="hidden rounded-xl border border-dashed border-papufy-border bg-gray-50 py-8 text-center text-xs text-papufy-muted lg:block">
        publicidade
      </div>
    </aside>
  );
}
