import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Search, Wrench } from "lucide-react";
import { MobileShell } from "../components/mobile/MobileShell";
import { MotionEnter, MotionPressButton } from "../components/motion/MotionPrimitives";
import { ProtectedRoute } from "../components/ProtectedRoute";
import type { ListingType } from "../types";

const CHOICES: Array<{
  type: ListingType;
  kicker: string;
  title: string;
  subtitle: string;
  examples: string[];
  gradient: string;
  icon: typeof Search;
}> = [
  {
    type: "JOB_VACANCY",
    kicker: "Preciso de ajuda",
    title: "Procurar um serviço",
    subtitle: "Publique o problema e receba propostas perto de você.",
    examples: ["Pintura", "Encanamento", "Limpeza", "Montagem"],
    gradient: "from-teal-500 to-cyan-600",
    icon: Search,
  },
  {
    type: "PROFESSIONAL_PROFILE",
    kicker: "Eu presto serviço",
    title: "Oferecer o que eu faço",
    subtitle: "Mostre seu trabalho para clientes da sua região.",
    examples: ["Eletricista", "Diarista", "Pintor", "Aulas"],
    gradient: "from-sky-500 to-blue-600",
    icon: Wrench,
  },
];

function AnunciarTipoContent() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [going, setGoing] = useState<ListingType | null>(null);

  const go = (listingType: ListingType) => {
    if (going) return;
    setGoing(listingType);
    window.setTimeout(() => {
      navigate("/anunciar", { state: { listingType } });
    }, reduce ? 0 : 180);
  };

  return (
    <MobileShell>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col overflow-x-hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <MotionEnter>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="touch-target -ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-slate-600 active:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-600">
            Anúncio grátis
          </p>
          <h1 className="mt-1 text-[1.65rem] font-extrabold leading-tight tracking-tight text-slate-900">
            O que você quer publicar?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Escolha um caminho. São 3 passos rápidos no celular.
          </p>
        </MotionEnter>

        <div className="mt-5 flex flex-1 flex-col gap-3">
          {CHOICES.map((choice, index) => {
            const Icon = choice.icon;
            const active = going === choice.type;
            return (
              <MotionEnter key={choice.type} delay={60 + index * 60}>
                <MotionPressButton
                  type="button"
                  disabled={Boolean(going)}
                  onClick={() => go(choice.type)}
                  className="w-full text-left"
                >
                  <motion.div
                    className={`rounded-3xl bg-gradient-to-br p-[1.5px] ${choice.gradient} ${
                      active ? "shadow-lg" : "shadow-sm"
                    }`}
                    animate={active && !reduce ? { scale: 0.98 } : { scale: 1 }}
                  >
                    <div className="rounded-[1.4rem] bg-white p-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${choice.gradient}`}
                        >
                          <Icon className="h-6 w-6" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            {choice.kicker}
                          </p>
                          <h2 className="text-lg font-extrabold leading-snug text-slate-900">
                            {choice.title}
                          </h2>
                        </div>
                        <ArrowRight
                          className={`h-5 w-5 shrink-0 ${
                            choice.type === "JOB_VACANCY"
                              ? "text-teal-500"
                              : "text-sky-500"
                          }`}
                        />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {choice.subtitle}
                      </p>
                      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {choice.examples.map((ex) => (
                          <span
                            key={ex}
                            className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </MotionPressButton>
              </MotionEnter>
            );
          })}
        </div>

        <p className="mt-4 pb-2 text-center text-xs text-slate-400">
          Toque em um card para começar
        </p>
      </div>
    </MobileShell>
  );
}

export function AnunciarTipoPage() {
  return (
    <ProtectedRoute>
      <AnunciarTipoContent />
    </ProtectedRoute>
  );
}
