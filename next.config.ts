/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'carforyou.rentcarsoft.pl',
      },
    ],
  },
};

module.exports = nextConfig;