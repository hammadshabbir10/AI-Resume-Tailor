/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['example.com', 'localhost'],
    },
    api: {
      bodyParser: {
        sizeLimit: '5mb',
      },
    },
  }
  
  module.exports = nextConfig