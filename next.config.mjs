/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.replicate.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'replicate.delivery',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
