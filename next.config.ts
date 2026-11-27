import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user home dir confuses root detection.
  turbopack: { root: __dirname },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Product photos staff upload to Supabase Storage.
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' }],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
