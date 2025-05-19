
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
  env: {
    // Expose FIREBASE_WEBAPP_CONFIG (available in App Hosting build environment)
    // to the client-side bundle as NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG.
    // This variable is a JSON string.
    NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG: process.env.FIREBASE_WEBAPP_CONFIG,
    // Also ensure NEXT_PUBLIC_COGNITFIT_CLIENT_ID is passed through if defined
    // in the build environment (e.g. from apphosting.yaml)
    NEXT_PUBLIC_COGNITFIT_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITFIT_CLIENT_ID,
  },
};

export default nextConfig;
