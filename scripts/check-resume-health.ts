#!/usr/bin/env bun

/**
 * Resume Health Monitor
 * Checks if the resume endpoint is serving the live version or falling back to the static 2026 version.
 * Sends a Discord webhook notification if the fallback is detected.
 */

const RESUME_URL = "https://prakhar.codes/resume/latest";
const FALLBACK_FILENAME = "Prakhar_Software_Engineer_Resume_2026.pdf";
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface ResumeCheckResult {
  isHealthy: boolean;
  finalUrl: string;
  message: string;
}

async function checkResumeHealth(): Promise<ResumeCheckResult> {
  try {
    const response = await fetch(RESUME_URL, {
      redirect: "follow",
    });

    const finalUrl = response.url;

    // Check if we're being served the fallback resume
    if (finalUrl.includes(FALLBACK_FILENAME)) {
      return {
        isHealthy: false,
        finalUrl,
        message: `⚠️ Resume endpoint is serving the FALLBACK version (${FALLBACK_FILENAME})`,
      };
    }

    return {
      isHealthy: true,
      finalUrl,
      message: "✅ Resume endpoint is healthy and serving the live version",
    };
  } catch (error) {
    return {
      isHealthy: false,
      finalUrl: "N/A",
      message: `❌ Failed to fetch resume: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function sendDiscordAlert(result: ResumeCheckResult): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) {
    console.error("DISCORD_WEBHOOK_URL environment variable is not set");
    return;
  }

  const embed = {
    title: "🚨 Resume Health Check Alert",
    description: result.message,
    color: 15158332, // Red color
    fields: [
      {
        name: "Endpoint",
        value: RESUME_URL,
        inline: false,
      },
      {
        name: "Final URL",
        value: result.finalUrl,
        inline: false,
      },
      {
        name: "Timestamp",
        value: new Date().toISOString(),
        inline: false,
      },
    ],
    footer: {
      text: "Resume Health Monitor",
    },
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Resume Monitor",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send Discord webhook: ${response.statusText}`);
    } else {
      console.log("Discord notification sent successfully");
    }
  } catch (error) {
    console.error(
      `Error sending Discord webhook: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function main() {
  console.log(`Checking resume health at ${RESUME_URL}...`);

  const result = await checkResumeHealth();

  console.log(result.message);
  console.log(`Final URL: ${result.finalUrl}`);

  if (!result.isHealthy) {
    console.log("Health check failed. Sending Discord alert...");
    await sendDiscordAlert(result);
  } else {
    console.log("Health check passed. No alert needed.");
  }

  // Exit with appropriate code
  process.exit(result.isHealthy ? 0 : 1);
}

main();
