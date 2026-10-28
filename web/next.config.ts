import type { NextConfig } from "next";

// Derriere un reverse proxy / tunnel (Codespaces, VPS avec Nginx/Caddy, etc.)
// qui transmet son propre host interne plutot que le host public, Next.js
// bloque par defaut les Server Actions (protection CSRF) car l'origine vue
// par le navigateur ne correspond pas a celle vue par le serveur. On peut
// lister des hotes de confiance supplementaires via la variable d'env
// SERVER_ACTIONS_ALLOWED_ORIGINS (liste separee par des virgules), par
// exemple "*.app.github.dev" pour les Codespaces.
const allowedOrigins = process.env.SERVER_ACTIONS_ALLOWED_ORIGINS?.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: "standalone",
  ...(allowedOrigins?.length
    ? {
        allowedDevOrigins: allowedOrigins,
        experimental: {
          serverActions: { allowedOrigins },
        },
      }
    : {}),
};

export default nextConfig;
