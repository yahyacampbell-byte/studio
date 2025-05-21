
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
  // No explicit 'env' block here for NEXT_PUBLIC_ variables.
  // Next.js automatically handles NEXT_PUBLIC_ prefixed variables
  // if they are available in process.env during build time.
  // apphosting.yaml should provide these for deployed builds.
};

export default nextConfig;
