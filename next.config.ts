import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all files in the public/unity folder
        source: "/unity/:path*",
        headers: [
          // Ensure wasm files are served with the correct MIME type
          { key: "Content-Type", value: "application/octet-stream" },
          // Allow range requests and caching for large assets
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
