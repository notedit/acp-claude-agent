import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@acp/protocol", "@acp/claude-agent"],
};

export default nextConfig;
