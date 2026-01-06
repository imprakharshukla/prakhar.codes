// This file configures the initialization of Sentry for the tRPC API.
// https://docs.sentry.io/platforms/javascript/guides/node/

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://9ec2a13b46326d66490a19ab4900928a@o4509960315469824.ingest.de.sentry.io/4510351741747280",
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,
  sendDefaultPii: true,
  enabled: process.env.NODE_ENV === "production",
});
