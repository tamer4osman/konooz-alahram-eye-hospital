import type {NextConfig} from 'next';

// Content-Security-Policy is generated per-request in proxy.ts (nonce-based);
// static headers here cannot carry a per-request nonce.
const securityHeaders = [
  {key: 'X-Frame-Options', value: 'DENY'},
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['*.run.app', 'localhost:3000'],
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/webp'],
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
