import fs from "node:fs";
import path from "node:path";

import type { APIEvent } from "@solidjs/start/server";

import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "src/page_schema/askdonationreport/askdonationreport_template.json",
);

export async function GET({ request }: APIEvent) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      throw new APIError("Sign in required", 401);
    }
    if (!fs.existsSync(TEMPLATE_PATH)) {
      throw new APIError("Template file not found", 404);
    }
    const raw = fs.readFileSync(TEMPLATE_PATH, "utf8");
    return new Response(raw, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "private, no-store",
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
