import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fastembed", "onnxruntime-node", "@prisma/client", "prisma"],
};

export default nextConfig;
