import type { APIEvent } from "@solidjs/start/server";

import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

type GwfhVariant = {
  id?: string;
  fontWeight?: string;
  fontStyle?: string;
  ttf?: string;
};

type GwfhResponse = {
  variants?: GwfhVariant[];
};

type ParsedRequest = {
  family: string;
  weight: string;
  style: "normal" | "italic";
};

function parseRequestedFamily(raw: string): ParsedRequest {
  const expanded = raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  const tokens = expanded.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return { family: raw.trim(), weight: "400", style: "normal" };
  }

  let style: "normal" | "italic" = "normal";
  let weight = "400";
  const familyTokens: string[] = [];

  const weightMap: Record<string, string> = {
    thin: "100",
    extralight: "200",
    ultralight: "200",
    light: "300",
    regular: "400",
    normal: "400",
    medium: "500",
    semibold: "600",
    demibold: "600",
    bold: "700",
    extrabold: "800",
    ultrabold: "800",
    black: "900",
    heavy: "900",
  };

  for (const tok of tokens) {
    const t = tok.toLowerCase();
    if (t === "italic") {
      style = "italic";
      continue;
    }
    if (weightMap[t]) {
      weight = weightMap[t];
      continue;
    }
    familyTokens.push(tok);
  }

  const family = familyTokens.join(" ").trim() || expanded;
  return { family, weight, style };
}

function chooseVariant(
  variants: GwfhVariant[],
  desired: ParsedRequest,
): GwfhVariant | null {
  if (!variants.length) return null;

  const exact = variants.find(
    (v) =>
      !!v.ttf &&
      (v.fontWeight || "") === desired.weight &&
      (v.fontStyle || "normal") === desired.style,
  );
  if (exact) return exact;

  const weightMatch = variants.find(
    (v) => !!v.ttf && (v.fontWeight || "") === desired.weight,
  );
  if (weightMatch) return weightMatch;

  return (
    variants.find(
      (v) =>
        v.fontStyle === "normal" &&
        (v.fontWeight === "400" || v.id === "regular") &&
        !!v.ttf,
    ) ||
    variants.find((v) => v.id === "regular" && !!v.ttf) ||
    variants.find((v) => !!v.ttf) ||
    null
  );
}

async function lookupFamilyMeta(family: string): Promise<GwfhResponse | null> {
  const candidates = [
    family,
    family.toLowerCase(),
    family.toLowerCase().replace(/\s+/g, "-"),
  ];

  for (const name of candidates) {
    const metaRes = await fetch(
      `https://gwfh.mranftl.com/api/fonts/${encodeURIComponent(name)}`,
    );
    if (!metaRes.ok) continue;
    return (await metaRes.json()) as GwfhResponse;
  }
  return null;
}

export async function GET({ request }: APIEvent) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      throw new APIError("Sign in required", 401);
    }

    const url = new URL(request.url);
    const rawFamily = (url.searchParams.get("family") || "").trim();
    if (!rawFamily) {
      throw new APIError("Missing required query param: family", 400);
    }

    const desired = parseRequestedFamily(rawFamily);
    const meta = await lookupFamilyMeta(desired.family);
    if (!meta) {
      throw new APIError(
        `Google Fonts lookup failed (family not found: ${desired.family})`,
        404,
      );
    }

    const selected = chooseVariant(meta.variants || [], desired);
    if (!selected?.ttf) {
      throw new APIError(
        "Could not find a downloadable TTF variant for this family",
        404,
      );
    }

    const fontRes = await fetch(selected.ttf);
    if (!fontRes.ok) {
      throw new APIError(`Font download failed (${fontRes.status})`, 400);
    }
    const fontBuf = await fontRes.arrayBuffer();

    return new Response(fontBuf, {
      headers: {
        "Content-Type": "font/ttf",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const handled = handleAPIError(error);
    if (handled instanceof Response) {
      return handled;
    }
    const status = error instanceof APIError ? error.status : 500;
    return new Response(JSON.stringify(handled), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}

