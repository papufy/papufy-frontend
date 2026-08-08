/** Bancos mais usados no Brasil (código COMPE) para onboarding de conta. */
export const BRAZIL_BANKS = [
  { code: "001", name: "Banco do Brasil" },
  { code: "033", name: "Santander" },
  { code: "104", name: "Caixa Econômica Federal" },
  { code: "237", name: "Bradesco" },
  { code: "341", name: "Itaú Unibanco" },
  { code: "260", name: "Nubank" },
  { code: "077", name: "Banco Inter" },
  { code: "212", name: "Banco Original" },
  { code: "336", name: "C6 Bank" },
  { code: "422", name: "Safra" },
  { code: "070", name: "BRB" },
  { code: "756", name: "Sicoob" },
  { code: "748", name: "Sicredi" },
  { code: "041", name: "Banrisul" },
  { code: "389", name: "Mercado Pago" },
  { code: "290", name: "PagSeguro" },
  { code: "380", name: "PicPay" },
  { code: "197", name: "Stone" },
  { code: "208", name: "BTG Pactual" },
  { code: "623", name: "Banco Pan" },
  { code: "655", name: "Votorantim / Neon" },
  { code: "121", name: "Agibank" },
  { code: "136", name: "Unicred" },
  { code: "085", name: "Ailos / Cooperativas" },
  { code: "637", name: "Sofisa" },
  { code: "218", name: "BS2" },
  { code: "735", name: "Neon" },
  { code: "364", name: "Gerencianet / Efí" },
  { code: "403", name: "Cora" },
] as const;

export type BrazilBankCode = (typeof BRAZIL_BANKS)[number]["code"];

export function bankLabel(code: string, name: string): string {
  return `${code} — ${name}`;
}
