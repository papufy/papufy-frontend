import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { JobDetailMobileBar } from "../components/JobDetailMobileBar";
import { JobDetailSidebar } from "../components/JobDetailSidebar";
import { JobImageGallery } from "../components/JobImageGallery";
import { Layout } from "../components/Layout";
import { IconHeart, IconShare } from "../components/icons/NavIcons";
import {
  CATEGORY_META,
  type JobCategory,
} from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Job, JobInterestItem } from "../types";
import { formatLocation } from "../utils/format";

type LocationState = { intent?: string };

function formatPostDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day}/${month} às ${hours}:${mins}`;
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [interests, setInterests] = useState<JobInterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const chatIntentHandled = useRef(false);

  const loadJob = useCallback(async () => {
    if (!id) return;
    const { job: data } = await api.jobs.getById(id);
    setJob(data);
    if (data.isOwner) {
      const { interests: list } = await api.jobs.listInterests(id);
      setInterests(list);
    } else {
      setInterests([]);
    }
    return data;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    loadJob()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Serviço não encontrado.")
      )
      .finally(() => setLoading(false));
  }, [id, loadJob, isAuthenticated]);

  const openChatWithAdvertiser = useCallback(async () => {
    if (!id || !job) return;

    if (!isAuthenticated) {
      navigate("/entrar", {
        state: { redirect: `/trabalho/${id}`, intent: "chat" },
      });
      return;
    }

    if (job.isOwner || user?.id === job.userId) {
      showToast("Este é o seu anúncio.", "info");
      return;
    }

    if (job.status === "CLOSED") {
      showToast("Este serviço já foi encerrado.", "info");
      return;
    }

    setActionLoading(true);
    try {
      if (job.myConversationId) {
        navigate(`/chat/${job.myConversationId}`);
        return;
      }

      const result = await api.jobs.registerInterest(id);
      setJob((prev) =>
        prev ? { ...prev, myConversationId: result.conversationId } : prev
      );
      navigate(`/chat/${result.conversationId}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível abrir o chat.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }, [id, job, isAuthenticated, navigate, showToast, user?.id]);

  useEffect(() => {
    const intent = (location.state as LocationState)?.intent;
    if (
      authLoading ||
      loading ||
      !job ||
      intent !== "chat" ||
      chatIntentHandled.current
    ) {
      return;
    }
    chatIntentHandled.current = true;
    window.history.replaceState({}, document.title);
    void openChatWithAdvertiser();
  }, [
    authLoading,
    loading,
    job,
    location.state,
    openChatWithAdvertiser,
  ]);

  const handleShare = () => {
    const url = `${window.location.origin}/trabalho/${id}`;
    navigator.clipboard.writeText(url);
    showToast("Link copiado!", "success");
  };

  const handleClose = async () => {
    if (!id) return;
    try {
      const { job: updated } = await api.jobs.close(id);
      setJob(updated);
      showToast("Anúncio encerrado.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  if (loading) {
    return (
      <Layout showCategories={false}>
        <div className="page-container animate-pulse py-4 sm:py-6">
          <div className="mb-4 h-4 w-1/2 rounded bg-gray-200" />
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="h-[420px] rounded-xl bg-gray-200" />
            <div className="h-80 rounded-xl bg-gray-200" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout showCategories={false}>
        <div className="page-container py-12 text-center sm:py-16">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <Link to="/" className="mt-4 inline-block text-papufy-orange hover:underline">
            Voltar para a Home
          </Link>
        </div>
      </Layout>
    );
  }

  const meta =
    CATEGORY_META[job.categoria as JobCategory] ??
    CATEGORY_META["Serviços Domésticos"];

  const isOwner = job.isOwner || user?.id === job.userId;
  const isClosed = job.status === "CLOSED";
  const hasChat = !!job.myConversationId;

  return (
    <Layout showCategories={false}>
      <article
        className={`page-container py-3 sm:py-4 lg:py-6 ${
          !isOwner && !isClosed ? "pb-32 lg:pb-6" : ""
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
          <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-xs text-papufy-muted sm:text-sm">
            <Link to="/" className="hover:text-papufy-orange hover:underline">
              Início
            </Link>
            <span className="text-papufy-border">›</span>
            <span className="text-papufy-text">{job.categoria}</span>
            <span className="text-papufy-border">›</span>
            <span className="hidden font-medium text-papufy-text sm:line-clamp-1 sm:inline sm:max-w-md">
              {job.titulo}
            </span>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <span className="hidden text-xs text-papufy-muted sm:inline sm:text-sm">
              {formatPostDate(job.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => {
                setFavorited((f) => !f);
                showToast(
                  favorited ? "Removido dos favoritos." : "Salvo nos favoritos.",
                  "info"
                );
              }}
              className={`touch-target rounded-full p-2 transition hover:bg-gray-100 ${
                favorited ? "text-papufy-orange" : "text-papufy-muted"
              }`}
              aria-label="Favoritar"
            >
              <IconHeart className={favorited ? "fill-current" : ""} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="touch-target rounded-full p-2 text-papufy-muted transition hover:bg-gray-100 hover:text-papufy-orange"
              aria-label="Compartilhar"
            >
              <IconShare />
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="min-w-0 space-y-4 lg:space-y-6">
            <JobImageGallery categoria={job.categoria} titulo={job.titulo} />

            <div className="lg:hidden">
              <JobDetailSidebar
                job={job}
                isOwner={isOwner}
                isClosed={isClosed}
                hasChat={hasChat}
                actionLoading={actionLoading}
                interests={interests}
                onChat={() => void openChatWithAdvertiser()}
                onClose={handleClose}
                onRespond={(convId) => navigate(`/chat/${convId}`)}
              />
            </div>

            <div>
              <span
                className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${meta.color}`}
              >
                {job.categoria}
              </span>
              <h1 className="mt-2 text-xl font-bold leading-snug text-papufy-text sm:mt-3 sm:text-2xl lg:text-[28px]">
                {job.titulo}
              </h1>
              <p className="mt-2 text-sm text-papufy-muted">
                {formatLocation(job.cidade, job.uf, job.bairro)}
                {(job.interesses ?? 0) > 0 && (
                  <span>
                    {" "}
                    · {job.interesses} interessado
                    {job.interesses !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>

            <section className="rounded-xl border border-papufy-border bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-papufy-text sm:text-lg">
                Descrição
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-papufy-text sm:mt-4 sm:text-base">
                {job.descricao}
              </p>
              {job.cep && (
                <p className="mt-4 text-sm text-papufy-muted">CEP: {job.cep}</p>
              )}
            </section>
          </div>

          <div className="hidden lg:block">
            <JobDetailSidebar
              job={job}
              isOwner={isOwner}
              isClosed={isClosed}
              hasChat={hasChat}
              actionLoading={actionLoading}
              interests={interests}
              onChat={() => void openChatWithAdvertiser()}
              onClose={handleClose}
              onRespond={(convId) => navigate(`/chat/${convId}`)}
            />
          </div>
        </div>

        {!isOwner && !isClosed && (
          <JobDetailMobileBar
            job={job}
            hasChat={hasChat}
            actionLoading={actionLoading}
            onChat={() => void openChatWithAdvertiser()}
          />
        )}

        <div className="mt-6 rounded-xl border border-dashed border-papufy-border bg-gray-50 py-8 text-center text-sm text-papufy-muted lg:mt-8 lg:py-12">
          publicidade
        </div>
      </article>
    </Layout>
  );
}
