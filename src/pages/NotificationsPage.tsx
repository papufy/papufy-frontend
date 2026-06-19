import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FadeContent } from "@/components/effects/FadeContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileShell } from "../components/mobile/MobileShell";
import { useChat } from "../context/ChatContext";
import type { ConversationSummary } from "../types";
import { formatRelativeTime } from "../utils/format";

export function NotificationsPage() {
  const {
    unreadCount,
    conversations,
    conversationsLoading,
    refreshConversations,
  } = useChat();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshConversations({ force: conversations.length === 0 }).catch(
      (err) => {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar notificações."
        );
      }
    );
  }, [refreshConversations, conversations.length]);

  const unreadConversations = conversations.filter((c) => c.unread > 0);
  const readConversations = conversations.filter((c) => c.unread === 0);
  const loading = conversationsLoading && conversations.length === 0;

  return (
    <MobileShell>
      <div className="mobile-gutter space-y-4 py-4">
        <FadeContent>
          <header>
            <h1 className="text-lg font-bold text-foreground">Notificações</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} mensagem${unreadCount > 1 ? "ns" : ""} não lida${unreadCount > 1 ? "s" : ""}`
                : "Você está em dia"}
            </p>
          </header>
        </FadeContent>

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        )}

        {error && !loading && (
          <Card className="border-red-200 bg-red-50 py-0 shadow-none ring-0">
            <CardContent className="p-4 text-center text-sm text-red-700">
              <p>{error}</p>
              <Button
                type="button"
                variant="link"
                className="mt-3 text-sky-600"
                onClick={() =>
                  void refreshConversations({ force: true }).catch(() => undefined)
                }
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading &&
          !error &&
          unreadConversations.length === 0 &&
          readConversations.length === 0 && (
            <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </p>
          )}

        {!loading && unreadConversations.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-600">
              Novas
            </h2>
            <ul className="space-y-2">
              {unreadConversations.map((c) => (
                <li key={c.id}>
                  <NotificationItem conversation={c} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {!loading && readConversations.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Anteriores
            </h2>
            <ul className="space-y-2">
              {readConversations.map((c) => (
                <li key={c.id}>
                  <NotificationItem conversation={c} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </MobileShell>
  );
}

function NotificationItem({
  conversation,
}: {
  conversation: ConversationSummary;
}) {
  const hasUnread = conversation.unread > 0;
  const preview =
    conversation.lastMessage?.content?.trim() || "Nova mensagem";
  const when = conversation.lastMessage?.createdAt
    ? formatRelativeTime(conversation.lastMessage.createdAt)
    : "";

  return (
    <Link to={`/chat/${conversation.id}`} className="block active:scale-[0.99]">
      <Card
        size="sm"
        className={`py-0 shadow-sm transition ${
          hasUnread ? "ring-sky-200" : "ring-border/80"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`truncate text-sm ${
                hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/80"
              }`}
            >
              {conversation.otherUser?.nome ?? "Usuário"}
            </p>
            {when && (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {when}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {preview}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
