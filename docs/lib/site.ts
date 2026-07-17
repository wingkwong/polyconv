const defaultSiteUrl = "https://polyconv-docs.vercel.app";

export const siteConfig = {
  name: "Polyconv",
  title: "Polyconv - Structured Data Format Conversion Toolkit",
  description:
    "Polyconv is a modular TypeScript toolkit and CLI for structured data format conversion across JSON, TOML, YAML, XML, CSV, TSV, INI, ENV, Markdown, HTML, and query strings.",
  shortDescription: "A modular TypeScript toolkit and CLI for structured data format conversion.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl,
  ogImage: "https://github.com/user-attachments/assets/5242709b-8f13-40f0-a99e-2469566d9bb8",
  repositoryUrl: "https://github.com/wingkwong/polyconv",
  npmUrl: "https://www.npmjs.com/search?q=%40polyconv",
  cliNpmUrl: "https://www.npmjs.com/package/@polyconv/cli",
  author: {
    name: "WK Wong",
    url: "https://github.com/wingkwong",
  },
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export const softwareStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "Polyconv",
  description: siteConfig.description,
  url: siteConfig.url,
  codeRepository: siteConfig.repositoryUrl,
  license: "https://github.com/wingkwong/polyconv/blob/develop/LICENSE",
  programmingLanguage: "TypeScript",
  runtimePlatform: "Node.js 22+",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  author: {
    "@type": "Person",
    name: siteConfig.author.name,
    url: siteConfig.author.url,
  },
  softwareRequirements: "Node.js 22+",
  keywords: [
    "structured data conversion",
    "json converter",
    "toml converter",
    "yaml",
    "xml",
    "csv",
    "tsv",
    "ini",
    "env",
    "markdown",
    "html",
    "query string",
    "typescript",
    "cli",
  ],
};
