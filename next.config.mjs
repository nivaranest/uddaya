/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Resume parsers load pdf.js / zip readers at runtime; keep them out of the server bundle.
    serverComponentsExternalPackages: ["unpdf", "mammoth"],
  },
};

export default nextConfig;
