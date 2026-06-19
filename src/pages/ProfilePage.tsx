import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FadeContent } from "@/components/effects/FadeContent";
import { ShineBorder } from "@/components/effects/ShineBorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Layout } from "../components/Layout";
import { ReputationBlock } from "../components/ReputationBlock";
import { UploadZone } from "../components/mobile/UploadZone";
import { IconUser } from "../components/icons/NavIcons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BRAZIL_STATES } from "../constants/categories";
import { api } from "../lib/api";
import {
  getProfilePhotoUrl,
  removeProfilePhotoUrl,
  setProfilePhotoUrl,
} from "../lib/profilePhoto";
import type { Certificate, UserReputation } from "../types";

export function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [curriculoProgress, setCurriculoProgress] = useState<number | undefined>();
  const [certProgress, setCertProgress] = useState<number | undefined>();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [nome, setNome] = useState(user?.nome ?? "");
  const [telefone, setTelefone] = useState(user?.telefone ?? "");
  const [cidade, setCidade] = useState(user?.cidade ?? "");
  const [uf, setUf] = useState(user?.uf ?? "PB");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    getProfilePhotoUrl(user?.id)
  );
  const [reputation, setReputation] = useState<UserReputation | null>(null);

  const loadCerts = useCallback(async () => {
    try {
      const { certificates: list } = await api.user.listCertificates();
      setCertificates(list);
    } catch {
      setCertificates([]);
    }
  }, []);

  const loadReputation = useCallback(async () => {
    try {
      const { reputation: data } = await api.user.getReputation();
      setReputation(data);
    } catch {
      setReputation({
        averageRating: null,
        reviewCount: 0,
        completedJobsCount: 0,
      });
    }
  }, []);

  useEffect(() => {
    void loadCerts();
    void loadReputation();
  }, [loadCerts, loadReputation]);

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

  const handleProfilePhoto = async (file?: File) => {
    if (!file || !user?.id) return;
    if (!file.type.startsWith("image/")) {
      showToast("Selecione uma imagem válida.", "error");
      return;
    }

    setPhotoUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Erro ao ler imagem"));
        reader.readAsDataURL(file);
      });
      setProfilePhoto(dataUrl);
      setProfilePhotoUrl(user.id, dataUrl);
      showToast("Foto de perfil atualizada.", "success");
    } catch {
      showToast("Não foi possível salvar a foto de perfil.", "error");
    } finally {
      setPhotoUploading(false);
    }
  };

  const clearProfilePhoto = () => {
    if (!user?.id) return;
    removeProfilePhotoUrl(user.id);
    setProfilePhoto(null);
    showToast("Foto de perfil removida.", "info");
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

        {reputation && (
          <ReputationBlock
            reputation={reputation}
            subjectLabel="você"
          />
        )}

        <FadeContent>
        <ShineBorder borderRadius="1rem">
        <Card className="border-0 bg-gradient-to-br from-card to-sky-50/80 py-0 shadow-none ring-0">
          <CardContent className="p-4 sm:p-5">
          <h2 className="font-bold text-foreground">Carteira e saque</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte o saldo da sua subconta Asaas e solicite transferência Pix.
          </p>
          <Button variant="papufy" size="cta" className="mt-4 w-full sm:w-auto" asChild>
            <Link to="/carteira">Abrir carteira e sacar</Link>
          </Button>
          </CardContent>
        </Card>
        </ShineBorder>
        </FadeContent>

        <Card className="py-0 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
          <h2 className="font-bold text-foreground">Foto de perfil</h2>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <IconUser className="h-8 w-8" />
              )}
            </span>
            <div className="space-y-2">
              <label className="inline-flex cursor-pointer items-center">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>{photoUploading ? "Enviando..." : "Escolher foto"}</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={photoUploading}
                  onChange={(e) => void handleProfilePhoto(e.target.files?.[0])}
                />
              </label>
              {profilePhoto && (
                <button
                  type="button"
                  onClick={clearProfilePhoto}
                  className="block text-xs font-semibold text-red-600"
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>
          </CardContent>
        </Card>

        <Card className="py-0 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
          <h2 className="font-bold text-foreground">Documentos</h2>
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
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
        <Card className="py-0 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
          <h2 className="font-bold text-foreground">Dados pessoais</h2>
          <div>
            <Label>Nome</Label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="input-field mt-1"
              inputMode="tel"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cidade</Label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div>
              <Label>UF</Label>
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

          <Separator />
          <p className="text-sm font-medium text-muted-foreground">
            Alterar senha (opcional)
          </p>
          <div>
            <Label>Senha atual</Label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <Label>Nova senha</Label>
            <input
              type="password"
              minLength={8}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <Button
            type="submit"
            variant="papufy"
            size="cta"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
          </CardContent>
        </Card>
        </form>
      </div>
    </Layout>
  );
}
