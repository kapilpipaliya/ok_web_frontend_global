import { useSession } from "vinxi/http";

// import crypto from "crypto";
// const generateSecurePassword = () => {
//   return crypto.randomBytes(32).toString('hex');
// };

export function getHttpsSession() {
  const config = {
    password:
      "971dc95829c77a687451fce0099ec9867b3c54538e5e7f2bcfbc427c5b4bfe1c",
    cookie: {
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      httpOnly: true, // Prevents JavaScript access to the cookie (security best practice)
      secure: true, // process.env.NODE_ENV === "production",
      //sameSite: "lax" as const, // Provides CSRF protection while allowing navigation
      sameSite: "None" as const, // to work with Google Chrome
      path: "/", // Makes the cookie available across your entire site
    },
  };
  return useSession(config);
}
