import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import remarkToc from "remark-toc";
import { remarkReadingTime } from "./src/plugins/reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://prakhar.codes",
  prefetch: true,
  adapter: vercel({
    functionPerRoute: false,
  }),
  markdown: {
    remarkPlugins: [
      [
        //configure to show h2 and h1 as well
        remarkToc,
        {
          headings: ["h1", "h2"],
          ordered: false,
          tight: true,
        },
      ],
      remarkReadingTime,
    ],
    shikiConfig: {
      wrap: true,
      theme: "one-dark-pro",
    },
  },
  vite: {
    server: {
      allowedHosts: true,
    },
  },
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    react({}),
  ],
});
