import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude electron and other node-specific modules from client-side bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        electron: false,
      };
      
      // Exclude problematic modules
      config.externals = config.externals || [];
      config.externals.push('electron');
    }
    
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'picsum.photos' },
  { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'cloudflare-ipfs.com' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080' },
    ],
  },
  // NOTE: Removed `experimental.esmExternals` to keep Turbopack compatible.
  // If you need to enable `esmExternals` for older tooling, add it behind
  // an environment guard or run Next.js with Webpack instead of Turbopack.
  env: {
    // Makes inference API URL available (also accessible via process.env.INFERENCE_API_URL at build time)
    INFERENCE_API_URL: process.env.INFERENCE_API_URL
  }
};

export default nextConfig;
