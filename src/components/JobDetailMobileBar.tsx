import { IconChat } from "./icons/NavIcons";
import { formatPrice } from "../utils/format";
import type { Job } from "../types";

interface JobDetailMobileBarProps {
  job: Job;
  hasChat: boolean;
  actionLoading: boolean;
  onChat: () => void;
}

export function JobDetailMobileBar({
  job,
  hasChat,
  actionLoading,
  onChat,
}: JobDetailMobileBarProps) {
  const price = formatPrice(job.preco ?? null, job.aCombinar);

  return (
    <div className="fixed inset-x-0 bottom-[calc(11.5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-papufy-border bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold text-papufy-text">{price}</p>
          <p className="truncate text-xs text-papufy-muted">
            {job.criador?.nome ?? "Anunciante"}
          </p>
        </div>
        <button
          type="button"
          onClick={onChat}
          disabled={actionLoading}
          className="touch-target flex shrink-0 items-center justify-center gap-2 rounded-full bg-papufy-orange px-6 py-3 text-base font-bold text-white shadow-sm disabled:opacity-60"
        >
          <IconChat className="h-5 w-5" />
          {actionLoading ? "Abrindo..." : hasChat ? "Chat" : "Chat"}
        </button>
      </div>
    </div>
  );
}
