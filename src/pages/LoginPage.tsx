import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PapufyLogo } from "../components/PapufyLogo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BRAZIL_STATES } from "../constants/categories";

export function LoginPage() {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const loginState = (location.state as {
    redirect?: string;
    intent?: string;
  } | null) ?? {};
  const redirect = loginState.redirect || "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("Campina Grande");
  const [uf, setUf] = useState("PB");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, senha);
      } else {
        await register({
          nome,
          email,
          senha,
          telefone: telefone || undefined,
          cidade,
          uf,
        });
      }
      showToast(mode === "login" ? "Bem-vindo de volta!" : "Conta criada!", "success");
      navigate(redirect, {
        replace: true,
        state: loginState.intent ? { intent: loginState.intent } : undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro na autenticação.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showCategories={false}>
      <div className="page-container mx-auto max-w-md py-6 sm:py-12">
        <div className="mb-6 flex justify-center sm:mb-8">
          <PapufyLogo className="h-12 w-auto max-w-[14rem] object-contain sm:h-14" />
        </div>
        <div className="rounded-2xl border border-papufy-border bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold text-papufy-text">
            {mode === "login" ? "Entrar no Papufy" : "Criar conta rápida"}
          </h1>
          <p className="mt-2 text-sm text-papufy-muted">
            {mode === "login"
              ? "Acesse para anunciar serviços ou demonstrar interesse."
              : "Cadastro em segundos para publicar seu primeiro serviço."}
          </p>

          <div className="mt-6 flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-papufy-orange shadow-sm"
                  : "text-papufy-muted"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-white text-papufy-orange shadow-sm"
                  : "text-papufy-muted"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium">Nome completo</label>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Senha</label>
              <input
                type="password"
                required
                minLength={mode === "register" ? 8 : 1}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
              />
              {mode === "register" && (
                <p className="mt-1 text-xs text-papufy-muted">
                  Mínimo 8 caracteres, com letras e números.
                </p>
              )}
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label className="text-sm font-medium">
                    Telefone (opcional)
                  </label>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Cidade</label>
                    <input
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">UF</label>
                    <select
                      value={uf}
                      onChange={(e) => setUf(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                    >
                      {BRAZIL_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-papufy-orange py-3 font-bold text-white disabled:opacity-60"
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-papufy-muted">
            Demo: maria@papufy.com / Senha123 (após rodar o seed)
          </p>

          <Link
            to="/"
            className="mt-4 block text-center text-sm text-papufy-orange hover:underline"
          >
            Voltar para a Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
