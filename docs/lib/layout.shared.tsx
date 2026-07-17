import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { siteConfig } from "@/lib/site";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: siteConfig.name,
    },
    githubUrl: siteConfig.repositoryUrl,
    links: [
      {
        text: "npm",
        url: siteConfig.npmUrl,
        external: true,
      },
    ],
  };
}
