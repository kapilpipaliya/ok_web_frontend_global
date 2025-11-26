import { SearchParams } from "@solidjs/router";

/**
 * Handles Google OAuth sign-in click event.
 * Detects if the page is in an iframe and opens OAuth in a new tab if needed.
 * Otherwise, redirects the current page.
 *
 * @param searchParams - Current URL search parameters to preserve
 */
export function handleGoogleOAuthClick(searchParams: SearchParams): void {
  const params = new URLSearchParams(searchParams as Record<string, string>);

  // Check if page is in an iframe
  const isInIframe = window.self !== window.top;

  if (isInIframe) {
    // Add popup flag to indicate this will be opened in a new tab
    params.set("popup", "true");
  }

  const queryString = params.toString();
  const googleSigninUrl = `/api/auth/google/signin${queryString ? `?${queryString}` : ""}`;

  if (isInIframe) {
    // Open in new tab if in iframe
    window.open(googleSigninUrl, "_blank");
  } else {
    // Normal redirect if not in iframe
    window.location.href = googleSigninUrl;
  }
}
