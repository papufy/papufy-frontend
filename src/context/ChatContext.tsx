import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import { getWebSocketUrl } from "../lib/wsUrl";
import type { ChatMessage, ConversationSummary } from "../types";
import { useAuth } from "./AuthContext";

const CONVERSATIONS_CACHE_MS = 45_000;

type WsPayload =
  | { type: "connected"; userId: string }
  | { type: "message"; message: ChatMessage }
  | { type: "unread"; count: number }
  | { type: "joined"; conversationId: string }
  | { type: "error"; message: string };

interface RefreshConversationsOptions {
  force?: boolean;
}

interface ChatContextValue {
  unreadCount: number;
  connected: boolean;
  conversations: ConversationSummary[];
  conversationsLoading: boolean;
  refreshUnread: () => Promise<void>;
  refreshConversations: (
    options?: RefreshConversationsOptions
  ) => Promise<ConversationSummary[]>;
  joinConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  onMessage: (handler: (msg: ChatMessage) => void) => () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<(msg: ChatMessage) => void>>(new Set());
  const joinedRef = useRef<string | null>(null);
  const conversationsFetchedAtRef = useRef(0);
  const conversationsCacheRef = useRef<ConversationSummary[]>([]);
  const conversationsInflightRef = useRef<Promise<ConversationSummary[]> | null>(
    null
  );

  const refreshUnread = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const { count } = await api.chat.unread();
      setUnreadCount(count);
    } catch {
      /* API offline */
    }
  }, [token]);

  const refreshConversations = useCallback(
    async (options?: RefreshConversationsOptions) => {
      if (!token) {
        setConversations([]);
        conversationsCacheRef.current = [];
        conversationsFetchedAtRef.current = 0;
        return [];
      }

      const force = options?.force ?? false;
      const isFresh =
        !force &&
        conversationsCacheRef.current.length > 0 &&
        Date.now() - conversationsFetchedAtRef.current < CONVERSATIONS_CACHE_MS;

      if (isFresh) {
        return conversationsCacheRef.current;
      }

      if (conversationsInflightRef.current) {
        return conversationsInflightRef.current;
      }

      setConversationsLoading(true);

      const task = (async () => {
        try {
          const { conversations: list, unreadTotal } =
            await api.chat.conversations();
          conversationsCacheRef.current = list;
          setConversations(list);
          setUnreadCount(unreadTotal);
          conversationsFetchedAtRef.current = Date.now();
          return list;
        } catch (err) {
          if (conversationsCacheRef.current.length === 0) {
            throw err;
          }
          return conversationsCacheRef.current;
        } finally {
          setConversationsLoading(false);
          conversationsInflightRef.current = null;
        }
      })();

      conversationsInflightRef.current = task;
      return task;
    },
    [token]
  );

  const joinConversation = useCallback((conversationId: string) => {
    joinedRef.current = conversationId;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "join", conversationId })
      );
    }
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "send", conversationId, content })
        );
      }
    },
    []
  );

  const onMessage = useCallback((handler: (msg: ChatMessage) => void) => {
    handlersRef.current.add(handler);
    return () => handlersRef.current.delete(handler);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      setUnreadCount(0);
      setConversations([]);
      conversationsCacheRef.current = [];
      conversationsFetchedAtRef.current = 0;
      return;
    }

    void refreshConversations({ force: true });

    let ws: WebSocket;
    try {
      ws = new WebSocket(getWebSocketUrl(token));
    } catch {
      return;
    }
    wsRef.current = ws;

    ws.onerror = () => setConnected(false);

    ws.onopen = () => {
      setConnected(true);
      if (joinedRef.current) {
        ws.send(
          JSON.stringify({
            type: "join",
            conversationId: joinedRef.current,
          })
        );
      }
    };

    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as WsPayload;
        if (data.type === "unread") {
          setUnreadCount(data.count);
        }
        if (data.type === "message") {
          conversationsFetchedAtRef.current = 0;
          for (const h of handlersRef.current) {
            h(data.message);
          }
        }
      } catch {
        /* ignore */
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, token, refreshConversations]);

  const value = useMemo(
    () => ({
      unreadCount,
      connected,
      conversations,
      conversationsLoading,
      refreshUnread,
      refreshConversations,
      joinConversation,
      sendMessage,
      onMessage,
    }),
    [
      unreadCount,
      connected,
      conversations,
      conversationsLoading,
      refreshUnread,
      refreshConversations,
      joinConversation,
      sendMessage,
      onMessage,
    ]
  );

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat deve ser usado dentro de ChatProvider");
  }
  return ctx;
}
