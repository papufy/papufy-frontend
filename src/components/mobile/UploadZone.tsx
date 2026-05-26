import { useRef, useState } from "react";

interface UploadZoneProps {
  label: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  capture?: "environment" | "user";
  progress?: number;
  onFiles: (files: File[]) => void;
}

export function UploadZone({
  label,
  hint,
  accept,
  multiple = false,
  capture,
  progress,
  onFiles,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list?.length) return;
    onFiles(Array.from(list));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-papufy-text">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-[120px] w-full select-none flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition active:scale-[0.99] ${
          dragOver
            ? "border-papufy-orange bg-sky-50"
            : "border-papufy-border bg-gray-50"
        }`}
      >
        <span className="text-3xl">📎</span>
        <span className="text-center text-sm font-medium text-papufy-text">
          Toque para selecionar
        </span>
        <span className="text-center text-xs text-papufy-muted">{hint}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        capture={capture}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {progress != null && progress > 0 && progress < 100 && (
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-papufy-orange transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
