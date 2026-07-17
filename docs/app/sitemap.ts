import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: absoluteUrl(page.url),
    lastModified: new Date(),
  }));
}
