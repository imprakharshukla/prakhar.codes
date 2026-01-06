import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { Category, ProjectStatus, ProjectType } from "./types";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    publish: z.boolean().default(false),
    link: z.string().url().optional(),
    linkTitle: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    category: z.nativeEnum(Category).optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const project = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/project" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    link: z.string().url().optional(),
    github: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    pubDate: z.coerce.date(),
    publish: z.boolean().default(false),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    type: z.nativeEnum(ProjectType).optional(),
    languages: z.array(z.string()).optional(),
    frameworks: z.array(z.string()).optional(),
  }),
});

const travel = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/travel" }),
  schema: z.object({
    place: z.string(),
    tags: z.array(z.string()).optional(),
    date: z.coerce.date(),
    pubDate: z.coerce.date(),
    publish: z.boolean().default(false),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    state: z.string(),
    country: z.string(),
    description: z.string(),
    location: z.array(z.number()).length(2),
    size: z.number().optional(),
  }),
});

export const collections = { blog, project, travel };
