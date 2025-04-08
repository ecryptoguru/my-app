import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
    // Add Turbopack configuration
    turbo: {
      resolveAlias: {
        'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.min.js',
      },
    },
  },
  // Add webpack configuration for PDF.js
  webpack: (config: WebpackConfig, { isServer }) => {
    // Ensure PDF.js worker is properly loaded
    if (!isServer && config.resolve && config.resolve.alias) {
      // Use type assertion to tell TypeScript this is a record of string keys
      (config.resolve.alias as Record<string, string>)['pdfjs-dist/build/pdf.worker.entry'] = 'pdfjs-dist/build/pdf.worker.min.js';
    }
    
    return config;
  },
};

export default config;
