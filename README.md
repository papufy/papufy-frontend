# Papufy Frontend

React + Vite + Tailwind — deploy **Vercel** only.

## Deploy

1. Importe [github.com/papufy/papufy-frontend](https://github.com/papufy/papufy-frontend).
2. Framework: **Vite** · Output: `dist`
3. Variáveis (Production + Preview):

```
VITE_API_URL=https://sua-api.onrender.com
VITE_WS_URL=wss://sua-api.onrender.com/ws
```

Não há fallback para `localhost` — a build exige URLs de produção.
