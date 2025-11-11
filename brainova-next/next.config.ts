// next.config.ts
import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Одоогийн хавтасыг absolute path болгох
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  turbopack: {
    root: join(__dirname), // ABSOLUTE PATH
  },
};

export default nextConfig;