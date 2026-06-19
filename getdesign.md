# Papufy Design System (getdesign.md)

> Referência visual para agentes e desenvolvedores. Stack: **shadcn/ui**, **21st.dev**, **React Bits** (animações leves).

## Brand

- **Tom principal:** azul céu → azul (`sky-400` / `sky-500` / `blue-500`)
- **CTA primário:** gradiente `from-sky-500 to-blue-500`, texto branco, sombra `shadow-sky-200/50`
- **Evitar:** laranja em botões, roxo, temas escuros por padrão (app é light-first)

## Tokens de cor

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-papufy-brand` | `#38bdf8` | Links, ícones ativos |
| `--color-papufy-brand-dark` | `#0ea5e9` | Hover CTA |
| `--color-papufy-brand-deep` | `#0284c7` | Preços, ênfase |
| `--color-papufy-bg` | `#f5f9fc` | Fundo da página |
| `--color-papufy-surface` | `#ffffff` | Cards, header |
| `--color-papufy-text` | `#0f172a` | Títulos |
| `--color-papufy-muted` | `#64748b` | Subtítulos |
| `--color-papufy-border` | `#e2e8f0` | Bordas |

shadcn `--primary` mapeado para sky-500 (oklch).

## Tipografia

- **Sans:** Geist Variable (shadcn) com fallback Segoe UI / system-ui
- **Títulos de seção:** `text-lg font-bold tracking-tight` (mobile) → `text-xl` (desktop)
- **Corpo:** `text-sm` / `text-base`, `text-muted-foreground` para secundário

## Espaçamento e raio

- **Container:** `page-container` / `mobile-gutter`, max-width `1280px`
- **Cards:** `rounded-xl` ou `rounded-2xl`
- **Botões CTA:** `rounded-xl` (formulários) ou `rounded-full` (header/anunciar)
- **Gap de seção:** `gap-4` mobile, `gap-6` desktop

## Componentes (shadcn)

| Padrão | Componente |
|--------|------------|
| Botão primário | `<Button variant="papufy" size="cta">` |
| Botão secundário | `<Button variant="outline">` |
| Card de conteúdo | `<Card>` + `CardHeader` / `CardContent` |
| Input de formulário | `<Input>` + `<Label>` |
| Badge de status | `<Badge variant="secondary">` |
| Loading | `<Skeleton>` (preferir a spinners pesados) |
| Sheet mobile | `<Sheet>` para filtros e menus |

## Animações (React Bits)

- Máximo **2 efeitos por página** (performance)
- Usar `FadeContent` para entradas de seção no desktop; **desligado no mobile**
- Sem GSAP em rotas críticas (home, busca, detalhe)
- `prefers-reduced-motion`: respeitar e mostrar conteúdo estático

## Performance

- Lazy routes mantidos (`React.lazy`)
- Imagens: `loading="lazy"`, dimensões explícitas no hero
- Infinite scroll com `IntersectionObserver` (já existente)
- Evitar bibliotecas de animação pesadas no bundle principal

## Do's

- Usar tokens Papufy + variantes shadcn
- Manter botões no gradiente azul
- Cards com borda sutil e sombra leve
- Touch targets ≥ 44px no mobile

## Don'ts

- Não inventar novas cores de CTA
- Não empilhar mais de 2 animações React Bits por view
- Não substituir lazy loading por componentes síncronos pesados
