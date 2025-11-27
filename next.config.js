remotePatterns: [
  {
    protocol: 'http',
    hostname: '**',
  },
  {
    protocol: 'https',
    hostname: '**',
  },
],
  unoptimized: false,
  },

webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      tls: false,
      net: false,
      fs: false,
    }
  }
  return config
},

  // Compression and optimization
  compress: true,
    productionBrowserSourceMaps: false,
      reactStrictMode: true,

        // Output configuration for server-side rendering
        output: 'standalone',
}

export default nextConfig
