import { useState } from "react";
import type { TransactionReview } from "../../types";

interface TransactionReviewPanelProps {
  transactionId: string;
  existingReview: TransactionReview | null | undefined;
  professionalName?: string;
  submitting?: boolean;
  onSubmit: (input: { rating: number; comment?: string }) => Promise<void>;
}

function StarButton({
  index,
  selected,
  onSelect,
}: {
  index: number;
  selected: boolean;
  onSelect: (rating: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className="p-0.5 transition active:scale-90"
      aria-label={`${index} estrela${index > 1 ? "s" : ""}`}
    >
      <svg
        viewBox="0 0 20 20"
        className={`h-7 w-7 ${selected ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
        aria-hidden
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  );
}

export function TransactionReviewPanel({
  transactionId,
  existingReview,
  professionalName,
  submitting = false,
  onSubmit,
}: TransactionReviewPanelProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  if (existingReview) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2.5">
        <p className="text-xs font-semibold text-emerald-800">
          Avaliação enviada — {existingReview.rating} estrela
          {existingReview.rating > 1 ? "s" : ""}
        </p>
        {existingReview.comment && (
          <p className="mt-1 text-xs text-emerald-700">{existingReview.comment}</p>
        )}
        <p className="mt-1.5 text-[11px] text-emerald-700/90">
          O anúncio deste serviço foi encerrado automaticamente.
        </p>
      </div>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
      <p className="text-xs font-semibold text-slate-800">
        Como foi o serviço
        {professionalName ? ` de ${professionalName.split(" ")[0]}` : ""}?
      </p>
      <p className="mt-0.5 text-[11px] text-slate-600">
        O pagamento foi liberado. Sua avaliação ajuda outros clientes.
      </p>

      <div
        className="mt-2 flex items-center gap-0.5"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onMouseEnter={() => setHoverRating(star)}
          >
            <StarButton
              index={star}
              selected={displayRating >= star}
              onSelect={setRating}
            />
          </span>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Comentário opcional (ex.: pontual, caprichoso...)"
        className="mt-2 w-full rounded-lg border border-amber-100 bg-white px-3 py-2 text-xs outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
      />

      <button
        type="button"
        disabled={rating < 1 || submitting}
        onClick={() =>
          void onSubmit({
            rating,
            comment: comment.trim() || undefined,
          })
        }
        className="mt-2 w-full rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {submitting ? "Enviando avaliação..." : "Enviar avaliação"}
      </button>
      <p className="sr-only" aria-live="polite">
        Transação {transactionId}
      </p>
    </div>
  );
}
