import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useChat } from "../context/ChatContext";
import { api } from "../lib/api";
import type { AppNotification } from "../types";
import { formatRelativeTime } from "../utils/format";
import { IconBell } from "./icons/NavIcons";

interface NotificationsMenuProps {
  variant?: "desktop" | "mobile";
}

export function NotificationsMenu({ variant = "desktop" }: NotificationsMenuProps) {
  const {
    unreadCount: chatUnread,
    conversations,
    conversationsLoading,
    refreshConversations,
  } = useChat();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(
    []
  );
  const [appUnread, setAppUnread] = useState(0);
  const [appLoading, setAppLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const previewChats = useMemo(() => conversations.slice(0, 3), [conversations]);
  const previewApps = useMemo(
    () => appNotifications.slice(0, 4),
    [appNotifications]
  );
  const totalUnread = chatUnread + appUnread;

  const loadAppNotifications = useCallback(async () => {
    setAppLoading(true);
    try {
      const [{ notifications }, { count }] = await Promise.all([
        api.notifications.list(),
        api.notifications.unreadCount(),
      ]);
      setAppNotifications(notifications);
      setAppUnread(count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar notificações."
      );
    } finally {
      setAppLoading(false);
    }
  }, []);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    void loadAppNotifications().catch(() => undefined);
    const timer = window.setInterval(() => {
      void loadAppNotifications().catch(() => undefined);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [loadAppNotifications]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    void loadAppNotifications().catch(() => undefined);
    void refreshConversations({ force: previewChats.length === 0 }).catch(
      (err) => {
        setError(
          err instanceof Error ? err.message : "Erro ao atualizar notificações."
        );
      }
    );
  }, [open, loadAppNotifications, refreshConversations, previewChats.length]);

  const wrapperClass =
    variant === "mobile" ? "relative lg:hidden" : "relative hidden lg:block";
  const panelClass =
    variant === "mobile"
      ? "absolute right-0 top-full z-50 mt-2 w-[20rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-papufy-border bg-white py-1 shadow-xl"
      : "absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-papufy-border bg-white py-1 shadow-xl";

  const unreadLabel = useMemo(() => {
    if (totalUnread <= 0) return "Notificações";
    return `Notificações, ${totalUnread} não lidas`;
  }, [totalUnread]);

  const showLoading =
    (conversationsLoading || appLoading) &&
    previewApps.length === 0 &&
    previewChats.length === 0;

  const handleOpenApp = async (n: AppNotification) => {
    setOpen(false);
    if (!n.readAt) {
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
    }
  };

  return (
    <div className={wrapperClass} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => {
          if (!open) {
            void refreshConversations();
            void loadAppNotifications();
          }
        }}
        onFocus={() => {
          void refreshConversations();
          void loadAppNotifications();
        }}
        className="touch-target relative rounded-full p-2 text-papufy-muted transition hover:bg-gray-50"
        aria-label={unreadLabel}
        aria-expanded={open}
      >
        <IconBell className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-bold text-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className={panelClass}>
          <p className="px-4 pb-2 pt-2 text-xs font-bold uppercase tracking-wide text-papufy-muted">
            Notificações
          </p>
          {showLoading && (
            <div className="space-y-2 px-4 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          )}
          {error && !showLoading && (
            <p className="px-4 py-4 text-sm text-red-600">{error}</p>
          )}
          {!showLoading &&
            !error &&
            previewApps.length === 0 &&
            previewChats.length === 0 && (
              <p className="px-4 py-4 text-sm text-papufy-muted">
                Nenhuma notificação no momento.
              </p>
            )}
          {!showLoading && previewApps.length > 0 && (
            <ul className="divide-y divide-papufy-border">
              {previewApps.map((n) => {
                const unread = !n.readAt;
                return (
                  <li key={n.id}>
                    <Link
                      to={n.href || "/minhas-publicacoes"}
                      onClick={() => void handleOpenApp(n)}
                      className="block px-4 py-3 transition hover:bg-sky-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            unread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-700"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-papufy-muted">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-papufy-muted">
                        {n.body}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {!showLoading && previewChats.length > 0 && (
            <>
              {previewApps.length > 0 && (
                <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-papufy-muted">
                  Mensagens
                </p>
              )}
              <ul className="divide-y divide-papufy-border">
                {previewChats.map((conversation) => {
                  const preview =
                    conversation.lastMessage?.content?.trim() || "Nova mensagem";
                  const when = conversation.lastMessage?.createdAt
                    ? formatRelativeTime(conversation.lastMessage.createdAt)
                    : "";
                  const hasUnread = conversation.unread > 0;
                  return (
                    <li key={conversation.id}>
                      <Link
                        to={`/chat/${conversation.id}`}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 transition hover:bg-sky-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              hasUnread
                                ? "font-bold text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {conversation.otherUser?.nome ?? "Usuário"}
                          </p>
                          {when && (
                            <span className="shrink-0 text-[10px] text-papufy-muted">
                              {when}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-papufy-muted">
                          {preview}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <div className="border-t border-papufy-border px-4 py-2">
            <Link
              to="/notificacoes"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-bold text-sky-600"
            >
              Ver todas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
