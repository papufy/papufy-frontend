import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileShell } from "../components/mobile/MobileShell";
import { AutoAnimateList } from "../components/motion/AutoAnimateList";
import { MotionEnter } from "../components/motion/MotionPrimitives";
import { useChat } from "../context/ChatContext";
import { api } from "../lib/api";
import type { AppNotification, ConversationSummary } from "../types";
import { formatRelativeTime } from "../utils/format";

export function NotificationsPage() {
  const {
    unreadCount: chatUnread,
    conversations,
    conversationsLoading,
    refreshConversations,
  } = useChat();
  const [error, setError] = useState<string | null>(null);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(
    []
  );
  const [appUnread, setAppUnread] = useState(0);
  const [appLoading, setAppLoading] = useState(true);

  const loadApps = useCallback(async () => {
    setAppLoading(true);
    try {
      const [{ notifications }, { count }] = await Promise.all([
        api.notifications.list(),
        api.notifications.unreadCount(),
      ]);
      setAppNotifications(notifications);
      setAppUnread(count);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar notificações."
      );
    } finally {
      setAppLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApps();
    void refreshConversations({ force: conversations.length === 0 }).catch(
      () => undefined
    );
  }, [loadApps, refreshConversations, conversations.length]);

  const unreadApps = appNotifications.filter((n) => !n.readAt);
  const readApps = appNotifications.filter((n) => n.readAt);
  const unreadConversations = conversations.filter((c) => c.unread > 0);
  const readConversations = conversations.filter((c) => c.unread === 0);
  const loading =
    (appLoading || conversationsLoading) &&
    appNotifications.length === 0 &&
    conversations.length === 0;
  const totalUnread = chatUnread + appUnread;

  const markAll = async () => {
    try {
      await api.notifications.markAllRead();
      setAppUnread(0);
      setAppNotifications((list) =>
        list.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao marcar como lidas.");
    }
  };

  const openApp = async (n: AppNotification) => {
    if (n.readAt) return;
    try {
      await api.notifications.markRead(n.id);
      setAppUnread((c) => Math.max(0, c - 1));
      setAppNotifications((list) =>
        list.map((item) =>
          item.id === n.id
            ? { ...item, readAt: new Date().toISOString() }
            : item
        )
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <MobileShell>
      <div className="mobile-gutter space-y-4 py-4">
        <MotionEnter>
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">Notificações</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalUnread > 0
                  ? `${totalUnread} não lida${totalUnread > 1 ? "s" : ""}`
                  : "Você está em dia"}
              </p>
            </div>
            {appUnread > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={() => void markAll()}>
                Marcar avisos como lidos
              </Button>
            )}
          </header>
        </MotionEnter>

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
                onClick={() => void loadApps()}
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading &&
          !error &&
          appNotifications.length === 0 &&
          conversations.length === 0 && (
            <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </p>
          )}

        {!loading && unreadApps.length > 0 && (
          <MotionEnter delay={40}>
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-600">
                Avisos de anúncio
              </h2>
              <AutoAnimateList as="ul" className="space-y-2">
                {unreadApps.map((n) => (
                  <li key={n.id}>
                    <AppNotificationItem
                      notification={n}
                      onOpen={() => void openApp(n)}
                    />
                  </li>
                ))}
              </AutoAnimateList>
            </section>
          </MotionEnter>
        )}

        {!loading && unreadConversations.length > 0 && (
          <MotionEnter delay={60}>
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-600">
                Mensagens novas
              </h2>
              <AutoAnimateList as="ul" className="space-y-2">
                {unreadConversations.map((c) => (
                  <li key={c.id}>
                    <ChatNotificationItem conversation={c} />
                  </li>
                ))}
              </AutoAnimateList>
            </section>
          </MotionEnter>
        )}

        {!loading && (readApps.length > 0 || readConversations.length > 0) && (
          <MotionEnter delay={80}>
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Anteriores
              </h2>
              <AutoAnimateList as="ul" className="space-y-2">
                {readApps.map((n) => (
                  <li key={n.id}>
                    <AppNotificationItem notification={n} />
                  </li>
                ))}
                {readConversations.map((c) => (
                  <li key={c.id}>
                    <ChatNotificationItem conversation={c} />
                  </li>
                ))}
              </AutoAnimateList>
            </section>
          </MotionEnter>
        )}
      </div>
    </MobileShell>
  );
}

function AppNotificationItem({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen?: () => void;
}) {
  const hasUnread = !notification.readAt;
  return (
    <Link
      to={notification.href || "/minhas-publicacoes"}
      onClick={onOpen}
      className="block active:scale-[0.99]"
    >
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
                hasUnread
                  ? "font-bold text-foreground"
                  : "font-semibold text-foreground/80"
              }`}
            >
              {notification.title}
            </p>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {notification.body}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ChatNotificationItem({
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
                hasUnread
                  ? "font-bold text-foreground"
                  : "font-semibold text-foreground/80"
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
