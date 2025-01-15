import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['i.ibb.co','placeholder.com', 'localhost']
  }
};

export default nextConfig;
