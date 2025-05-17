
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // allowedDevOrigins: ['http://9003-firebase-studio-1747331156407.cluster-ve345ymguzcd6qqzuko2qbxtfe.cloudworkstations.dev'], // Removed to address "Unrecognized key" warning
  },
  typescript: {
    ignoreBuildErrors: false, // Changed to false
  },
  eslint: {
    ignoreDuringBuilds: false, // Changed to false
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
};

export default nextConfig;
