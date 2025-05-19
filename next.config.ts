
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
  // Explicitly define NEXT_PUBLIC_ variables here.
  // These values will be inlined into the client-side bundle.
  // This is a diagnostic step. Ideally, these should be picked up from .env or apphosting.yaml via process.env.
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyD4zAVc_JokKcstkZGzTUtxxNv62L6pgkE",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "app.xillo.io",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "brainbloom-g62l3",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "brainbloom-g62l3.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "437951574734",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:437951574734:web:2d1a91a8cf1ea47e68969f",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-N6XPLD3WRT",
    // Ensure NEXT_PUBLIC_COGNITFIT_CLIENT_ID is also defined here if it's used directly by client-side code
    // and not just by the SDK (which might read it from a different configuration point or needs it passed).
    // Based on current usage, it IS used directly in CognifitGamePage for the config object.
    NEXT_PUBLIC_COGNITFIT_CLIENT_ID: "322ede20ac6b8c88968da72d0efd3c51",
  }
};

export default nextConfig;
