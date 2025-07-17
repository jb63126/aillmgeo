/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  redirects: async () => {
    return [];
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;
