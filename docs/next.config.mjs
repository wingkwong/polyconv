import { createMDX } from 'fumadocs-mdx/next';

const allowedDevOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean) ?? ['192.168.188.67'];

/** @type {import('next').NextConfig} */
const config = {
  allowedDevOrigins,
  reactStrictMode: true,
};

const withMDX = createMDX();

export default withMDX(config);
