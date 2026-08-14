/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "axe-core",
    "surrealdb",
    "@sparticuz/chromium",
  ],
};

export default nextConfig;
