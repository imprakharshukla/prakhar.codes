import type { APIRoute } from "astro";
import {
  SITE,
  getPublishedBlog,
  getPublishedProjects,
  getPublishedTravel,
  header,
} from "../lib/llms";

/**
 * /llms-full.txt — the header plus the full source markdown of every published
 * project, blog post, and travel entry inlined, so an LLM can ingest the whole
 * site in one fetch. Regenerated from the content collections on every build.
 */
function entryBlock(title: string, url: string, body: string): string {
  return `## ${title}\n\n${url}\n\n${body.trim()}`;
}

export const GET: APIRoute = async () => {
  const [projects, blog, travel] = await Promise.all([
    getPublishedProjects(),
    getPublishedBlog(),
    getPublishedTravel(),
  ]);

  const blocks: string[] = [header()];

  if (projects.length) {
    blocks.push("---\n\n# Projects");
    for (const entry of projects) {
      blocks.push(
        entryBlock(entry.data.title, `${SITE}/projects/${entry.id}/`, entry.body ?? ""),
      );
    }
  }

  if (blog.length) {
    blocks.push("---\n\n# Blog");
    for (const entry of blog) {
      blocks.push(
        entryBlock(entry.data.title, `${SITE}/blog/${entry.id}/`, entry.body ?? ""),
      );
    }
  }

  if (travel.length) {
    blocks.push("---\n\n# Travel");
    for (const entry of travel) {
      blocks.push(
        entryBlock(
          `${entry.data.place}, ${entry.data.state}, ${entry.data.country}`,
          `${SITE}/travel/${entry.id}/`,
          entry.body ?? "",
        ),
      );
    }
  }

  return new Response(blocks.join("\n\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
