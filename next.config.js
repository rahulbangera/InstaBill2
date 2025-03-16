/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["www.google.com", "sea1.ingest.uploadthing.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh", // Allows any subdomain of ufs.sh
      },
    ], // ✅ Add allowed hostnames
  },
};

export default config;
