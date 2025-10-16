import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/labs/:path*',
        destination: 'https://labs.google' + '/:path*', // Matched parameters can be used in the destination
      },
    ]
  },
};

export default nextConfig;
