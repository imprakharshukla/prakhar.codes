import type { APIContext } from "astro";
import { html } from "satori-html";
import satori from "satori";
import sharp from "sharp";

export async function GET({ request }: APIContext) {
  try {
    const { searchParams } = new URL(request.url);

    // Get title and image from query params
    const title = searchParams.get("title") || "Prakhar Shukla";
    const imageUrl = searchParams.get("image") || "https://prakhar.codes/og.png";

    // Convert relative URLs to absolute URLs
    const absoluteImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `https://prakhar.codes${imageUrl}`;

    const markup = html(`
      <div style="height: 100%; width: 100%; display: flex; position: relative;">
        <!-- Background Image -->
        <img
          src="${absoluteImageUrl}"
          style="position: absolute; width: 100%; height: 100%; object-fit: cover;"
        />

        <!-- Black to Transparent Gradient Overlay (Left to Right) -->
        <div
          style="position: absolute; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 70%, transparent 100%);"
        ></div>

        <!-- Title Text on Left Side -->
        <div
          style="display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding-left: 64px; padding-right: 64px; width: 66%; position: relative; z-index: 10;"
        >
          <h1
            style="font-size: 60px; font-weight: 700; color: white; line-height: 1.2; text-shadow: 0 4px 12px rgba(0,0,0,0.5);"
          >
            ${title}
          </h1>
        </div>
      </div>
    `);

    const svg = await satori(markup, {
      width: 1200,
      height: 630,
      fonts: [],
    });

    const png = sharp(Buffer.from(svg)).png();
    const response = await png.toBuffer();

    return new Response(response, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
      },
    });
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
