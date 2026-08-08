import { useMemo, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { bankLabel, BRAZIL_BANKS } from "../constants/banks";

interface BankComboboxProps {
  id?: string;
  value: string;
  disabled?: boolean;
  onChange: (bankCode: string) => void;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function resolveDisplay(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return "";
  const found = BRAZIL_BANKS.find((b) => b.code === trimmed);
  return found ? bankLabel(found.code, found.name) : trimmed;
}

export function BankCombobox({
  id = "ob-bank",
  value,
  disabled,
  onChange,
}: BankComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(() => resolveDisplay(value));
  const blurTimer = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BRAZIL_BANKS;
    return BRAZIL_BANKS.filter(
      (b) =>
        b.code.includes(onlyDigits(q) || q) ||
        b.name.toLowerCase().includes(q) ||
        bankLabel(b.code, b.name).toLowerCase().includes(q)
    );
  }, [query]);

  const commitTypedCode = (raw: string) => {
    const digits = onlyDigits(raw).slice(0, 3);
    if (digits.length >= 1) {
      const code = digits.padStart(3, "0").slice(-3);
      onChange(code);
      const found = BRAZIL_BANKS.find((b) => b.code === code);
      setQuery(found ? bankLabel(found.code, found.name) : code);
      return;
    }
    const byName = BRAZIL_BANKS.find(
      (b) => b.name.toLowerCase() === raw.trim().toLowerCase()
    );
    if (byName) {
      onChange(byName.code);
      setQuery(bankLabel(byName.code, byName.name));
      return;
    }
    onChange("");
    setQuery("");
  };

  const pick = (code: string, name: string) => {
    onChange(code);
    setQuery(bankLabel(code, name));
    setOpen(false);
  };

  return (
    <div className="relative mt-1">
      <div className="relative">
        <input
          id={id}
          type="text"
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder="Digite o nome, código ou escolha na lista"
          className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-3 pr-10 text-sm outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
          onFocus={() => {
            if (blurTimer.current) window.clearTimeout(blurTimer.current);
            setOpen(true);
          }}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setOpen(true);
            const digits = onlyDigits(next);
            if (digits.length >= 1 && digits.length <= 3 && /^\d+$/.test(next.trim())) {
              onChange(digits);
            }
          }}
          onBlur={() => {
            blurTimer.current = window.setTimeout(() => {
              setOpen(false);
              commitTypedCode(query);
            }, 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length === 1) {
                pick(filtered[0].code, filtered[0].name);
              } else {
                commitTypedCode(query);
                setOpen(false);
              }
            }
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400"
          aria-label="Abrir lista de bancos"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronsUpDown className="h-4 w-4" />
        </button>
      </div>

      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-slate-500">
              Nenhum banco na lista. Digite o código do banco (ex.: 341).
            </li>
          ) : (
            filtered.map((bank) => (
              <li key={bank.code}>
                <button
                  type="button"
                  role="option"
                  className={`flex w-full px-3 py-2.5 text-left text-sm hover:bg-sky-50 ${
                    value === bank.code
                      ? "bg-sky-50 font-semibold text-sky-800"
                      : "text-slate-800"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(bank.code, bank.name)}
                >
                  {bankLabel(bank.code, bank.name)}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {value && (
        <p className="mt-1 text-[11px] text-slate-500">
          Código usado: <span className="font-semibold text-slate-700">{value}</span>
        </p>
      )}
    </div>
  );
}
