import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fastembed", "onnxruntime-node", "@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/libonnxruntime.so.1*"],
  },
};

export default nextConfig;
