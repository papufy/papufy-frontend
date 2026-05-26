import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { IconChevronLeft } from "../components/icons/NavIcons";
import { useChat } from "../context/ChatContext";
import { api } from "../lib/api";
import type { ChatMessage, ConversationSummary } from "../types";

export function ChatPage() {
  const { id: activeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const {
    unreadCount,
    connected,
    joinConversation,
    sendMessage,
    onMessage,
    refreshUnread,
  } = useChat();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const { conversations: list } = await api.chat.conversations();
      setConversations(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar chat.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoadingMessages(true);
      try {
        const { messages: list } = await api.chat.messages(conversationId);
        setMessages(list);
        joinConversation(conversationId);
        await refreshUnread();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar mensagens."
        );
      } finally {
        setLoadingMessages(false);
      }
    },
    [joinConversation, refreshUnread]
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeId) {
      void loadMessages(activeId);
    } else {
      setMessages([]);
    }
  }, [activeId, loadMessages]);

  useEffect(() => {
    return onMessage((msg) => {
      if (!activeId || msg.conversationId !== activeId) {
        void loadConversations();
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
  }, [activeId, onMessage, loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;

    const content = draft.trim();
    setDraft("");

    if (connected) {
      sendMessage(activeId, content);
      return;
    }

    try {
      const { message } = await api.chat.send(activeId, content);
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar.");
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);
  const showListOnMobile = !activeId;

  return (
    <Layout showCategories={false}>
      <div className="page-container flex min-h-[calc(100dvh-8rem)] flex-col py-3 sm:py-4 lg:min-h-[calc(100vh-180px)] lg:flex-row lg:gap-4 lg:py-6">
        <aside
          className={`flex w-full flex-col rounded-2xl border border-papufy-border bg-white lg:max-h-[calc(100vh-12rem)] lg:w-80 ${
            showListOnMobile ? "min-h-[50dvh] flex-1" : "hidden lg:flex"
          }`}
        >
          <div className="border-b border-papufy-border px-4 py-3">
            <h1 className="font-bold text-papufy-text">Mensagens</h1>
            <p className="text-xs text-papufy-muted">
              Conversas dos seus serviços
              {connected ? " · online" : " · reconectando..."}
              {unreadCount > 0 && (
                <span className="ml-2 font-semibold text-papufy-orange">
                  · {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loadingList && (
              <p className="p-4 text-sm text-papufy-muted">Carregando...</p>
            )}
            {error && !loadingList && (
              <p className="p-4 text-sm text-red-600">{error}</p>
            )}
            {!loadingList &&
              conversations.map((c) => (
                <Link
                  key={c.id}
                  to={`/chat/${c.id}`}
                  className={`touch-target block border-b border-papufy-border px-4 py-4 transition active:bg-sky-50 lg:py-3 lg:hover:bg-sky-50 ${
                    activeId === c.id ? "bg-sky-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-bold text-papufy-text">
                      {c.otherUser.nome}
                    </p>
                    {c.unread > 0 && (
                      <span className="shrink-0 rounded-full bg-papufy-orange px-2 py-0.5 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-1 text-xs text-papufy-muted">
                    {c.contextTitulo}
                  </p>
                  {c.lastMessage && (
                    <p className="mt-1 line-clamp-1 text-xs text-papufy-muted">
                      {c.lastMessage.isMine ? "Você: " : ""}
                      {c.lastMessage.content}
                    </p>
                  )}
                </Link>
              ))}
            {!loadingList && conversations.length === 0 && (
              <div className="p-4 text-sm text-papufy-muted">
                <p className="font-medium text-papufy-text">
                  Nenhuma conversa ainda
                </p>
                <p className="mt-2">
                  Abra um serviço e toque em <strong>Chat</strong> para iniciar.
                </p>
                <Link
                  to="/"
                  className="mt-4 inline-block font-semibold text-papufy-orange hover:underline"
                >
                  Ver serviços
                </Link>
              </div>
            )}
          </div>
        </aside>

        <section
          className={`flex min-h-0 flex-1 flex-col rounded-2xl border border-papufy-border bg-white ${
            activeId ? "min-h-[calc(100dvh-10rem)] flex-1" : "hidden lg:flex lg:min-h-[320px]"
          }`}
        >
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-papufy-muted">
              <p>Selecione uma conversa para continuar.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-papufy-border px-3 py-3 sm:px-4">
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  className="touch-target -ml-1 rounded-full p-2 text-papufy-muted hover:bg-gray-50 lg:hidden"
                  aria-label="Voltar às conversas"
                >
                  <IconChevronLeft />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-papufy-text">
                    {activeConversation?.otherUser.nome ?? "Conversa"}
                  </p>
                  <p className="truncate text-xs text-papufy-muted">
                    {activeConversation?.contextTitulo}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
                {loadingMessages && (
                  <p className="text-sm text-papufy-muted">Carregando mensagens...</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[80%] ${
                        m.isMine
                          ? "bg-papufy-orange text-white"
                          : "bg-gray-100 text-papufy-text"
                      }`}
                    >
                      {!m.isMine && (
                        <p className="mb-1 text-xs font-semibold opacity-70">
                          {m.senderNome}
                        </p>
                      )}
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex gap-2 border-t border-papufy-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="input-field min-h-11 flex-1 rounded-xl border border-papufy-border py-3 text-base outline-none focus:border-papufy-orange sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="touch-target shrink-0 rounded-xl bg-papufy-orange px-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  Enviar
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
