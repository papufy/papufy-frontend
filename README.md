# Papufy Frontend

React + Vite + Tailwind — deploy **Vercel** only.

## Deploy

1. Importe [github.com/kleidsonadesign/papufy-frontend](https://github.com/kleidsonadesign/papufy-frontend).
2. Framework: **Vite** · Output: `dist`
3. Variáveis (Production + Preview):

```
VITE_API_URL=https://sua-api.onrender.com
VITE_WS_URL=wss://sua-api.onrender.com/ws
```

Somente produção: a build exige `VITE_API_URL` HTTPS (Render). URLs locais são rejeitadas.
