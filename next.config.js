/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    VIMEO_TOKEN: process.env.VIMEO_TOKEN,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  },
  // Optimize for production performance
  experimental: {
    serverComponentsExternalPackages: ['axios'],
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    domains: ['i.vimeocdn.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
