import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL?.trim();

  if (!apiUrl || !apiUrl.startsWith("https://")) {
    throw new Error(
      "VITE_API_URL (HTTPS, URL do Render) é obrigatória. Configure na Vercel antes do build."
    );
  }
  if (/localhost|127\.0\.0\.1/i.test(apiUrl)) {
    throw new Error("VITE_API_URL não pode ser localhost — projeto só produção.");
  }

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
