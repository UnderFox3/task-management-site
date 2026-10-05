import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialise the Cloudflare platform proxy during `next dev` so that
// Cloudflare bindings (including D1) are available via getCloudflareContext().
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
