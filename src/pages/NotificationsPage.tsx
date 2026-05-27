import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        <header>
          <h1 className="text-lg font-bold text-papufy-text">Notificações</h1>
          <p className="mt-1 text-xs text-papufy-muted">
            {unreadCount > 0
              ? `${unreadCount} mensagem${unreadCount > 1 ? "ns" : ""} não lida${unreadCount > 1 ? "s" : ""}`
              : "Você está em dia"}
          </p>
        </header>

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() =>
                void refreshConversations({ force: true }).catch(() => undefined)
              }
              className="mt-3 text-sm font-bold text-sky-600"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          unreadConversations.length === 0 &&
          readConversations.length === 0 && (
            <p className="rounded-xl border border-dashed border-papufy-border bg-white px-4 py-8 text-center text-sm text-papufy-muted">
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
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-papufy-muted">
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
    <Link
      to={`/chat/${conversation.id}`}
      className={`block rounded-xl border bg-white p-4 shadow-sm transition active:scale-[0.99] ${
        hasUnread ? "border-sky-200" : "border-papufy-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`truncate text-sm ${
            hasUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"
          }`}
        >
          {conversation.otherUser?.nome ?? "Usuário"}
        </p>
        {when && (
          <span className="shrink-0 text-[10px] text-papufy-muted">{when}</span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-papufy-muted">{preview}</p>
    </Link>
  );
}
