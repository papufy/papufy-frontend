import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Job } from "../types";
import { formatPrice, formatRelativeTime } from "../utils/format";

export function MyJobsPage() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { jobs: data } = await api.jobs.listMine();
      setJobs(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao carregar publicações.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleClose = async (id: string) => {
    try {
      await api.jobs.close(id);
      showToast("Serviço encerrado.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  const handleReopen = async (id: string) => {
    try {
      await api.jobs.reopen(id);
      showToast("Serviço reaberto.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este anúncio permanentemente?")) return;
    try {
      await api.jobs.remove(id);
      showToast("Anúncio excluído.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro.", "error");
    }
  };

  return (
    <Layout showCategories={false}>
      <div className="page-container mx-auto max-w-4xl py-5 sm:py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-papufy-text">
              Minhas publicações
            </h1>
            <p className="text-sm text-papufy-muted">
              Gerencie seus anúncios e acompanhe interessados.
            </p>
          </div>
          <Link
            to="/anunciar"
            className="rounded-lg bg-papufy-orange px-4 py-2.5 text-sm font-bold text-white"
          >
            + Novo serviço
          </Link>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="rounded-2xl border border-papufy-border bg-white p-12 text-center">
            <p className="font-semibold">Você ainda não publicou nenhum serviço.</p>
            <Link
              to="/anunciar"
              className="mt-4 inline-block text-papufy-orange hover:underline"
            >
              Anunciar agora
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-papufy-border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-papufy-muted">
                      {formatRelativeTime(job.createdAt)}
                    </span>
                  </div>
                  <Link
                    to={`/trabalho/${job.id}`}
                    className="mt-2 block text-lg font-bold hover:text-papufy-orange"
                  >
                    {job.titulo}
                  </Link>
                  <p className="text-sm font-semibold text-papufy-text">
                    {formatPrice(job.preco ?? null, job.aCombinar)}
                  </p>
                  <p className="text-xs text-papufy-muted">
                    {job.interesses ?? 0} interessado
                    {(job.interesses ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/trabalho/${job.id}`}
                    className="rounded-lg border border-papufy-border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                  >
                    Ver
                  </Link>
                  {job.status === "OPEN" ? (
                    <button
                      type="button"
                      onClick={() => handleClose(job.id)}
                      className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-50"
                    >
                      Encerrar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReopen(job.id)}
                      className="rounded-lg border border-green-300 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50"
                    >
                      Reabrir
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(job.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}
