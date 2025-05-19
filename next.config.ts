
import type {NextConfig} from 'next';

// Note: .env files are automatically loaded by Next.js in local development.
// For deployed environments (like Firebase App Hosting),
// environment variables should be defined in apphosting.yaml.

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, 
  },
  eslint: {
    ignoreDuringBuilds: false, 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.xillo.io',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // The 'env' block is removed to rely on standard NEXT_PUBLIC_ variable handling.
  // NEXT_PUBLIC_ variables defined in .env (for local dev) or apphosting.yaml (for deployment)
  // should be automatically inlined by Next.js if available at build time.
};

export default nextConfig;
