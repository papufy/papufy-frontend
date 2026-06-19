import { IconChat } from "./icons/NavIcons";
import { Button } from "@/components/ui/button";
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
    <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-border bg-card/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold text-foreground">{price}</p>
          <p className="truncate text-xs text-muted-foreground">
            {job.criador?.nome ?? "Anunciante"}
          </p>
        </div>
        <Button
          type="button"
          variant="papufy"
          size="pill"
          onClick={onChat}
          disabled={actionLoading}
          className="shrink-0 gap-2 px-6"
        >
          <IconChat className="h-5 w-5" />
          {actionLoading ? "Abrindo..." : hasChat ? "Chat" : "Chat"}
        </Button>
      </div>
    </div>
  );
}
