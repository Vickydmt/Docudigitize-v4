/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle the cloudflare:sockets module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "cloudflare:sockets": false,
      "pg-native": false,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    };

    // Exclude problematic modules from the build
    config.module.rules.push({
      test: /node_modules\/pg|node_modules\/pg-cloudflare|node_modules\/natural\/lib\/natural\/util\/storage/,
      use: 'null-loader',
    });

    return config;
  },
};

export default nextConfig;
