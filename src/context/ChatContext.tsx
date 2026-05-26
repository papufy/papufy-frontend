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
import type { ChatMessage } from "../types";
import { useAuth } from "./AuthContext";

type WsPayload =
  | { type: "connected"; userId: string }
  | { type: "message"; message: ChatMessage }
  | { type: "unread"; count: number }
  | { type: "joined"; conversationId: string }
  | { type: "error"; message: string };

interface ChatContextValue {
  unreadCount: number;
  connected: boolean;
  refreshUnread: () => Promise<void>;
  joinConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  onMessage: (handler: (msg: ChatMessage) => void) => () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<(msg: ChatMessage) => void>>(new Set());
  const joinedRef = useRef<string | null>(null);

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
      return;
    }

    void refreshUnread();

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
  }, [isAuthenticated, token, refreshUnread]);

  const value = useMemo(
    () => ({
      unreadCount,
      connected,
      refreshUnread,
      joinConversation,
      sendMessage,
      onMessage,
    }),
    [
      unreadCount,
      connected,
      refreshUnread,
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
