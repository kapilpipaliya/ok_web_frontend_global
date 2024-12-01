import * as Sentry from "@sentry/solidstart";

Sentry.init({
  dsn: "https://47f377ee22f44bd948db702c8ddac215@o4508393204547584.ingest.de.sentry.io/4508393210314832",

  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
});