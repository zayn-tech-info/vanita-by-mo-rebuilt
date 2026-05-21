import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import process from "node:process";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const hmrHost = env.VITE_HMR_HOST;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5137,
      host: true,
      allowedHosts: [".outray.app"],
      ...(hmrHost
        ? {
            hmr: {
              host: hmrHost,
              clientPort: 443,
              protocol: "wss",
            },
          }
        : {}),
    },
  };
});
