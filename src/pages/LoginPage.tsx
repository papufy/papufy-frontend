import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShineBorder } from "@/components/effects/ShineBorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PapufyLogo } from "../components/PapufyLogo";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { useToast } from "../context/ToastContext";
import {
  digitsOnly,
  formatCpfCnpj,
  formatPhoneBr,
  validateCpfCnpjDigits,
} from "../utils/masks";

type AuthMode = "login" | "register";

const inputClass =
  "h-11 rounded-xl border-input bg-muted/40 pl-11 text-sm shadow-none focus-visible:border-sky-400 focus-visible:ring-sky-100/80";

function AuthField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-sky-500"
          aria-hidden
        >
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function IconUser() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 10-16 0" strokeLinecap="round" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconId() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10h8M8 14h5" strokeLinecap="round" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M6.5 4h3l1.5 4-2 1.2a11 11 0 005.8 5.8L17 13l4 1.5v3A2 2 0 0119.2 19 16 16 0 016 5.8 2 2 0 016.5 4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" strokeLinecap="round" />
    </svg>
  );
}

export function LoginPage() {
  const { login, register } = useAuth();
  const { filters } = useFilters();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const loginState = (location.state as {
    redirect?: string;
    intent?: string;
  } | null) ?? {};
  const redirect = loginState.redirect || "/";

  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email.trim(), senha);
        showToast("Bem-vindo de volta!", "success");
      } else {
        const cpfCnpjDigits = digitsOnly(cpfCnpj);
        const docError = validateCpfCnpjDigits(cpfCnpjDigits);
        if (docError) {
          setError(docError);
          setLoading(false);
          return;
        }

        const phoneDigits = digitsOnly(telefone);
        await register({
          nome: nome.trim(),
          email: email.trim(),
          senha,
          cpfCnpj: cpfCnpjDigits,
          telefone: phoneDigits.length > 0 ? phoneDigits : undefined,
          cidade: filters.cidade,
          uf: filters.uf,
        });
        showToast("Conta criada com sucesso!", "success");
      }

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
    <div className="min-h-[100dvh] bg-sky-50/30 px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <header className="mb-8 flex flex-col items-center text-center">
          <h1 className="m-0">
            <PapufyLogo className="h-12 w-auto max-w-[12rem] object-contain sm:h-14" />
          </h1>
          <p className="mt-4 max-w-xs text-sm text-slate-500">
            Acesse para anunciar serviços ou demonstrar interesse.
          </p>
        </header>

        <ShineBorder borderRadius="1rem" className="w-full shadow-xl shadow-sky-100/40">
          <Card className="border-0 py-0 shadow-none ring-0">
            <CardContent className="p-6 sm:p-8">
          <div className="flex rounded-xl bg-muted/80 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <AuthField label="Nome completo" icon={<IconUser />}>
                <input
                  required
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className={inputClass}
                />
              </AuthField>
            )}

            <AuthField label="E-mail" icon={<IconMail />}>
              <input
                type="email"
                required
                autoComplete={mode === "login" ? "email" : "username"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className={inputClass}
              />
            </AuthField>

            {mode === "register" && (
              <>
                <AuthField label="CPF / CNPJ" icon={<IconId />}>
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    className={inputClass}
                  />
                </AuthField>

                <AuthField label="Telefone / Celular" icon={<IconPhone />}>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhoneBr(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className={inputClass}
                  />
                </AuthField>
              </>
            )}

            <AuthField
              label="Senha"
              icon={<IconLock />}
            >
              <input
                type="password"
                required
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={mode === "register" ? 8 : 1}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder={
                  mode === "register" ? "Mín. 8 caracteres" : "Sua senha"
                }
                className={inputClass}
              />
            </AuthField>

            {mode === "register" && (
              <p className="text-xs leading-relaxed text-slate-500">
                Use letras e números na senha. CPF/CNPJ é usado para pagamentos
                seguros no marketplace.
              </p>
            )}

            {error && (
              <p
                className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="papufy"
              size="cta"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : "Cadastrar"}
            </Button>
          </form>

          <Link
            to="/"
            className="mt-6 block text-center text-sm font-semibold text-sky-600 active:opacity-80"
          >
            Voltar para a Home
          </Link>
            </CardContent>
          </Card>
        </ShineBorder>
      </div>
    </div>
  );
}
