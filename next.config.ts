import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      }
    ],
    // Reduce cache filename length by using a smaller hash
    minimumCacheTTL: 60,
    formats: ['image/webp'],
  },
};

export default nextConfig;
