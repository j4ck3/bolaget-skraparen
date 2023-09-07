/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
      },
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'product-cdn.systembolaget.se',
            pathname: '/productimages/**/*',
          },
          {
            protocol: 'https',
            hostname: 'sb-product-media-prod.azureedge.net',
            pathname: '/productimages/**/*',
          },
        ],
        
      },
}

module.exports = nextConfig
