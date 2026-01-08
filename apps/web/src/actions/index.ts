import { defineAction } from "astro:actions";
import { z } from "astro/zod";

export const server = {
  getLatestResume: defineAction({
    input: z.object({}),
    handler: async () => {
      const R2_PUBLIC_URL =
        import.meta.env.R2_PUBLIC_URL || "https://resume-cdn.prakhar.codes";

      try {
        // Fetch the latest.json from R2
        const response = await fetch(`${R2_PUBLIC_URL}/latest.json`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch resume metadata: ${response.statusText}`
          );
        }

        const metadata = (await response.json()) as {
          url: string;
          filename: string;
          timestamp: string;
          updatedAt: string;
        };

        return {
          url: metadata.url,
          filename: metadata.filename,
          updatedAt: metadata.updatedAt,
        };
      } catch (error) {
        console.error("Error fetching latest resume:", error);

        // Fallback to the old static resume if latest.json fails
        return {
          url: "/resume/Prakhar_Software_Engineer_Resume_2026.pdf",
          filename: "Prakhar_Software_Engineer_Resume_2026.pdf",
          updatedAt: new Date().toISOString(),
        };
      }
    },
  }),
};
