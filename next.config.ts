import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fastembed", "onnxruntime-node", "@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/**/*.so", "./node_modules/**/*.so.*"],
  },
};

export default nextConfig;
