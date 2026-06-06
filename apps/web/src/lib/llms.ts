import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { experience } from "../data/experience";

/**
 * Shared helpers for the /llms.txt and /llms-full.txt endpoints.
 *
 * Both files are generated at build time from the content collections, so
 * publishing a new post/project/trip updates them automatically — there is
 * nothing to keep in sync by hand. See https://llmstxt.org for the format.
 */

export const SITE = "https://prakhar.codes";

export async function getPublishedProjects() {
  return (await getCollection("project"))
    .filter((entry) => entry.data.publish === true)
    .sort((a, b) => (a.data.rank ?? 999) - (b.data.rank ?? 999));
}

export async function getPublishedBlog() {
  return (await getCollection("blog"))
    .filter((entry) => entry.data.publish === true)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export async function getPublishedTravel() {
  return (await getCollection("travel"))
    .filter((entry) => entry.data.publish === true)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Title, one-line summary, and condensed work history shared by both files. */
export function header(): string {
  const experienceLines = experience
    .map((item) => `- ${item.designation} — ${item.company} (${item.date})`)
    .join("\n");

  return `# ${SITE_TITLE}

> ${SITE_DESCRIPTION}

## Experience

${experienceLines}`;
}

/**
 * A single markdown list item. `href` may be a site-relative path (prefixed
 * with the canonical origin) or an absolute external URL (used as-is).
 */
export function link(href: string, title: string, description?: string): string {
  const url = href.startsWith("http") ? href : `${SITE}${href}`;
  return description ? `- [${title}](${url}): ${description}` : `- [${title}](${url})`;
}
