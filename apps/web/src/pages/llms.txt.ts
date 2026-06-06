import type { APIRoute } from "astro";
import {
  getPublishedBlog,
  getPublishedProjects,
  getPublishedTravel,
  header,
  link,
} from "../lib/llms";

/**
 * /llms.txt — a curated index of the site for LLMs (https://llmstxt.org).
 * Regenerated from the content collections on every build.
 */
export const GET: APIRoute = async () => {
  const [projects, blog, travel] = await Promise.all([
    getPublishedProjects(),
    getPublishedBlog(),
    getPublishedTravel(),
  ]);

  const sections: string[] = [header()];

  if (projects.length) {
    sections.push(
      "## Projects\n\n" +
        projects
          .map((entry) =>
            link(`/projects/${entry.id}/`, entry.data.title, entry.data.description),
          )
          .join("\n"),
    );
  }

  if (blog.length) {
    sections.push(
      "## Blog\n\n" +
        blog
          .map((entry) =>
            link(`/blog/${entry.id}/`, entry.data.title, entry.data.description),
          )
          .join("\n"),
    );
  }

  if (travel.length) {
    sections.push(
      "## Travel\n\n" +
        travel
          .map((entry) =>
            link(
              `/travel/${entry.id}/`,
              `${entry.data.place}, ${entry.data.state}, ${entry.data.country}`,
              entry.data.description,
            ),
          )
          .join("\n"),
    );
  }

  sections.push(
    "## Optional\n\n" +
      [
        link("/life", "Life — movies, shows & workouts I'm tracking"),
        link("/rss.xml", "Blog RSS feed"),
        link("/llms-full.txt", "Full text of every post & project in one file"),
      ].join("\n"),
  );

  sections.push(
    "## Connect\n\n" +
      [
        link("/resume/latest", "Resume"),
        link("https://cal.com/imprakharshukla/30min", "Schedule a call"),
        link("https://github.com/imprakharshukla", "GitHub"),
        link("https://x.com/imprakharshukla", "X"),
        link("https://www.linkedin.com/in/iamprakharshukla/", "LinkedIn"),
      ].join("\n"),
  );

  return new Response(sections.join("\n\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
