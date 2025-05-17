
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
  // Removed the env block as apphosting.yaml will define variables with standard Next.js names
};

export default nextConfig;
