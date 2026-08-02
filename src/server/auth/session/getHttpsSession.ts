import { useSession } from "h3";
import { getRequestEvent } from "solid-js/web";

// import crypto from "crypto";
// const generateSecurePassword = () => {
//   return crypto.randomBytes(32).toString('hex');
// };

export async function getHttpsSession() {
  const event = getRequestEvent()?.nativeEvent;
  if (!event) {
    throw new Error("No request event available for session");
  }

  const config = {
    password:
      "971dc95829c77a687451fce0099ec9867b3c54538e5e7f2bcfbc427c5b4bfe1c",
    cookie: {
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      httpOnly: true, // Prevents JavaScript access to the cookie (security best practice)
      secure: true, // Required for SameSite=None
      //sameSite: "lax" as const, // Provides CSRF protection while allowing navigation
      sameSite: "none" as const, // Required for cross-site cookies (iframes, embedded apps)
      path: "/", // Makes the cookie available across your entire site
      // Note: Safari blocks third-party cookies in iframes by default
      // Even with SameSite=None and Secure, Safari's ITP may block cookies
      // Client-side: Use Storage Access API (document.requestStorageAccess()) after user interaction
      // See: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
    },
  };
  return useSession(event, config);
}
