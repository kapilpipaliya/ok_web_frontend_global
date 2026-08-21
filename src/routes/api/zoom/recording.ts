import path from "node:path";
import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { serveFileFromDisk } from "~/lib/files/serveFileFromDisk";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

type HistoryItem = {
  id?: string;
  path?: string;
  action?: string;
  at?: string;
  size?: number;
};

function parseHistory(raw: unknown): HistoryItem[] {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw || "[]") : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user?.P?.uuid) {
      throw new APIError("Unauthorized", 401);
    }

    const userId = String(user.P.uuid);
    const url = new URL(request.url);
    const download = url.searchParams.get("download") === "1";
    const recordingId = String(url.searchParams.get("id") || "").trim();

    const result = await dbSession.run(
      `
      MATCH (u:User {uuid: $userId})-[:HasZoomSetting]->(z:ZoomUserSetting)
      RETURN z
      LIMIT 1
    `,
      { userId },
    );

    let setting = result.records[0]
      ? convertNodeToJson(result.records[0].get("z"))
      : null;

    if (!setting) {
      throw new APIError("No Playwright recording found", 404);
    }

    const p = setting.P || {};
    const history = parseHistory(p.zoomRecordingHistoryJson);
    let item: HistoryItem | null = null;

    if (recordingId) {
      item = history.find((entry) => entry.id === recordingId) || null;
    }
    if (!item) {
      item = {
        id: String(p.zoomLastRecordingId || history[0]?.id || ""),
        path: String(p.zoomLastRecordingPath || history[0]?.path || ""),
        action: String(p.zoomLastRecordingAction || history[0]?.action || "zoom"),
        at: String(p.zoomLastRecordingAt || history[0]?.at || ""),
        size: Number(p.zoomLastRecordingSize || history[0]?.size || 0),
      };
    }

    const filePath = String(item.path || "");
    if (!filePath) {
      throw new APIError("No Playwright recording found", 404);
    }

    const action = String(item.action || "zoom");
    const baseName =
      path.basename(filePath) ||
      `${action}-recording.webm`;
    const ext = path.extname(baseName).toLowerCase();
    const contentType =
      ext === ".mp4"
        ? "video/mp4"
        : ext === ".webm"
          ? "video/webm"
          : "application/octet-stream";

    return await serveFileFromDisk(filePath, {
      contentType,
      fileName: baseName,
      rangeHeader: request.headers.get("Range"),
      inline: !download,
      cacheControl: "no-store",
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
