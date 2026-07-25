export type AdminPwaManifest = {
  id: string;
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: "fullscreen";
  orientation: string;
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }>;
};

/** Display name: "{subdomain} Admin" (e.g. "affiliateplatform Admin"). */
export function adminPwaAppName(subDomain: string): string {
  const label = (subDomain || "Admin").trim() || "Admin";
  return `${label} Admin`;
}

export function buildAdminPwaManifest(subDomain: string): AdminPwaManifest {
  const name = adminPwaAppName(subDomain);
  const shortName = (subDomain || "Admin").trim() || "Admin";

  return {
    id: "/admin",
    name,
    short_name: shortName,
    description: `${name} dashboard`,
    start_url: "/admin",
    scope: "/admin",
    display: "fullscreen",
    orientation: "any",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/admin-pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/admin-pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/admin-pwa/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
