/**
 * Creates a redirect response that works in both web browsers and Capacitor mobile apps.
 *
 * In Capacitor WebViews, HTTP 302 redirects may not work properly, so we return
 * HTML with a client-side JavaScript redirect instead. For web browsers, we use
 * standard HTTP 302 redirects.
 *
 * @param request - The incoming request object
 * @param redirectUrl - The URL to redirect to
 * @returns Response object with appropriate redirect method
 */
export function createRedirectResponse(
  request: Request,
  redirectUrl: string,
): Response {
  // Check if request is from Capacitor mobile app
  const userAgent = request.headers.get("user-agent") || "";
  const isCapacitor = userAgent.toLowerCase().includes("capacitor");

  if (isCapacitor) {
    // For Capacitor, return HTML with client-side redirect
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redirecting...</title>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
        status: 200,
      },
    );
  }

  // For web, use standard HTTP redirect
  return new Response(null, {
    headers: {
      Location: redirectUrl,
    },
    status: 302,
  });
}
