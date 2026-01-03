import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);

    // Get title and image from query params
    const title = searchParams.get('title') || 'Prakhar Shukla';
    const image = searchParams.get('image') || 'https://prakhar.codes/og.png';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            position: 'relative',
          }}
        >
          {/* Background Image */}
          <img
            src={image}
            alt="Background"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Black to Transparent Gradient Overlay (Left to Right) */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 70%, transparent 100%)',
            }}
          />

          {/* Title Text on Left Side */}
          <div
            tw="flex flex-col justify-center items-start px-16 w-2/3"
            style={{
              position: 'relative',
              zIndex: 10,
            }}
          >
            <h1
              tw="text-6xl font-bold text-white"
              style={{
                lineHeight: 1.2,
                textShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </h1>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
};
