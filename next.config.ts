/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'carforyou.rentcarsoft.pl',
      },
    ],
  },
};

module.exports = nextConfig;