import { defineCollection, z } from "astro:content";

export enum Category {
  Coding = "Coding",
  Stories = "Stories",
  Tutorials = "Tutorials",
  TIL = "TIL",
  Reviews = "Reviews",
  Opinion = "Opinion",
}

export enum ProjectStatus {
  InProgress = "In Progress",
  Completed = "Completed",
  Abandoned = "Abandoned",
}

export enum ProjectType {
  OpenSource = "Open Source",
  Personal = "Personal",
  Commercial = "Commercial",
  Community = "Community",
  Educational = "Educational",
  Research = "Research",
  Other = "Other",
}

const blog = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    publish: z.boolean().default(false),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    category: z.nativeEnum(Category).optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});
const project = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
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

export const collections = { blog, project };
