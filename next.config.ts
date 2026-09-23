import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fastembed", "@prisma/client", "prisma"],
};

export default nextConfig;
