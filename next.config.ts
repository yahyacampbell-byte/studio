
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // allowedDevOrigins: ['http://9003-firebase-studio-1747331156407.cluster-ve345ymguzcd6qqzuko2qbxtfe.cloudworkstations.dev'], // Removed to address "Unrecognized key" warning
  },
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
    NEXT_PUBLIC_COGNITFIT_CLIENT_ID: process.env.cognifit_id_public,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.fb_public_api_key,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.fb_public_auth_domain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.fb_public_project_id,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.fb_public_storage_bucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.fb_public_msg_sender_id,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.fb_public_app_id,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.fb_public_measurement_id,
  }
};

export default nextConfig;
