import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Emit `.next/standalone` — a self-contained server bundle with only the
   * traced `node_modules` files. Keeps the Docker runtime image small and lets
   * the container run `node server.js` without installing dependencies.
   * Ignored by Vercel, which uses its own build output.
   */
  output: "standalone",
};

export default nextConfig;
