/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["playwright", "playwright-core", "axe-core", "postgres"],
};

export default nextConfig;
