import type { JobStatus } from "../types";

export function StatusBadge({ status }: { status: JobStatus }) {
  if (status === "OPEN") {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
        Aberto
      </span>
    );
  }
  return (
    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
      Encerrado
    </span>
  );
}
