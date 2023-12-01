/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;

module.exports = {
  env: {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    VIMEO_TOKEN: process.env.VIMEO_TOKEN,
    CONVERTKIT_API_KEY: process.env.CONVERTKIT_API_KEY,
    CONVERTKIT_FORM_ID: process.env.CONVERTKIT_FORM_ID,
  },
};
