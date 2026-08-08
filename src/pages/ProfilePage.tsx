import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Camera,
  ChevronRight,
  FileText,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "../components/Layout";
import { UploadZone } from "../components/mobile/UploadZone";
import { MotionEnter, MotionPressButton } from "../components/motion/MotionPrimitives";
import { BRAZIL_STATES } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import {
  getProfilePhotoUrl,
  removeProfilePhotoUrl,
  setProfilePhotoUrl,
} from "../lib/profilePhoto";
import type { Certificate, UserReputation } from "../types";

type Section = "menu" | "dados" | "docs" | "senha";

const QUICK_LINKS = [
  {
    to: "/carteira",
    label: "Carteira",
    hint: "Saldo e saque",
    icon: Wallet,
    tone: "from-sky-500 to-blue-600",
  },
  {
    to: "/minhas-publicacoes",
    label: "Anúncios",
    hint: "Seus posts",
    icon: Briefcase,
    tone: "from-teal-500 to-cyan-600",
  },
  {
    to: "/chat",
    label: "Mensagens",
    hint: "Conversas",
    icon: MessageCircle,
    tone: "from-indigo-500 to-sky-600",
  },
  {
    to: "/anunciar/tipo",
    label: "Anunciar",
    hint: "Publicar grátis",
    icon: Camera,
    tone: "from-blue-500 to-sky-500",
  },
] as const;

const ACCOUNT_ROWS = [
  {
    id: "dados" as const,
    label: "Dados pessoais",
    hint: "Nome, telefone e cidade",
    icon: UserRound,
  },
  {
    id: "docs" as const,
    label: "Documentos",
    hint: "Currículo e certificados",
    icon: FileText,
  },
  {
    id: "senha" as const,
    label: "Alterar senha",
    hint: "Proteja sua conta",
    icon: Lock,
  },
] as const;

function initials(name?: string) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [section, setSection] = useState<Section>("menu");
  const [loading, setLoading] = useState(false);
  const [curriculoProgress, setCurriculoProgress] = useState<number | undefined>();
  const [certProgress, setCertProgress] = useState<number | undefined>();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [nome, setNome] = useState(user?.nome ?? "");
  const [telefone, setTelefone] = useState(user?.telefone ?? "");
  const [dataNascimento, setDataNascimento] = useState(
    user?.dataNascimento?.slice(0, 10) ?? ""
  );
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

  useEffect(() => {
    if (!user) return;
    setNome(user.nome);
    setTelefone(user.telefone ?? "");
    setDataNascimento(user.dataNascimento?.slice(0, 10) ?? "");
    setCidade(user.cidade ?? "");
    setUf(user.uf ?? "PB");
    setProfilePhoto(getProfilePhotoUrl(user.id));
  }, [user]);

  const isCpfProfile =
    (user?.cpfCnpj?.replace(/\D/g, "") ?? "").length === 11;

  const locationLabel = [cidade || user?.cidade, uf || user?.uf]
    .filter(Boolean)
    .join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isCpfProfile && !dataNascimento) {
        showToast("Informe a data de nascimento.", "error");
        return;
      }
      const { user: updated } = await api.auth.updateProfile({
        nome,
        telefone: telefone || undefined,
        cidade,
        uf,
        dataNascimento: dataNascimento || undefined,
        senhaAtual: novaSenha ? senhaAtual : undefined,
        novaSenha: novaSenha || undefined,
      });
      localStorage.setItem("papufy_user", JSON.stringify(updated));
      showToast("Perfil atualizado!", "success");
      setSenhaAtual("");
      setNovaSenha("");
      setSection("menu");
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
      showToast("Foto atualizada.", "success");
    } catch {
      showToast("Não foi possível salvar a foto.", "error");
    } finally {
      setPhotoUploading(false);
    }
  };

  const clearProfilePhoto = () => {
    if (!user?.id) return;
    removeProfilePhotoUrl(user.id);
    setProfilePhoto(null);
    showToast("Foto removida.", "info");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 sm:text-sm";

  const sectionTitle =
    section === "dados"
      ? "Dados pessoais"
      : section === "docs"
        ? "Documentos"
        : section === "senha"
          ? "Senha"
          : "Visão geral";

  const photoButton = (
    <button
      type="button"
      onClick={() => photoInputRef.current?.click()}
      disabled={photoUploading}
      className="group relative shrink-0"
      aria-label="Alterar foto de perfil"
    >
      <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-full bg-white/20 text-xl font-extrabold ring-4 ring-white/30 lg:h-28 lg:w-28 lg:text-3xl lg:ring-[6px] lg:ring-white/40">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials(user?.nome)
        )}
      </span>
      <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sky-600 shadow-md ring-2 ring-sky-500 lg:h-9 lg:w-9">
        <Camera className="h-4 w-4" />
      </span>
    </button>
  );

  const statsCard = (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] lg:gap-0 lg:p-5 lg:shadow-md">
      <div className="text-center lg:px-2">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-500 lg:h-10 lg:w-10">
          <Star className="h-4 w-4 fill-amber-400 lg:h-5 lg:w-5" />
        </div>
        <p className="mt-1.5 text-base font-extrabold text-slate-900 lg:text-xl">
          {reputation?.averageRating != null
            ? reputation.averageRating.toFixed(1)
            : "—"}
        </p>
        <p className="text-[10px] font-semibold text-slate-400 lg:text-xs">
          Nota
        </p>
      </div>
      <div className="border-x border-slate-100 text-center lg:px-2">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600 lg:h-10 lg:w-10">
          <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />
        </div>
        <p className="mt-1.5 text-base font-extrabold text-slate-900 lg:text-xl">
          {reputation?.reviewCount ?? 0}
        </p>
        <p className="text-[10px] font-semibold text-slate-400 lg:text-xs">
          Avaliações
        </p>
      </div>
      <div className="text-center lg:px-2">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-600 lg:h-10 lg:w-10">
          <Briefcase className="h-4 w-4 lg:h-5 lg:w-5" />
        </div>
        <p className="mt-1.5 text-base font-extrabold text-slate-900 lg:text-xl">
          {reputation?.completedJobsCount ?? 0}
        </p>
        <p className="text-[10px] font-semibold text-slate-400 lg:text-xs">
          Feitos
        </p>
      </div>
    </div>
  );

  const quickLinksGrid = (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
      {QUICK_LINKS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-sky-200 hover:shadow-md active:scale-[0.98] lg:flex-col lg:items-start lg:gap-4 lg:p-5"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white lg:h-12 lg:w-12 lg:rounded-2xl ${item.tone}`}
          >
            <item.icon className="h-5 w-5 lg:h-6 lg:w-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-900 lg:text-base">
              {item.label}
            </span>
            <span className="block text-[11px] text-slate-500 lg:mt-0.5 lg:text-sm">
              {item.hint}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );

  const accountNav = (variant: "mobile" | "desktop") => (
    <div
      className={
        variant === "desktop"
          ? "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          : "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
      }
    >
      <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Conta
      </p>
      {ACCOUNT_ROWS.map((row, i, arr) => {
        const active = section === row.id;
        return (
          <MotionPressButton
            key={row.id}
            type="button"
            onClick={() => setSection(row.id)}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-sky-50/70 active:bg-slate-50 ${
              active ? "bg-sky-50" : ""
            } ${i < arr.length - 1 ? "border-b border-slate-50" : ""}`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                active
                  ? "bg-sky-600 text-white"
                  : "bg-sky-50 text-sky-600"
              }`}
            >
              <row.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-900">
                {row.label}
              </span>
              <span className="block text-xs text-slate-500">{row.hint}</span>
            </span>
            <ChevronRight
              className={`h-4 w-4 shrink-0 ${
                active ? "text-sky-500" : "text-slate-300"
              }`}
            />
          </MotionPressButton>
        );
      })}
    </div>
  );

  const sectionPanel = (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:p-8">
      <div className="mb-4 flex items-center gap-2 lg:mb-6">
        <button
          type="button"
          onClick={() => setSection("menu")}
          className="touch-target -ml-1 rounded-full px-2 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-50 active:bg-sky-50 lg:hidden"
        >
          ← Voltar
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-slate-900 lg:text-2xl">
            {sectionTitle}
          </h2>
          <p className="mt-0.5 hidden text-sm text-slate-500 lg:block">
            {section === "dados" &&
              "Atualize suas informações para propostas e pagamentos."}
            {section === "docs" &&
              "Envie currículo e certificados para reforçar sua credibilidade."}
            {section === "senha" &&
              "Use uma senha forte com letras e números."}
          </p>
        </div>
      </div>

      {section === "dados" && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-3.5 lg:grid lg:grid-cols-2 lg:gap-x-5 lg:gap-y-4 lg:space-y-0"
        >
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Nome</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Telefone
            </label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className={inputClass}
              inputMode="tel"
              placeholder="(83) 99999-9999"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Data de nascimento{isCpfProfile ? " *" : ""}
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className={inputClass}
              required={isCpfProfile}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Necessária para pagamentos e propostas (CPF).
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Cidade
            </label>
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">UF</label>
            <select
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className={inputClass}
            >
              {BRAZIL_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2 lg:flex lg:justify-end">
            <Button
              type="submit"
              variant="papufy"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-2xl lg:mt-2 lg:w-auto lg:min-w-[12rem] lg:px-8"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      )}

      {section === "docs" && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          <div className="space-y-4">
            {user?.curriculoUrl && (
              <a
                href={user.curriculoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-sky-50 px-3.5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                <FileText className="h-4 w-4" />
                Abrir currículo atual
                <ChevronRight className="ml-auto h-4 w-4" />
              </a>
            )}
            <UploadZone
              label="Currículo (PDF)"
              hint="Toque para enviar PDF"
              accept="application/pdf"
              progress={curriculoProgress}
              onFiles={handleCurriculo}
            />
          </div>
          <div className="space-y-4">
            <UploadZone
              label="Certificados"
              hint="Fotos da câmera ou galeria"
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
                      className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-sky-700 transition hover:bg-slate-100"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{c.nome}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {section === "senha" && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-3.5 lg:mx-auto lg:max-w-md lg:space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Senha atual
            </label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Nova senha
            </label>
            <input
              type="password"
              minLength={8}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <Button
            type="submit"
            variant="papufy"
            disabled={loading || !novaSenha}
            className="mt-2 h-12 w-full rounded-2xl"
          >
            {loading ? "Salvando..." : "Atualizar senha"}
          </Button>
        </form>
      )}
    </div>
  );

  const overviewDesktop = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Olá, {user?.nome?.split(/\s+/)[0] ?? "bem-vindo"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie sua conta, documentos e atalhos do Papufy.
        </p>
        <div className="mt-6">{quickLinksGrid}</div>
      </div>
      <div className="rounded-2xl border border-dashed border-sky-200 bg-gradient-to-br from-sky-50 to-white p-6">
        <p className="text-sm font-bold text-slate-800">Dica rápida</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Complete seus dados e documentos para receber mais propostas e
          liberar pagamentos com segurança.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="papufy"
            className="rounded-xl"
            onClick={() => setSection("dados")}
          >
            Completar dados
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => setSection("docs")}
          >
            Enviar documentos
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout showCategories={false}>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={photoUploading}
        onChange={(e) => void handleProfilePhoto(e.target.files?.[0])}
      />

      {/* ——— Mobile (inalterado no fluxo) ——— */}
      <div className="mx-auto w-full max-w-lg overflow-x-hidden pb-4 lg:hidden">
        <MotionEnter>
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 px-4 pb-8 pt-5 text-white">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl"
              aria-hidden
            />
            <div className="relative flex items-center gap-3.5">
              {photoButton}
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-extrabold tracking-tight">
                  {user?.nome ?? "Sua conta"}
                </h1>
                <p className="mt-0.5 truncate text-sm text-white/80">
                  {user?.email}
                </p>
                {locationLabel && (
                  <p className="mt-1.5 inline-flex max-w-full items-center gap-1 text-xs font-semibold text-white/90">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{locationLabel}</span>
                  </p>
                )}
              </div>
            </div>
            {profilePhoto && (
              <button
                type="button"
                onClick={clearProfilePhoto}
                className="relative mt-3 text-xs font-semibold text-white/80 underline-offset-2 active:underline"
              >
                Remover foto
              </button>
            )}
          </div>
        </MotionEnter>

        <div className="relative z-10 -mt-5 space-y-3 px-4">
          <MotionEnter delay={40}>{statsCard}</MotionEnter>

          {section === "menu" ? (
            <>
              <MotionEnter delay={70}>{quickLinksGrid}</MotionEnter>
              <MotionEnter delay={100}>{accountNav("mobile")}</MotionEnter>
              <MotionEnter delay={130}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-600 active:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </button>
              </MotionEnter>
            </>
          ) : (
            <MotionEnter>{sectionPanel}</MotionEnter>
          )}
        </div>
      </div>

      {/* ——— Desktop ——— */}
      <div className="hidden lg:block">
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700">
          <div
            className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl"
            aria-hidden
          />
          <div className="page-container relative py-10">
            <div className="flex items-end gap-6">
              {photoButton}
              <div className="min-w-0 flex-1 pb-1 text-white">
                <p className="text-sm font-semibold text-white/75">Minha conta</p>
                <h1 className="mt-1 truncate text-3xl font-extrabold tracking-tight">
                  {user?.nome ?? "Sua conta"}
                </h1>
                <p className="mt-1 truncate text-base text-white/80">
                  {user?.email}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {locationLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
                      <MapPin className="h-3.5 w-3.5" />
                      {locationLabel}
                    </span>
                  )}
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={clearProfilePhoto}
                      className="text-sm font-semibold text-white/80 underline-offset-2 hover:underline"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-container relative z-10 -mt-8 pb-12">
          <div className="grid grid-cols-[300px_minmax(0,1fr)] items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-8">
            <aside className="sticky top-24 space-y-4">
              <MotionEnter>{statsCard}</MotionEnter>
              <MotionEnter delay={40}>
                <button
                  type="button"
                  onClick={() => setSection("menu")}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                    section === "menu"
                      ? "border-sky-200 bg-sky-50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-sky-100 hover:bg-sky-50/50"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      section === "menu"
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Star className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">
                      Visão geral
                    </span>
                    <span className="block text-xs text-slate-500">
                      Atalhos e resumo
                    </span>
                  </span>
                </button>
              </MotionEnter>
              <MotionEnter delay={60}>{accountNav("desktop")}</MotionEnter>
              <MotionEnter delay={80}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </button>
              </MotionEnter>
            </aside>

            <main className="min-w-0">
              <MotionEnter key={section}>
                {section === "menu" ? overviewDesktop : sectionPanel}
              </MotionEnter>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
