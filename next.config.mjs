/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["playwright", "playwright-core", "axe-core", "surrealdb"],
};

export default nextConfig;
