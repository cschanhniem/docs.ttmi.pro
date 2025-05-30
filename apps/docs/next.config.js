/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Only set basePath for GitHub Pages, not for Cloudflare Pages
  basePath: process.env.GITHUB_PAGES === 'true' ? '/erp-docs' : '',
  assetPrefix: process.env.GITHUB_PAGES === 'true' ? '/erp-docs/' : '',
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  experimental: {
    mdxRs: false,
  },
}

module.exports = nextConfig
