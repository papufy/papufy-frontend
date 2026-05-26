import { useCallback, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { UploadZone } from "../components/mobile/UploadZone";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BRAZIL_STATES } from "../constants/categories";
import { api } from "../lib/api";
import type { Certificate } from "../types";

export function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [curriculoProgress, setCurriculoProgress] = useState<number | undefined>();
  const [certProgress, setCertProgress] = useState<number | undefined>();
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [nome, setNome] = useState(user?.nome ?? "");
  const [telefone, setTelefone] = useState(user?.telefone ?? "");
  const [cidade, setCidade] = useState(user?.cidade ?? "");
  const [uf, setUf] = useState(user?.uf ?? "PB");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const loadCerts = useCallback(async () => {
    try {
      const { certificates: list } = await api.user.listCertificates();
      setCertificates(list);
    } catch {
      setCertificates([]);
    }
  }, []);

  useEffect(() => {
    void loadCerts();
  }, [loadCerts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user: updated } = await api.auth.updateProfile({
        nome,
        telefone: telefone || undefined,
        cidade,
        uf,
        senhaAtual: novaSenha ? senhaAtual : undefined,
        novaSenha: novaSenha || undefined,
      });
      localStorage.setItem("papufy_user", JSON.stringify(updated));
      showToast("Perfil atualizado com sucesso!", "success");
      setSenhaAtual("");
      setNovaSenha("");
      window.location.reload();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao salvar perfil.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCurriculo = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setCurriculoProgress(10);
    try {
      await api.user.uploadCurriculo(file, setCurriculoProgress);
      setCurriculoProgress(100);
      showToast("Currículo enviado!", "success");
      setTimeout(() => setCurriculoProgress(undefined), 800);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro no upload.",
        "error"
      );
      setCurriculoProgress(undefined);
    }
  };

  const handleCertificados = async (files: File[]) => {
    if (!files.length) return;
    setCertProgress(10);
    try {
      await api.user.uploadCertificados(files, undefined, setCertProgress);
      setCertProgress(100);
      showToast("Certificado(s) enviado(s)!", "success");
      await loadCerts();
      setTimeout(() => setCertProgress(undefined), 800);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro no upload.",
        "error"
      );
      setCertProgress(undefined);
    }
  };

  return (
    <Layout showCategories={false}>
      <div className="page-container mx-auto max-w-lg space-y-6 py-5 sm:py-8">
        <div>
          <h1 className="text-xl font-extrabold text-papufy-text sm:text-2xl">
            Configurações
          </h1>
          <p className="mt-1 text-sm text-papufy-muted">
            {user?.email} · Currículo e certificados pelo celular
          </p>
        </div>

        <section className="space-y-4 rounded-2xl border border-papufy-border bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-bold text-papufy-text">Documentos</h2>
          {user?.curriculoUrl && (
            <p className="text-xs text-papufy-muted">
              Currículo atual:{" "}
              <a
                href={user.curriculoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sky-600"
              >
                abrir PDF
              </a>
            </p>
          )}
          <UploadZone
            label="Currículo (PDF)"
            hint="Toque para enviar seu Currículo (PDF) ou fotos de seus Certificados"
            accept="application/pdf"
            progress={curriculoProgress}
            onFiles={handleCurriculo}
          />
          <UploadZone
            label="Certificados e diplomas"
            hint="Toque para enviar fotos de seus Certificados (câmera ou galeria)"
            accept="image/*"
            multiple
            capture="environment"
            progress={certProgress}
            onFiles={handleCertificados}
          />
          {certificates.length > 0 && (
            <ul className="space-y-2">
              {certificates.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.arquivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-papufy-orange"
                  >
                    {c.nome}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-papufy-border bg-white p-4 shadow-sm sm:p-6"
        >
          <h2 className="font-bold text-papufy-text">Dados pessoais</h2>
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone</label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="input-field mt-1"
              inputMode="tel"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Cidade</label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">UF</label>
              <select
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                className="input-field mt-1"
              >
                {BRAZIL_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-papufy-border" />
          <p className="text-sm font-medium text-papufy-muted">
            Alterar senha (opcional)
          </p>
          <div>
            <label className="text-sm font-medium">Senha atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nova senha</label>
            <input
              type="password"
              minLength={8}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 font-bold text-white active:scale-95 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
