import { useToast } from "../context/ToastContext";

const styles = {
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-[calc(12rem+env(safe-area-inset-bottom,0px))] z-[200] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-[slideIn_0.25s_ease-out] rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${styles[t.type]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
