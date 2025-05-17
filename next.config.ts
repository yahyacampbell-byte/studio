
import type {NextConfig} from 'next';

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
  // The env block is removed. Next.js automatically makes NEXT_PUBLIC_
  // prefixed variables available to the browser if they are set in the
  // Node.js environment during build/dev server startup.
};

export default nextConfig;
