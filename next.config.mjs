/**
 * @type {import('next').NextConfig}
 */

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET,
  MONGODB_URI,
  NEXTAUTH_URL,
  TOKEN_SECRET,
} = process.env

const nextConfig = {
  env: {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET,
    MONGODB_URI,
    NEXTAUTH_URL,
    TOKEN_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
