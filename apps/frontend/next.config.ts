import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Needed by next/jest: msw ships ESM and must be transpiled for the Jest tests.
  transpilePackages: ["msw", "@mswjs", "until-async", "renkei-next"],
};

export default withNextIntl(nextConfig);
