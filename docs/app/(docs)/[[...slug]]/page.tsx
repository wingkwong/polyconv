import { getMDXComponents } from "@/components/mdx";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { source } from "@/lib/source";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";

const mdxComponents = getMDXComponents();

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    return {};
  }

  const title = page.data.title;
  const description = page.data.description ?? siteConfig.shortDescription;

  return {
    title,
    description,
    alternates: {
      canonical: page.url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(page.url),
      images: [{ url: siteConfig.ogImage, alt: "Polyconv" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? <DocsDescription>{page.data.description}</DocsDescription> : null}
      <DocsBody>
        <MDX components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}
