import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileShell } from "../components/mobile/MobileShell";
import { MotionEnter, MotionPressButton } from "../components/motion/MotionPrimitives";
import { ProtectedRoute } from "../components/ProtectedRoute";
import type { ListingType } from "../types";

type Choice = {
  type: ListingType;
  kicker: string;
  title: string;
  subtitle: string;
  examples: string[];
  steps: string[];
  gradient: string;
  glow: string;
  iconBg: string;
  icon: typeof Search;
};

const CHOICES: Choice[] = [
  {
    type: "JOB_VACANCY",
    kicker: "Você precisa de ajuda",
    title: "Estou procurando um serviço",
    subtitle: "Conte o problema. Profissionais perto de você mandam propostas.",
    examples: ["Pintura", "Encanamento", "Limpeza", "Montagem"],
    steps: ["Categoria", "Detalhes", "Orçamento"],
    gradient: "from-teal-500 via-emerald-500 to-cyan-600",
    glow: "shadow-[0_20px_50px_-20px_rgba(16,185,129,0.55)]",
    iconBg: "bg-white/20 text-white",
    icon: Search,
  },
  {
    type: "PROFESSIONAL_PROFILE",
    kicker: "Você presta serviço",
    title: "Quero oferecer o que eu faço",
    subtitle: "Mostre seu trabalho. Clientes da região te encontram e chamam.",
    examples: ["Eletricista", "Diarista", "Pintor", "Aulas"],
    steps: ["Área", "Perfil", "Preços"],
    gradient: "from-sky-500 via-sky-600 to-blue-700",
    glow: "shadow-[0_20px_50px_-20px_rgba(14,165,233,0.55)]",
    iconBg: "bg-white/20 text-white",
    icon: Wrench,
  },
];

function AnunciarTipoContent() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<ListingType | null>(null);
  const [going, setGoing] = useState(false);

  const selectedChoice = CHOICES.find((c) => c.type === selected) ?? null;

  const go = (listingType: ListingType) => {
    setSelected(listingType);
    setGoing(true);
    window.setTimeout(() => {
      navigate("/anunciar", {
        state: { listingType },
      });
    }, reduce ? 0 : 280);
  };

  return (
    <MobileShell>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.28),_transparent_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-10 top-40 h-32 w-32 rounded-full bg-teal-300/20 blur-3xl"
          aria-hidden
        />

        <div className="page-container relative space-y-6 pb-8 pt-5">
          <MotionEnter>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <span className="inline-flex h-6 items-center rounded-full bg-white/80 px-2.5 ring-1 ring-sky-100 backdrop-blur">
                Anúncio grátis
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">leva menos de 2 min</span>
            </div>
            <h1 className="mt-3 max-w-md text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl">
              Como você quer aparecer no Papufy?
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              Toque em um caminho. O formulário muda pra ficar fácil no seu caso.
            </p>
          </MotionEnter>

          <div className="grid gap-4 sm:grid-cols-2" role="list">
            {CHOICES.map((choice, index) => {
              const Icon = choice.icon;
              const isSelected = selected === choice.type;
              return (
                <MotionEnter key={choice.type} delay={90 + index * 90}>
                  <MotionPressButton
                    type="button"
                    role="listitem"
                    disabled={going}
                    onClick={() => go(choice.type)}
                    className="group block w-full text-left"
                  >
                    <motion.div
                      layout
                      className={`relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-[1px] ${choice.gradient} ${
                        isSelected ? choice.glow : "shadow-lg shadow-sky-900/5"
                      }`}
                      animate={
                        isSelected && !reduce
                          ? { scale: 1.02 }
                          : { scale: 1 }
                      }
                    >
                      <div className="relative h-full rounded-[1.7rem] bg-white/95 p-5 backdrop-blur-sm sm:p-6">
                        <div
                          className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-20 blur-2xl ${choice.gradient}`}
                          aria-hidden
                        />
                        <div className="relative flex items-start justify-between gap-3">
                          <span
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${choice.gradient} text-white shadow-md`}
                          >
                            <Icon className="h-7 w-7" aria-hidden />
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-100 transition group-hover:bg-sky-50 group-hover:text-sky-700">
                            Escolher
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <p className="relative mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                          {choice.kicker}
                        </p>
                        <h2 className="relative mt-1 text-xl font-extrabold leading-snug text-slate-900">
                          {choice.title}
                        </h2>
                        <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
                          {choice.subtitle}
                        </p>

                        <div className="relative mt-4 flex flex-wrap gap-1.5">
                          {choice.examples.map((ex) => (
                            <span
                              key={ex}
                              className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>

                        <div className="relative mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                          {choice.steps.map((step, i) => (
                            <div key={step} className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                {i + 1}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {step}
                              </span>
                              {i < choice.steps.length - 1 && (
                                <span className="mx-0.5 h-px w-3 bg-slate-200" aria-hidden />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </MotionPressButton>
                </MotionEnter>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedChoice ? (
              <motion.div
                key={selectedChoice.type}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Abrindo: {selectedChoice.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Em seguida você escolhe a categoria e completa em 3 passos.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tips"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-3 sm:grid-cols-3"
              >
                {[
                  {
                    icon: Users,
                    text: "Gente da sua cidade",
                  },
                  {
                    icon: MessageCircle,
                    text: "Chat e propostas",
                  },
                  {
                    icon: MapPin,
                    text: "Pagamento pelo app",
                  },
                ].map((tip) => (
                  <div
                    key={tip.text}
                    className="flex items-center gap-2.5 rounded-2xl bg-white/80 px-3.5 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-100"
                  >
                    <tip.icon className="h-4 w-4 shrink-0 text-sky-500" />
                    {tip.text}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!selected && (
            <p className="text-center text-xs text-slate-400 sm:hidden">
              Toque em um card para começar
            </p>
          )}

          {selectedChoice && (
            <div className="sm:hidden">
              <Button
                type="button"
                variant="papufy"
                className="w-full"
                disabled={going}
                onClick={() => go(selectedChoice.type)}
              >
                Continuar
              </Button>
            </div>
          )}
        </div>
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
