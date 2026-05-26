import { useRef, useState } from "react";

function IconUpload({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 16V6m0 0l-4 4m4-4l4 4M5 20h14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  const isUploading =
    progress != null && progress > 0 && progress < 100;

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
        className={`flex min-h-[140px] w-full select-none flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 transition active:scale-[0.99] ${
          dragOver
            ? "border-sky-400 bg-sky-100/80"
            : "border-sky-300 bg-sky-50/50"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <IconUpload />
        </span>
        <span className="text-center text-sm font-semibold leading-snug text-slate-800">
          {hint}
        </span>
        <span className="text-center text-xs text-slate-500">
          PDF ou imagens · até o limite do seu plano
        </span>
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

      {(isUploading || progress === 100) && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{progress === 100 ? "Concluído" : "Enviando..."}</span>
            <span>{Math.round(progress ?? 0)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sky-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-300"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
