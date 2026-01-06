import { ImageResponse } from "next/og";
import { getDefaultDomain, getDomainConfig, isValidDomain } from "@/config/domains.config";

export const runtime = "edge";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domainParam = searchParams.get("domain");
  
  // Get domain config - use domain from query param if valid, otherwise default
  const domain = domainParam && isValidDomain(domainParam) 
    ? getDomainConfig(domainParam) 
    : getDefaultDomain();
  
  if (!domain) {
    return new Response("Domain not found", { status: 404 });
  }
  
  const displayName = domain.displayName;

  // Load fonts
  // Note: Geist is not available on Google Fonts, using Inter as a similar alternative
  const oxaniumFont = await loadGoogleFont("Oxanium:wght@600", displayName);
  const interRegular = await loadGoogleFont(
    "Inter:wght@400",
    domain.metadata.description
  );
  const interBold = await loadGoogleFont("Inter:wght@700", domain.metadata.title);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          backgroundColor: "#121113",
          padding: "80px 120px",
          position: "relative",
        }}
      >
        {/* Decorative accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #E78A53 0%, transparent 100%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "32px",
            flex: 1,
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              fontFamily: "Inter",
              color: "#cfcfcf",
              letterSpacing: "-0.02em",
              lineHeight: "1.2",
              margin: 0,
            }}
          >
            {domain.metadata.title}
          </h1>
          <p
            style={{
              fontSize: "32px",
              fontFamily: "Inter",
              color: "#a0a0a0",
              lineHeight: "1.5",
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {domain.metadata.description}
          </p>

          {/* Primary color accent dot */}
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#E78A53",
              marginTop: "8px",
            }}
          />
        </div>

        {/* Powered by Yobr - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "18px",
            fontFamily: "Inter",
            color: "#a0a0a0", // Muted foreground
          }}
        >
          <span>powered by</span>
          <img
            src="https://www.yobr.io/logo.svg"
            alt="Yobr"
            width="85"
            height="46"
            style={{
              filter: "brightness(0) invert(1)",
              opacity: 0.8,
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Oxanium",
          data: oxaniumFont,
          style: "normal",
          weight: 600,
        },
        {
          name: "Inter",
          data: interRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: interBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
