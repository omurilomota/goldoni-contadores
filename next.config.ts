import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Uploads de documentos do portal (limite de 8 MB por arquivo + margem do multipart).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
