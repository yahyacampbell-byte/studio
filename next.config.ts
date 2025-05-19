
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
  // The env block is removed as the Firebase App Hosting adapter
  // likely overrides next.config.ts or has its own mechanism
  // for making NEXT_PUBLIC_ variables from apphosting.yaml or .env
  // available to the client-side build.
  // If client-side env vars are still missing, the issue is likely
  // with how the adapter processes apphosting.yaml or .env.
};

export default nextConfig;
